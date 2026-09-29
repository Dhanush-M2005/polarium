#!/usr/bin/env python3
"""
=============================================================================
POLARIUM - NCPOR Data & Asset Web Crawler / Scraper
=============================================================================
Target Domains:
  • https://ncpor.res.in (and subpages like /libraries, /publications, etc.)
  • http://www.ncaor.gov.in (Legacy portal)

Assets Extracted & Categorized:
  1. PDF Documents & Monographs -> raw_knowledge_base/scraped_documents/
  2. Data Files (CSV, XLSX, ZIP, NC, DAT) -> raw_knowledge_base/Datasets/scraped/
  3. Media & Images (JPG, PNG, GIF, WEBP) -> public/knowledge_media/scraped/
  4. Web Page Text Content -> raw_knowledge_base/scraped_pages/
=============================================================================
"""

import os
import sys
import re
import time
import json
import urllib.parse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from bs4 import BeautifulSoup
import urllib3
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn

# Suppress insecure HTTPS warnings if government SSL cert chain has legacy issues
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

console = Console(force_terminal=True, legacy_windows=False)

# Configuration & Paths
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
RAW_KB_DIR = WORKSPACE_ROOT / "raw_knowledge_base"
DOCS_DIR = RAW_KB_DIR / "scraped_documents"
DATASETS_DIR = RAW_KB_DIR / "Datasets" / "scraped"
PAGES_DIR = RAW_KB_DIR / "scraped_pages"
MEDIA_DIR = WORKSPACE_ROOT / "public" / "knowledge_media" / "scraped"
MANIFEST_FILE = RAW_KB_DIR / "crawl_manifest.json"

for d in [DOCS_DIR, DATASETS_DIR, PAGES_DIR, MEDIA_DIR]:
    d.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
}

START_URLS = [
    "https://ncpor.res.in/",
    "https://ncpor.res.in/libraries",
    "https://ncpor.res.in/publications",
    "https://ncpor.res.in/expeditions",
    "https://ncpor.res.in/media",
    "http://www.ncaor.gov.in/",
    "http://14.139.119.23:8080/dspace/community-list",
]

ALLOWED_DOMAINS = ["ncpor.res.in", "ncaor.gov.in", "14.139.119.23"]

