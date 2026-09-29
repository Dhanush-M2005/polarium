# POLARIUM: National Polar Data & Outreach Repository
### Official Technical Architecture & System Documentation
**Ministry of Earth Sciences (MoES) | National Centre for Polar and Ocean Research (NCPOR)**  
*Government of India*

---

## Executive Summary

**POLARIUM** is the centralized, sovereign scientific knowledge platform and outreach engine for India's polar research endeavors across Antarctica, the Arctic, and the Himalayas. Developed for the **National Centre for Polar and Ocean Research (NCPOR)** under the aegis of the **Ministry of Earth Sciences (MoES)**, Government of India, the platform unifies four decades of fragmented scientific expeditions, sensory telemetry, high-resolution monographs, and media archives into a **Relational Knowledge Graph** and **Strict Hybrid Retrieval-Augmented Generation (RAG)** system.

The platform complies with the **Guidelines for Indian Government Websites (GIGW)**, utilizing an institutional Light Government UI (Navy `#082b57`, White, Slate Gray), sovereign local embeddings, and an automated bilingual outreach studio designed for national science dissemination and Viksit Bharat 2047 goals.

---

## 1. Project Overview & Problem Statement

### The Problem: Fragmented Polar Research Silos
India has maintained continuous Antarctic scientific operations since 1981 (spanning the *Dakshin Gangotri*, *Maitri*, and *Bharati* stations), established the *Himadri* Arctic station in Ny-Ålesund in 2008, deployed the *IndARC* sub-surface moored observatory, and monitors high-altitude cryospheric mass balance at the *Himansh* observatory in the Himalayas.

Historically, this multi-decade scientific endeavor faced critical data challenges:
1. **Data Silos**: Scientific monographs, meteorological NetCDF files, ice-core drill logs, and expedition photography were stored across disconnected repositories, physical report archives, and standalone file servers.
2. **Accessibility Barriers**: Researchers, university educators, and the public could not easily correlate an expedition with its respective scientific datasets, publications, and raw telemetry.
3. **Outreach & Public Dissemination Latency**: Synthesizing dense 150-page scientific monographs into public outreach briefs, Press Information Bureau (PIB) releases, and classroom lesson plans required days of manual effort by scientific officers.

### The Solution: POLARIUM
POLARIUM replaces scattered archives with a unified **Hub-and-Spoke Relational Knowledge Graph** coupled with **Dhruv AI**, a localized, hallucination-resistant Polar Knowledge Assistant. POLARIUM provides:
- **Unified Knowledge Discovery**: Instant access to expedition hubs, declassified monographs, sensor telemetry, and multimedia.
- **3D Interactive GIS Globe**: Real-time WebGL visualization of active stations (*Bharati*, *Maitri*, *Himadri*, and *Himansh*) and historical traverses.
- **Strict Verification RAG**: Zero-hallucination semantic question answering strictly bounded by verified NCPOR expedition documents with exact page-level citations.
- **Human-in-the-Loop Outreach Studio**: Automated multi-channel generation of press releases, scientific articles, and bilingual educational tools.

---

## 2. Stakeholders & Role-Based Access Control (RBAC)

POLARIUM serves three primary user personas, each with distinct permission tiers and UI workspaces:

```
+-----------------------------------------------------------------------------------+
|                                 POLARIUM SYSTEM                                   |
+--------------------------+------------------------------+-------------------------+
|    PUBLIC & EDUCATORS    |   SCIENTISTS & RESEARCHERS   |     ADMIN & PRO TEAM    |
| (Polar Hub & Learn Lab)  |  (Knowledge Repository/Data) |    (Outreach Studio)    |
+--------------------------+------------------------------+-------------------------+
| - Interactive 3D GIS     | - Full-text PDF Monographs   | - Campaign Configuration|
| - Audio Summaries (TTS)  | - Telemetry Data Previews    | - Channel-specific LLM  |
| - 5-Question AI Quizzes  | - 384-dim Vector Search      | - Bilingual Translation |
| - Science Flashcards     | - Cosine Similarity Ranked   | - Media Asset Bundling  |
| - Lesson Plans (GIGW)    | - Exact Document Citations   | - Human Review/Approval |
+--------------------------+------------------------------+-------------------------+
```

### 1. The Public, Students & Educators
- **Primary Workspaces**: `/` (Home GIS), `/polar-hub` (Educator Studio), `/media-gallery`.
- **Capabilities**:
  - Interactive exploration of stations on the 3D globe.
  - Generating dynamic 5-question quizzes with scoring and instant answer explanations.
  - Flashcard-based scientific study guides (e.g., $\delta^{18}\text{O}$ isotope ratios, katabatic wind dynamics).
  - Audio monograph briefing synthesized directly from expedition summaries.
  - Full adherence to accessibility standards and bilingual support (English/Hindi).

