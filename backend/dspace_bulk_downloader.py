#!/usr/bin/env python3
"""
=============================================================================
POLARIUM - High-Performance DSpace Bulk PDF Downloader
=============================================================================
Purpose:
  Recursively traverses the NCPOR DSpace Digital Repository (at
  http://14.139.119.23:8080/dspace/) through all Communities, Sub-Collections,
  and Items to extract and download ALL 500+ scientific PDFs.

Saved Destination:
  raw_knowledge_base/scraped_documents/
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
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn, MofNCompleteColumn

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

console = Console(force_terminal=True, legacy_windows=False)

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
RAW_KB_DIR = WORKSPACE_ROOT / "raw_knowledge_base"
DOCS_DIR = RAW_KB_DIR / "scraped_documents"
DOCS_DIR.mkdir(parents=True, exist_ok=True)
MANIFEST_FILE = RAW_KB_DIR / "dspace_harvest_manifest.json"

BASE_DSPACE_URL = "http://14.139.119.23:8080/dspace"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
}


class DSpaceHarvester:
    def __init__(self, max_threads: int = 8, max_pdfs: int = 600):
        self.max_threads = max_threads
        self.max_pdfs = max_pdfs
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.visited_handles = set()
        self.bitstream_urls = set()
        self.downloaded_files = []
        self.failed_urls = []

    def sanitize_filename(self, filename: str) -> str:
        clean = urllib.parse.unquote(filename)
        clean = re.sub(r'[\\/*?:"<>|]', '_', clean)
        return clean[:120]

    def discover_handles_and_bitstreams(self, start_url: str, depth: int = 0, max_depth: int = 6):
        if depth > max_depth or start_url in self.visited_handles or len(self.bitstream_urls) >= self.max_pdfs:
            return

        self.visited_handles.add(start_url)
        console.print(f"[cyan][Discovery Depth {depth}][/cyan] Scanning: [yellow]{start_url}[/yellow]")

        try:
            res = self.session.get(start_url, timeout=12, verify=False)
            if res.status_code != 200:
                return

            soup = BeautifulSoup(res.text, "html.parser")

            sub_handles = []
            for a in soup.find_all("a", href=True):
                href = a["href"]
                full_url = urllib.parse.urljoin(start_url, href)

                # Check for bitstream (PDF) link
                if "/bitstream/" in href or "/retrieve/" in href or href.lower().endswith(".pdf"):
                    if full_url not in self.bitstream_urls:
                        self.bitstream_urls.add(full_url)
                        console.print(f"  [green][+] Discovered PDF #{len(self.bitstream_urls)}:[/green] {os.path.basename(urllib.parse.urlparse(full_url).path)}")

                # Check for handle links
                elif "/dspace/handle/123456789/" in href:
                    clean_handle = full_url.split("?")[0].split("#")[0]
                    if clean_handle not in self.visited_handles:
                        sub_handles.append(clean_handle)

            # Recurse into sub-handles
            for handle_url in sub_handles:
                if len(self.bitstream_urls) < self.max_pdfs:
                    self.discover_handles_and_bitstreams(handle_url, depth + 1, max_depth)

        except Exception as e:
            console.print(f"[red]Error scanning {start_url}: {e}[/red]")

    def download_single_pdf(self, pdf_url: str) -> str | None:
        try:
            parsed = urllib.parse.urlparse(pdf_url)
            filename = os.path.basename(parsed.path) or f"report_{int(time.time())}.pdf"
            if not filename.lower().endswith(".pdf"):
                filename += ".pdf"

            filename = self.sanitize_filename(filename)
            save_path = DOCS_DIR / filename

            # Avoid re-downloading if already present
            if save_path.exists() and save_path.stat().st_size > 1000:
                return str(save_path)

            res = self.session.get(pdf_url, timeout=30, verify=False, stream=True)
            if res.status_code == 200:
                with open(save_path, "wb") as f:
                    for chunk in res.iter_content(chunk_size=16384):
                        if chunk:
                            f.write(chunk)
                return str(save_path)
        except Exception as e:
            self.failed_urls.append({"url": pdf_url, "error": str(e)})
        return None

    def harvest_all(self):
        console.print("[bold green]=======================================================[/bold green]")
        console.print("[bold green]  NCPOR DSpace Bulk Scientific PDF Harvester Engine   [/bold green]")
        console.print("[bold green]=======================================================[/bold green]\n")

        # Step 1: Discover handles starting from community list & browse pages
        seed_urls = [
            f"{BASE_DSPACE_URL}/community-list",
            f"{BASE_DSPACE_URL}/browse-title",
            f"{BASE_DSPACE_URL}/browse-author",
            f"{BASE_DSPACE_URL}/browse-date",
        ]

        for seed in seed_urls:
            if len(self.bitstream_urls) < self.max_pdfs:
                self.discover_handles_and_bitstreams(seed, depth=0, max_depth=6)

        console.print(f"\n[bold green][+] Total PDF Bitstreams Discovered: {len(self.bitstream_urls)}[/bold green]\n")

        # Step 2: Multi-threaded Bulk Download
        if self.bitstream_urls:
            console.print(f"[cyan]Downloading PDFs concurrently with {self.max_threads} worker threads...[/cyan]")
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                MofNCompleteColumn(),
                TimeElapsedColumn(),
                console=console
            ) as progress:
                task = progress.add_task("Harvesting PDFs...", total=len(self.bitstream_urls))
                
                with ThreadPoolExecutor(max_workers=self.max_threads) as executor:
                    future_to_url = {executor.submit(self.download_single_pdf, url): url for url in self.bitstream_urls}
                    for future in as_completed(future_to_url):
                        result = future.result()
                        if result:
                            self.downloaded_files.append(result)
                        progress.advance(task)

        # Save harvest manifest
        manifest = {
            "total_discovered": len(self.bitstream_urls),
            "total_downloaded": len(self.downloaded_files),
            "downloaded_files": self.downloaded_files,
            "failed_urls": self.failed_urls
        }
        with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)

        console.print(f"\n[bold green][✓] DSpace Bulk PDF Harvest Completed![/bold green]")
        console.print(f"• Total Downloaded PDFs: [yellow]{len(self.downloaded_files)}[/yellow]")
        console.print(f"• Saved Folder: [cyan]{DOCS_DIR}[/cyan]")
        console.print(f"• Manifest Saved: [cyan]{MANIFEST_FILE}[/cyan]\n")


if __name__ == "__main__":
    harvester = DSpaceHarvester(max_threads=8, max_pdfs=500)
    harvester.harvest_all()