DOC_EXTENSIONS = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt"}
DATA_EXTENSIONS = {".csv", ".xlsx", ".xls", ".zip", ".nc", ".dat", ".hdf5", ".tar", ".gz"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"}


class NCPORCrawler:
    def __init__(self, max_depth: int = 2, max_pages: int = 50):
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.visited_urls = set()
        self.downloaded_assets = set()
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.manifest = {
            "crawled_pages": [],
            "downloaded_docs": [],
            "downloaded_data": [],
            "downloaded_media": [],
            "failed_urls": []
        }

    def is_allowed_domain(self, url: str) -> bool:
        parsed = urllib.parse.urlparse(url)
        return any(domain in parsed.netloc for domain in ALLOWED_DOMAINS)

    def sanitize_filename(self, filename: str) -> str:
        clean = re.sub(r'[\\/*?:"<>|]', '_', filename)
        return clean[:120]

    def download_file(self, url: str, target_dir: Path) -> str | None:
        if url in self.downloaded_assets:
            return None
        self.downloaded_assets.add(url)

        try:
            parsed = urllib.parse.urlparse(url)
            base_name = os.path.basename(parsed.path) or f"asset_{int(time.time())}"
            base_name = self.sanitize_filename(base_name)
            
            # Ensure extension
            ext = os.path.splitext(base_name)[1]
            if not ext:
                base_name += ".bin"

            save_path = target_dir / base_name
            
            # Stream download
            res = self.session.get(url, timeout=20, verify=False, stream=True)
            if res.status_code == 200:
                with open(save_path, "wb") as f:
                    for chunk in res.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                return str(save_path)
        except Exception as e:
            self.manifest["failed_urls"].append({"url": url, "error": str(e)})
        return None

    def crawl_page(self, url: str, depth: int = 0):
        if depth > self.max_depth or len(self.visited_urls) >= self.max_pages:
            return
        if url in self.visited_urls:
            return

        self.visited_urls.add(url)
        console.print(f"[cyan][Depth {depth}][/cyan] Crawling: [yellow]{url}[/yellow]")

        try:
            res = self.session.get(url, timeout=15, verify=False)
            if res.status_code != 200:
                return

            content_type = res.headers.get("Content-Type", "").lower()
            if "text/html" not in content_type:
                return

            soup = BeautifulSoup(res.text, "html.parser")

            # Extract main text
            title = soup.title.string.strip() if soup.title and soup.title.string else url
            text_content = soup.get_text(separator="\n", strip=True)

            page_data = {
                "title": title,
                "url": url,
                "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "content": text_content[:15000] # First 15k chars
            }

            page_file = PAGES_DIR / f"page_{len(self.visited_urls)}_{self.sanitize_filename(title)}.json"
            with open(page_file, "w", encoding="utf-8") as f:
                json.dump(page_data, f, indent=2, ensure_ascii=False)

            self.manifest["crawled_pages"].append({"url": url, "title": title, "file": str(page_file)})

            # Find all links
            links_to_crawl = []
            for tag in soup.find_all(["a", "img", "iframe"], href=True) + soup.find_all("img", src=True):
                raw_href = tag.get("href") or tag.get("src")
                if not raw_href or raw_href.startswith("javascript:") or raw_href.startswith("#"):
                    continue

                full_url = urllib.parse.urljoin(url, raw_href)
                parsed = urllib.parse.urlparse(full_url)
                path = parsed.path.lower()
                ext = os.path.splitext(path)[1]

                is_doc = ext in DOC_EXTENSIONS or "bitstream" in path or "pdf" in path or "/retrieve/" in path
                is_data = ext in DATA_EXTENSIONS or "dataset" in path or "telemetry" in path
                is_image = ext in IMAGE_EXTENSIONS

                if is_doc:
                    downloaded = self.download_file(full_url, DOCS_DIR)
                    if downloaded:
                        console.print(f"  [green][+] Downloaded Document:[/green] {os.path.basename(downloaded)}")
                        self.manifest["downloaded_docs"].append(downloaded)

                elif is_data:
                    downloaded = self.download_file(full_url, DATASETS_DIR)
                    if downloaded:
                        console.print(f"  [green][+] Downloaded Dataset:[/green] {os.path.basename(downloaded)}")
                        self.manifest["downloaded_data"].append(downloaded)

                elif is_image:
                    # Skip tiny icons
                    if "logo" not in path and "icon" not in path:
                        downloaded = self.download_file(full_url, MEDIA_DIR)
                        if downloaded:
                            console.print(f"  [green][+] Downloaded Image:[/green] {os.path.basename(downloaded)}")
                            self.manifest["downloaded_media"].append(downloaded)

                elif self.is_allowed_domain(full_url) and depth < self.max_depth:
                    # Ignore repetitive nav links
                    skip_words = ["advanced-search", "browse-author", "browse-title", "browse-date", "subscribe", "mydspace", "screenreaderaccess", "language"]
                    if not any(sw in path for sw in skip_words):
                        links_to_crawl.append(full_url)

            # Sort links to prioritize DSpace handles, collections, and publications first
            links_to_crawl.sort(key=lambda u: 0 if any(k in u for k in ["/handle/", "/community", "/collection", "report", "pub"]) else 1)

            # Recurse subpages
            for next_url in links_to_crawl[:25]:
                if len(self.visited_urls) < self.max_pages:
                    time.sleep(0.3) # Polite delay
                    self.crawl_page(next_url, depth + 1)

        except Exception as e:
            console.print(f"[red]Error crawling {url}: {e}[/red]")
            self.manifest["failed_urls"].append({"url": url, "error": str(e)})

    def run(self):
        console.print("[bold green]Starting NCPOR Data & Asset Web Crawler...[/bold green]")
        for start_url in START_URLS:
            if len(self.visited_urls) < self.max_pages:
                self.crawl_page(start_url, depth=0)

        # Save manifest
        with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
            json.dump(self.manifest, f, indent=2)

        console.print(f"\n[bold green]Crawl Completed Successfully![/bold green]")
        console.print(f"• Pages Scraped: [yellow]{len(self.manifest['crawled_pages'])}[/yellow]")
        console.print(f"• Documents Downloaded: [yellow]{len(self.manifest['downloaded_docs'])}[/yellow]")
        console.print(f"• Datasets Downloaded: [yellow]{len(self.manifest['downloaded_data'])}[/yellow]")
        console.print(f"• Media Files Downloaded: [yellow]{len(self.manifest['downloaded_media'])}[/yellow]")
        console.print(f"• Manifest Saved: [cyan]{MANIFEST_FILE}[/cyan]")


if __name__ == "__main__":
    crawler = NCPORCrawler(max_depth=4, max_pages=80)
    crawler.run()