### 2. Scientists, Glaciologists & Climate Researchers
- **Primary Workspaces**: `/knowledge-repository`, `/polar-hub` (Research & Analytics), `/search`.
- **Capabilities**:
  - Direct access to official PDF monographs in a split-screen viewer.
  - 12-month Automated Weather Station (AWS) sensor telemetry previews (temperature, barometric pressure, wind velocity).
  - Natural-language semantic queries via **Dhruv AI** with guaranteed document citations (`[43rd IAE, Doc #043-01]`).
  - Search filtered strictly by polar region (*Antarctica*, *Arctic*, *Himalaya*) and station.

### 3. MoES Administrators & Public Relations Officers (PROs)
- **Primary Workspaces**: `/Admin-Dashboard` (Outreach Studio).
- **Capabilities**:
  - **Human-in-the-Loop (HITL)** editorial pipeline: no outreach content is published without officer authorization.
  - Dynamic generation of tailored content:
    - *Twitter/X*: 4-tweet thread with hashtags and key metrics.
    - *Website Article*: Long-form structured Markdown document.
    - *PIB Press Release*: Formal government media release format.
  - Instant bilingual translation between English and Hindi.
  - Expedition-bounded media asset selection for high-resolution photo bundling.

---

## 3. Complete Technology Stack

| Layer | Technology | Version | Purpose & Strategic Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Next.js** | `14.2.15` | Modern App Router, Server-Side Rendering (SSR), and static optimization. |
| **Language** | **TypeScript** | `5.6.3` | Strict type safety across Knowledge Graph nodes, API payloads, and state models. |
| **Styling & Design** | **Tailwind CSS** | `3.4.14` | GIGW-compliant government aesthetic (Deep Navy `#082b57`, White, Slate Gray). |
| **3D Geospatial Engine** | **globe.gl** & **Three.js** | `2.46.2` | WebGL-accelerated 3D globe rendering polar coordinates, station markers, and rings. |
| **Icons & Typography** | **lucide-react** | `0.453.0` | Minimalist, professional iconography aligned with official portals. |
| **Markdown Engine** | **react-markdown** | `10.1.0` | Dynamic rendering of structured scientific responses, lists, and bold text. |
| **Backend API** | **FastAPI** | `>=0.115.0`| High-throughput asynchronous ASGI microservice with automated OpenAPI docs. |
| **ASGI Server** | **Uvicorn** | `>=0.30.0` | Production ASGI web server running on port 8000. |
| **Embeddings (Local)** | **HuggingFace** (`all-MiniLM-L6-v2`)| Native | 384-dimensional dense vectors running locally at **zero cost** with 100% data privacy. |
| **Vector Vault & DB** | **Supabase (PostgreSQL 15)**| `pgvector` | Cloud relational database with IVFFlat cosine distance indexing for RAG retrieval. |
| **RAG Orchestrator** | **LangChain** | `>=0.3.0`  | Document loading (`PyPDFLoader`), chunking, prompt templating, and chain execution. |
| **Inference LLM** | **Groq API** (`llama-3-8b-8192`)| Cloud LPU | Ultra-low latency inference (~500 tokens/sec) for instant Q&A and outreach drafts. |

---

## 4. Data Pipeline & RAG Architecture

POLARIUM employs a **Hub-and-Spoke Relational Model** combined with a **Hybrid Vector Vault** to ensure data integrity and prevent AI hallucination.

```
                      +-----------------------------+
                      |       Raw Data Ingestion    |
                      | (PDF Reports, Datasets, CSV)|
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      | PyPDFLoader & Text Chunking |
                      | (Chunk: 500, Overlap: 50)   |
                      +--------------+--------------+
                                     |
                                     v
               +-------------------------------------------+
               | HuggingFace "all-MiniLM-L6-v2" (Local)    |
               | Generates 384-Dimensional Dense Vectors   |
               +---------------------+---------------------+
                                     |
                                     v
                      +-----------------------------+
                      |   Supabase PostgreSQL DB    |
                      |   "official_reports" table  |
                      |   "report_chunks" + pgvector|
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
+-------------------------------+           +-------------------------------+
|     Vector Similarity Search  |           |   Relational Knowledge Graph  |
|  (pgvector Cosine Distance)   |           |    (Hub-and-Spoke Traversal)  |
+---------------+---------------+           +---------------+---------------+
                |                                           |
                +---------------------+---------------------+
                                      |
                                      v
                      +-----------------------------+
                      |   Expedition Context Filter |
                      | (Strict Anti-Contamination) |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |   Groq API (Llama-3-8b)     |
                      | Strict Grounded Prompting   |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |    Dhruv AI Verified Output |
                      |  (Markdown + Real Citations)|
                      +-----------------------------+
```

### 1. The Hub-and-Spoke Relational Model
- **The Hub (`ExpeditionHub`)**: The foundational entity (e.g., `exp-043` for the *43rd Indian Scientific Expedition to Antarctica*). Contains metadata including mission year, lead scientist, region, coordinates, objectives, and summary.
- **The Spokes**:
  - `documents`: Official declassified monographs, survey records, and research bulletins.
  - `datasets`: NetCDF and CSV Automated Weather Station (AWS) meteorological telemetry.
  - `media`: Authenticated photographic and satellite assets tagged by station and expedition.

### 2. Ingestion & Vector Storage Pipeline
1. **Document Loading**: `PyPDFLoader` ingests PDF documents from `./public/reports/`.
2. **Text Splitting**: `RecursiveCharacterTextSplitter` segments text into 500-character chunks with a 50-character overlap to preserve semantic continuity.
3. **Local Vectorization**: HuggingFace `all-MiniLM-L6-v2` embeds each chunk into a 384-dimensional floating-point vector. This runs entirely in memory without sending raw text to third-party embedding APIs.
4. **Vault Insertion**: Chunks are stored in the Supabase PostgreSQL table `report_chunks` equipped with `pgvector` indexing:
   ```sql
   create table report_chunks (
       id uuid primary key default gen_random_uuid(),
       report_id text references official_reports(id),
       content text not null,
       page_number integer not null,
       embedding vector(384)
   );
   ```

### 3. Strict Verification RAG Logic (Anti-Hallucination)
When a user submits a query to **Dhruv AI**:
1. **Query Embedding**: The query is vectorized using `all-MiniLM-L6-v2`.
2. **Cascading Filter Enforcement**: If the user is viewing *Himadri Station (Arctic)*, the backend restricts vector matching strictly to Arctic chunks (`exp-arc-015`), completely eliminating cross-polar contamination.
3. **Similarity Retrieval**: Supabase executes the RPC function `match_report_chunks` using cosine similarity (`1 - (embedding <=> query_embedding)`).
4. **Grounded Prompting**: The retrieved chunks are provided to the Groq Llama-3-8b engine with an unyielding system prompt:
   > *"You are a professional MoES polar research scientist. Answer using ONLY the retrieved context. Format your answer clearly using markdown bullet points and bold text for readability. Do not manually type a 'Sources:' list at the bottom of your text, as the UI handles citations automatically."*
5. **Sanitization**: The backend cleans internal XML/context tags and extracts source references into an independent `citations` array, rendered in the UI as verified document pills (`[43rd IAE, Doc #043-01]`).

---

## 5. Core Component & Workspace Breakdown

### 1. Public Homepage & 3D Interactive GIS (`/`)
- **3D Geospatial Globe**: Built using `globe.gl` and Three.js. Automatically marks India's stations:
  - *Bharati Station*: Larsemann Hills, Antarctica ($69.406^\circ\text{S}, 76.195^\circ\text{E}$)
  - *Maitri Station*: Schirmacher Oasis, Antarctica ($70.767^\circ\text{S}, 11.733^\circ\text{E}$)
  - *Himadri Station*: Ny-Ålesund, Svalbard, Arctic ($78.924^\circ\text{N}, 11.928^\circ\text{E}$)
  - *Himansh Observatory*: Chandra Basin, Himalaya ($32.417^\circ\text{N}, 77.617^\circ\text{E}$)
- **Global Semantic Search**: Real-time typeahead querying the knowledge graph with cosine similarity scoring, routing directly to expedition hubs.
- **Recent Telemetry & Datasets**: Live data grid presenting latest telemetry archives with direct metadata links.

### 2. Knowledge Repository (`/knowledge-repository`) & Media Gallery (`/media-gallery`)
- **Faceted Data Exploration**: Search across expeditions, glaciology monographs, NetCDF datasets, and publications.
- **Media Archives**: High-resolution photography categorised by polar station, glaciological traverse, and flora/fauna observations.

### 3. Polar Hub (`/polar-hub`)
The flagship interactive research and educational workspace:
- **Filter Hub Bar**: Cascading dropdowns (`Station` $\rightarrow$ `Expedition`) with strict React state synchronization. Selecting *Himadri Station* resets the mission selector to show exclusively Arctic campaigns.
- **Split-Screen PDF Monograph Viewer**: Embedded iframe displaying the complete declassified expedition PDF with direct download and new-tab capabilities.
- **Functional Audio Brief**: Integrated speech synthesizer reading mission discoveries with play/pause controls, elapsed timers (`0:00 / 2:30`), and an animated sound equalizer.
- **Three Core Intelligence Tabs**:
  1. **Research & Analytics**: Mission research synthesis, key scientific milestones, and an interactive 12-month AWS meteorological chart with CSV table preview.
  2. **Ask Dhruv AI**: Markdown-rendered chat assistant providing grounded answers with document citations.
  3. **Educator Studio**:
     - *5-Question Quiz*: Auto-generated multiple-choice questions with answer tracking and score computation.
     - *Flashcards*: Interactive flip cards covering core concepts like ice core $\delta^{18}\text{O}$ and microgrids.
     - *Lesson Plan Studio*: Structured 45-minute lesson plans formatted for secondary and collegiate curricula.

### 4. Admin Dashboard - Outreach Studio (`/Admin-Dashboard`)
A Human-in-the-Loop communications engine for MoES press officers:
- **Campaign Configuration**: Select Station, Expedition Hub, Target Audience (*General Public*, *Scientific Community*, *Students*), and Channel.
- **Channel-Adaptive Prompting**:
  - *Twitter/X*: Thread of 4 concise posts with hashtags and metric highlights.
  - *Website Article*: Multi-section Markdown article with headers, key takeaways, and conclusions.
  - *Press Release*: Formal PIB media advisory including date, location, and official commendations.
- **Bilingual Dissemination**: One-click generation in English, Hindi, or dual-language format.
- **Dual View Editor**: Toggle between a formatted live preview (`ReactMarkdown`) and a monospace text editor.
- **Media Bundling**: Select authenticated expedition imagery to accompany the release.
- **Sign-Off Action**: Single-click `"Approve & Publish"` action logging dissemination readiness.

---

## 6. Local Setup & Installation Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Python**: `v3.10` or higher
- **Git**
- **Supabase Account** (PostgreSQL with `pgvector`)
- **Groq Cloud API Key**

### 1. Clone the Repository
```bash
git clone https://github.com/kavitha814/Polarsearch.git
cd Polarsearch
```

### 2. Backend Setup (FastAPI)
```bash
cd backend

# Create and activate Python virtual environment
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\activate
# Linux / macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file in backend/ directory
# Add the following configuration:
# SUPABASE_URL=https://your-supabase-project.supabase.co
# SUPABASE_KEY=your-supabase-anon-or-service-key
# GROQ_API_KEY=gsk_your_groq_api_key_here
# GROQ_MODEL=llama-3-8b-8192

# Start the FastAPI service
uvicorn main:app --reload --port 8000
```
*The backend API will be live at `http://127.0.0.1:8000` (Interactive Swagger Docs at `http://127.0.0.1:8000/docs`).*

### 3. Frontend Setup (Next.js)
```bash
# Open a new terminal in the project root directory
cd Polarsearch

# Install npm dependencies
npm install

# Run the development server
npm run dev
```
*The frontend portal will be live at `http://localhost:3000`.*

---

## 7. Verification & Testing Checklist

- [x] **Global Header De-duplication**: Single State Emblem and MoES strip on top; white strip below with single `"Admin Portal"` button.
- [x] **Cascading Dropdowns**: Station dropdown cascades to matching expeditions; resets cleanly when station changes.
- [x] **Single Dropdown Chevrons**: `appearance-none` applied to all selects, eliminating duplicate OS arrows.
- [x] **Markdown Rendering**: Dhruv AI chat bubbles parse bullet points, bold tags, and paragraphs via `react-markdown` and Tailwind `prose`.
- [x] **Zero AI Buzzwords**: Removed all informal tags (`Grounded MoES LLM`, `Prompt Engine`, `Verified RAG`).
- [x] **GIGW Minimalist Footer**: Short, dark navy blue (`#082b57`) footer with required institutional links and copyright notice.
- [x] **Zero TypeScript Errors**: Verified clean build via `npx tsc --noEmit`.

---

## 8. License & Governance

This project is developed under the national research directives of the **National Centre for Polar and Ocean Research (NCPOR)**, **Ministry of Earth Sciences (MoES)**, Government of India. All expedition data, monographs, and research summaries remain the sovereign property of the Government of India.
