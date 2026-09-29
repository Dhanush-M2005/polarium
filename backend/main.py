import os
import re
import json
import tempfile
import uuid
from pathlib import Path
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, status
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# LangChain components
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.messages import SystemMessage, HumanMessage

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
if GROQ_MODEL in ["llama3-8b-8192", "llama-3.1-8b-instant"]:
    GROQ_MODEL = "openai/gpt-oss-120b"
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# Knowledge Graph file path
BASE_DIR = Path(__file__).resolve().parent.parent
KNOWLEDGE_GRAPH_PATH = BASE_DIR / "lib" / "data" / "knowledge-graph.json"
if not KNOWLEDGE_GRAPH_PATH.exists():
    KNOWLEDGE_GRAPH_PATH = BASE_DIR / "public" / "knowledge_graph.json"

# Global instances for reuse
_supabase_client = None
_embeddings = None
_groq_llm = None
_knowledge_graph = None
_cached_search_vectors = None


def get_supabase_client():
    global _supabase_client
    if _supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_KEY in .env",
            )
        from supabase import create_client
        clean_url = SUPABASE_URL.rstrip('/')
        if clean_url.endswith('/rest/v1'):
            clean_url = clean_url[:-8].rstrip('/')
        _supabase_client = create_client(clean_url, SUPABASE_KEY)
    return _supabase_client


def get_embeddings():
    global _embeddings
    if _embeddings is None:
        try:
            from langchain_huggingface import HuggingFaceEmbeddings
            _embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
        except Exception:
            from langchain_community.embeddings import HuggingFaceEmbeddings
            _embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
    return _embeddings


def get_groq_llm(temperature: float = 0.2):
    global _groq_llm
    if not GROQ_API_KEY:
        return None
    try:
        from langchain_groq import ChatGroq
        active_model = GROQ_MODEL
        return ChatGroq(
            model=active_model,
            groq_api_key=GROQ_API_KEY,
            temperature=temperature,
        )
    except Exception as e:
        print(f"ChatGroq initialization notice: {e}")
        return None


def load_knowledge_graph_data() -> Dict[str, Any]:
    global _knowledge_graph
    if _knowledge_graph is None:
        if KNOWLEDGE_GRAPH_PATH.exists():
            with open(KNOWLEDGE_GRAPH_PATH, "r", encoding="utf-8") as f:
                _knowledge_graph = json.load(f)
        else:
            _knowledge_graph = {
                "expeditions": [],
                "datasets": [],
                "documents": [],
                "media": []
            }
    return _knowledge_graph


def cosine_sim(v1, v2) -> float:
    a = np.array(v1, dtype=np.float32)
    b = np.array(v2, dtype=np.float32)
    dot = np.dot(a, b)
    norm = np.linalg.norm(a) * np.linalg.norm(b)
    if norm == 0:
        return 0.0
    return float(dot / norm)


import sys

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=================================================================")
    print("[STARTUP] Dhruv AI Backend (FastAPI + LangChain + Supabase + Groq)")
    print(f"* LLM Model: {GROQ_MODEL}")
    print(f"* Embedding: {EMBEDDING_MODEL_NAME}")
    print(f"* Knowledge Graph: {KNOWLEDGE_GRAPH_PATH} (Exists: {KNOWLEDGE_GRAPH_PATH.exists()})")
    print("=================================================================")
    yield


app = FastAPI(
    title="Dhruv AI - Polar Research Intelligence Backend",
    version="2.0.0",
    description="FastAPI service powering Knowledge Graph RAG, Quiz Studio, and Outreach Dissemination for POLARIUM.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================================================================
# Request & Response Models
# ==============================================================================

class AskDhruvRequest(BaseModel):
    query: str = Field(..., min_length=2, example="What did the 43rd expedition discover?")
    report_id: Optional[str] = Field(None, example="43-IAE-2023")
    expedition_id: Optional[str] = Field(None, example="exp-043")
    match_count: int = Field(default=5, ge=1, le=15)
    language: Optional[str] = Field(default="en", example="hi")


class AskDhruvResponse(BaseModel):
    answer: str
    query: str
    report_id: Optional[str] = None
    expedition_id: Optional[str] = None
    citations: List[str]
    matched_chunks: int


class QuizRequest(BaseModel):
    expedition_id: Optional[str] = Field(default="exp-043", example="exp-043")
    summary: Optional[str] = None
    topic: Optional[str] = None


class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer: int  # 0 to 3
    explanation: str


class QuizResponse(BaseModel):
    expedition_id: str
    expedition_name: str
    questions: List[QuizQuestion]


class FlashcardItem(BaseModel):
    id: int
    term: str
    category: str
    explanation: str
    keyTakeaway: str


class FlashcardRequest(BaseModel):
    expedition_id: Optional[str] = "exp-043"


class FlashcardResponse(BaseModel):
    expedition_id: str
    expedition_name: str
    flashcards: List[FlashcardItem]


class LessonPlanRequest(BaseModel):
    expedition_id: Optional[str] = "exp-043"
    audience: Optional[str] = "secondary"


class LessonPlanResponse(BaseModel):
    expedition_id: str
    expedition_name: str
    audience: str
    lesson_markdown: str


class OutreachRequest(BaseModel):
    topic: Optional[str] = Field(default="43rd Indian Antarctic Expedition ice sheet findings and glaciology observations", example="Ice core drilling in Antarctica")
    report_id: Optional[str] = Field(default="43-IAE-2023", example="43-IAE-2023")
    expedition_id: Optional[str] = Field(default="exp-043", example="exp-043")
    channel: Optional[str] = Field(default="Official X (Twitter)", example="Official X (Twitter)")
    language: Optional[str] = Field(default="English & Hindi", example="English & Hindi")
    target_audience: Optional[str] = Field(default="General Public", example="General Public")


class OutreachResponse(BaseModel):
    drafted_text: str
    report_id: Optional[str] = "43-IAE-2023"
    channel: Optional[str] = "Official X (Twitter)"
    language: Optional[str] = "English & Hindi"
    english_thread: Optional[str] = ""
    hindi_thread: Optional[str] = ""
    press_release: Optional[str] = ""
    summary_excerpt: Optional[str] = ""


class SearchResultItem(BaseModel):
    id: str
    title: str
    type: str  # "Expedition Hub", "Scientific Dataset", "Official Publication"
    region: str
    expedition_id: str
    expedition_name: str
    snippet: str
    score: float
    url: str


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]
    total_found: int


# ==============================================================================
# Health Check Endpoint
# ==============================================================================

@app.get("/api/health")
async def health_check():
    kg = load_knowledge_graph_data()
    return {
        "status": "online",
        "service": "Dhruv AI Backend (POLARIUM Knowledge Graph)",
        "llm_model": GROQ_MODEL,
        "embedding_model": EMBEDDING_MODEL_NAME,
        "knowledge_graph_loaded": bool(kg.get("expeditions")),
        "total_expeditions": len(kg.get("expeditions", [])),
        "total_datasets": len(kg.get("datasets", [])),
        "total_documents": len(kg.get("documents", [])),
    }


# ==============================================================================
# Stations Endpoint
# ==============================================================================

@app.get("/api/stations")
async def get_stations():
    return {
        "status": "success",
        "stations": [
            {
                "id": "maitri",
                "name": "Maitri Station",
                "region": "Antarctica",
                "lat": -70.767,
                "lon": 11.733,
                "status": "Operational",
                "temperature": "-18.4°C",
                "windSpeed": "22 knots",
            },
            {
                "id": "bharati",
                "name": "Bharati Station",
                "region": "Antarctica",
                "lat": -69.406,
                "lon": 76.195,
                "status": "Operational",
                "temperature": "-12.1°C",
                "windSpeed": "15 knots",
            },
            {
                "id": "himadri",
                "name": "Himadri Station",
                "region": "Arctic",
                "lat": 78.924,
                "lon": 11.928,
                "status": "Operational",
                "temperature": "-6.8°C",
                "windSpeed": "9 knots",
            },
            {
                "id": "himansh",
                "name": "Himansh Observatory",
                "region": "Himalaya",
                "lat": 32.417,
                "lon": 77.617,
                "status": "Operational",
                "temperature": "-3.5°C",
                "windSpeed": "12 knots",
            },
        ],
    }


# ==============================================================================
# 1. POST /api/polarlab/ask-dhruv
# Hybrid RAG: HuggingFace Embeddings + Knowledge Graph Search + Strict Citations
# ==============================================================================

@app.post("/api/polarlab/ask-dhruv", response_model=AskDhruvResponse)
async def ask_dhruv(request: AskDhruvRequest):
    embeddings = get_embeddings()
    kg = load_knowledge_graph_data()

    target_exp_id = request.expedition_id or "exp-043"
    if request.report_id:
        if "25" in request.report_id:
            target_exp_id = "exp-025"
        elif "43" in request.report_id:
            target_exp_id = "exp-043"
        elif "24" in request.report_id:
            target_exp_id = "exp-024"
        elif "23" in request.report_id:
            target_exp_id = "exp-023"
        elif "22" in request.report_id:
            target_exp_id = "exp-022"
        elif "arc" in request.report_id.lower() or "15" in request.report_id:
            target_exp_id = "exp-arc-015"
        elif "him" in request.report_id.lower() or "008" in request.report_id:
            target_exp_id = "exp-him-008"

    try:
        # 0. Comprehensive Science & Domain Keyword Check
        POLAR_KEYWORDS = [
            "polar", "antarctic", "antarctica", "arctic", "himalaya", "himalayan", "glacier",
            "glaciology", "maitri", "bharati", "himadri", "himansh", "indarc", "ncpor", "moes",
            "expedition", "ice core", "telemetry", "aws", "weather station", "schirmacher",
            "larsemann", "sea ice", "cryosphere", "oceanography", "salinity", "ozone", "aurora",
            "delta-18o", "isotope", "sediment", "monograph", "dataset", "permafrost", "snow",
            "meteorology", "subglacial", "paleoclimate", "science", "research", "station",
            "observatory", "traverse", "polarium", "dr.", "saini", "climate", "temperature",
            "pressure", "humidity", "ocean", "sea", "ice", "core", "deep sea", "ny-alesund",
            "ny-ålesund", "spiti", "chandra", "granite", "rock", "sample", "sea-level", "wind",
            "radome", "satellite", "logistics", "what", "how", "who", "why", "where", "tell",
            "explain", "details", "data", "info", "report", "summary", "list", "show", "give",
            "find", "search", "overview", "history", "india", "indian", "mission", "project", "base"
        ]

        q_lower = request.query.lower()
        is_polar = any(kw in q_lower for kw in POLAR_KEYWORDS)

        expeditions = kg.get("expeditions", [])
        documents = kg.get("documents", [])
        datasets = kg.get("datasets", [])

        # Match expedition based on query content or target_exp_id
        matched_hub = next((h for h in expeditions if h.get("short_name", "").lower() in q_lower or h.get("name", "").lower() in q_lower), None)
        active_hub = matched_hub or next((h for h in expeditions if h["id"] == target_exp_id), None)
        if not active_hub and expeditions:
            active_hub = expeditions[0]

        hub_name = active_hub["short_name"] if active_hub else "Indian Polar Expedition"

        # If query is completely irrelevant nonsense or empty, inform user gracefully
        if not is_polar and len(request.query.split()) > 1 and not any(h["short_name"].lower() in q_lower for h in expeditions):
            out_of_scope_msg = (
                "### Out-of-Scope Query Notice\n\n"
                "I am **Dhruv AI**, grounded strictly in the official scientific archives, telemetry datasets, and expedition monographs of the **National Centre for Polar and Ocean Research (NCPOR)** and the **Ministry of Earth Sciences (MoES), Government of India**.\n\n"
                "Your query does not appear to relate to Indian polar research, glaciology, Antarctic/Arctic observatories, or cryospheric science.\n\n"
                "**Please ask a question related to:**\n"
                "- **Antarctic Expeditions & Bases** (*Bharati*, *Maitri*, *Schirmacher Oasis*, *Larsemann Hills*)\n"
                "- **Arctic Research** (*Himadri*, *IndARC Moored Observatory*, *Ny-Ålesund*)\n"
                "- **Himalayan Cryosphere** (*Himansh Observatory*, *Glacial Mass Balance*)\n"
                "- **Telemetry & Science** (*AWS Weather Records*, *δ18O Ice Cores*, *Oceanographic Datasets*)"
            )
            return AskDhruvResponse(
                answer=out_of_scope_msg,
                query=request.query,
                report_id=request.report_id,
                expedition_id=target_exp_id,
                citations=["[MoES Grounding Policy: Polar Science Scope Only]"],
                matched_chunks=0,
            )

        # 1. Generate query embedding
        query_embedding = embeddings.embed_query(request.query)

        # 2. Try Supabase pgvector RPC first if available (with strict expedition / report filter)
        matched_chunks = []
        citations_set = set()
        if SUPABASE_URL and SUPABASE_KEY:
            try:
                supabase = get_supabase_client()
                filter_id = request.report_id or target_exp_id
                rpc_payload = {
                    "query_embedding": query_embedding,
                    "match_count": request.match_count,
                    "filter_report_id": filter_id,
                }
                rpc_res = supabase.rpc("match_report_chunks", rpc_payload).execute()
                if rpc_res.data:
                    for chunk in rpc_res.data:
                        page_num = chunk.get("page_number", 1)
                        cit = f"[{target_exp_id.upper()}, Page {page_num}]"
                        matched_chunks.append({
                            "citation": cit,
                            "content": chunk.get("content", ""),
                        })
                        citations_set.add(cit)
            except Exception as sb_err:
                print(f"Supabase RPC match skipped or filtered: {sb_err}")

        # 3. Hybrid: Match against Relational Knowledge Graph spokes & hub strictly filtered by target_exp_id
        target_docs = [d for d in documents if d.get("expedition_id") == target_exp_id]
        if not target_docs:
            target_docs = documents

        # Search documents
        doc_matches = []
        for doc in target_docs:
            text = f"{doc.get('title', '')} {doc.get('summary', '')} {doc.get('region', '')}"
            emb = embeddings.embed_query(text)
            sim = cosine_sim(query_embedding, emb)
            doc_matches.append((sim, doc))
        doc_matches.sort(key=lambda x: x[0], reverse=True)

        for sim, doc in doc_matches[:3]:
            cit = f"[{doc.get('expedition_name', hub_name).split('(')[0].strip()}, Doc #{doc.get('id', '1')}]"
            citations_set.add(cit)
            matched_chunks.append({
                "citation": cit,
                "content": f"{doc.get('title')}: {doc.get('summary')} (Type: {doc.get('doc_type')}, Year: {doc.get('year')})",
            })

        # Add active expedition research summary context
        if active_hub:
            cit = f"[{active_hub['short_name']}, Research Synthesis]"
            citations_set.add(cit)
            matched_chunks.append({
                "citation": cit,
                "content": f"{active_hub['name']} Objectives: {', '.join(active_hub.get('objectives', []))}. Summary: {active_hub.get('research_summary', '')}",
            })

        # Build context prompt
        context_lines = []
        for c in matched_chunks:
            context_lines.append(f"{c['citation']}:\n{c['content']}")
        context_string = "\n\n---\n\n".join(context_lines)

        # 4. Strict System Prompt (Direct, Detailed, Structured Scientific Answers)
        system_prompt = (
            "You are Dhruv AI, the official Lead Polar Knowledge Scientist for NCPOR and the Ministry of Earth Sciences (MoES).\n"
            "INSTRUCTIONS FOR ANSWERING:\n"
            "1. Answer the user's specific question DIRECTLY and COMPREHENSIVELY in the first paragraph.\n"
            "2. Structure your response using clear markdown headings (e.g. ### Direct Findings, ### Scientific Objectives, ### Expedition Leadership).\n"
            "3. Use bullet points and bold text to emphasize exact measurements, dates, station names, chief scientists, and research discoveries.\n"
            "4. Provide a thorough, expert explanation based on the verified context.\n"
            "5. Do NOT manually type a 'Sources:' or 'Citations:' section at the bottom, as citations are displayed automatically in the UI."
        )

        user_prompt = f"Verified Research Context:\n{context_string}\n\nUser Question: {request.query}"

        # 5. Groq LLM Generation or Context Fallback
        llm = get_groq_llm(temperature=0.1)
        if llm:
            response = llm.invoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])
            raw_answer = response.content.strip()
        else:
            raw_answer = (
                f"### Direct Answer: {hub_name}\n\n"
                f"Based on verified NCPOR records for **{hub_name}**:\n\n"
                f"{active_hub.get('research_summary', '') if active_hub else ''}\n\n"
                f"### Verified Scientific Objectives & Findings\n"
            )
            for chunk in matched_chunks[:3]:
                raw_answer += f"- {chunk['content']}\n"

        # Sanitation: Ensure no internal XML tags or manually typed Sources block leak into response
        cleaned_answer = re.sub(r"<\/?(?:context|doc|chunk|source|xml|json)[^>]*>", "", raw_answer, flags=re.IGNORECASE).strip()
        cleaned_answer = re.sub(r"(?i)\n*(?:\*\*|###?\s*)?(?:Sources|References|Citations)\s*:?[\s\S]*$", "", cleaned_answer).strip()

        final_citations = sorted(list(citations_set))
        if not final_citations:
            final_citations = [f"[{hub_name}, Official Record]"]

        return AskDhruvResponse(
            answer=cleaned_answer,
            query=request.query,
            report_id=request.report_id,
            expedition_id=target_exp_id,
            citations=final_citations,
            matched_chunks=len(matched_chunks),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dhruv AI query failed: {str(e)}",
        )


# ==============================================================================
# 2. POST /api/polarlab/generate-quiz
# Returns strict JSON array of 5 multiple-choice questions for the Smart Classroom
# ==============================================================================

@app.post("/api/polarlab/generate-quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    llm = get_groq_llm(temperature=0.2)
    kg = load_knowledge_graph_data()

    exp_id = request.expedition_id or "exp-043"
    expeditions = kg.get("expeditions", [])
    active_hub = next((h for h in expeditions if h["id"] == exp_id), None)
    if not active_hub and expeditions:
        active_hub = expeditions[0]

    hub_name = active_hub["name"] if active_hub else "43rd Indian Scientific Expedition to Antarctica"
    hub_summary = request.summary or (active_hub.get("research_summary", "") if active_hub else "")
    hub_objectives = "\n- ".join(active_hub.get("objectives", [])) if active_hub else "Glaciological traverse and meteorological profiling."

    prompt_context = (
        f"Expedition: {hub_name}\n"
        f"Region: {active_hub.get('region', 'Antarctica')} ({active_hub.get('polar_region', 'Larsemann Hills & Maitri')})\n"
        f"Year: {active_hub.get('year', 2023)}\n"
        f"Chief Scientist: {active_hub.get('chief_scientist', 'Dr. Shailendra Saini')}\n"
        f"Key Objectives:\n- {hub_objectives}\n"
        f"Research Summary: {hub_summary}\n"
    )

    quiz_prompt = (
        "You are an expert Chief Scientific Educator for the Ministry of Earth Sciences (MoES / NCPOR), Government of India.\n"
        "Create a rigorous 5-question multiple choice quiz testing comprehension of this Indian Scientific Expedition.\n\n"
        "RULES:\n"
        "1. Exactly 5 multiple-choice questions.\n"
        "2. Each question must have 4 clear options (A, B, C, D).\n"
        "3. Specify correct_answer as an integer index from 0 to 3 (where 0=A, 1=B, 2=C, 3=D).\n"
        "4. Include a factual 1-sentence scientific explanation.\n"
        "5. Output MUST be ONLY a valid JSON array of 5 objects matching this structure. Zero prose, zero markdown ticks:\n"
        "[\n"
        "  {\n"
        "    \"id\": 1,\n"
        "    \"question\": \"Question text here?\",\n"
        "    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n"
        "    \"correct_answer\": 1,\n"
        "    \"explanation\": \"Explanation text.\"\n"
        "  }\n"
        "]"
    )

    try:
        llm = get_groq_llm(temperature=0.2)
        if not llm:
            raise ValueError("Groq API key not configured in .env")

        response = llm.invoke([
            SystemMessage(content=quiz_prompt),
            HumanMessage(content=f"Context:\n{prompt_context}"),
        ])

        raw_text = response.content.strip()
        # Clean markdown wrappers if any
        if raw_text.startswith("```"):
            raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
            raw_text = re.sub(r"\s*```$", "", raw_text)

        parsed_questions = json.loads(raw_text)
        formatted_questions: List[QuizQuestion] = []
        for i, q in enumerate(parsed_questions[:5]):
            formatted_questions.append(QuizQuestion(
                id=q.get("id", i + 1),
                question=q.get("question", f"Question {i+1}"),
                options=q.get("options", ["Option A", "Option B", "Option C", "Option D"]),
                correct_answer=int(q.get("correct_answer", 0)),
                explanation=q.get("explanation", "Verified scientific answer based on official NCPOR expedition records."),
            ))

        return QuizResponse(
            expedition_id=exp_id,
            expedition_name=hub_name,
            questions=formatted_questions,
        )

    except Exception as e:
        print(f"Groq Quiz parsing notice: {e}. Using verified pedagogical fallback.")
        # Fallback 5 curated questions tailored dynamically to this specific hub
        chief = active_hub.get('chief_scientist', 'NCPOR Senior Scientist')
        yr = active_hub.get('year', 2023)
        region_str = f"{active_hub.get('polar_region', 'Polar Region')} ({active_hub.get('region', 'Antarctica')})"
        short = active_hub.get('short_name', 'Indian Scientific Expedition')
        objs = active_hub.get('objectives', ['Glaciological traverse and meteorological profiling'])
        primary_obj = objs[0] if objs else 'Glaciological traverse and climate profiling'

        fallback_questions = [
            QuizQuestion(
                id=1,
                question=f"What was the primary scientific objective of {short}?",
                options=[
                    primary_obj,
                    "Submarine deep ocean trench dredging exclusively",
                    "Commercial tourist lodge and harbor construction",
                    "Tropical rainforest soil microbiome sampling"
                ],
                correct_answer=0,
                explanation=f"Official NCPOR records verify that {short} prioritized {primary_obj.lower()}."
            ),
            QuizQuestion(
                id=2,
                question=f"Who served as Chief Scientist / Expedition Leader for {short}?",
                options=[
                    chief,
                    "Dr. Vikram Sarabhai",
                    "Dr. Homi J. Bhabha",
                    "Dr. A.P.J. Abdul Kalam"
                ],
                correct_answer=0,
                explanation=f"{chief} directed field operations and scientific data sampling for {short}."
            ),
            QuizQuestion(
                id=3,
                question=f"In which target polar field station / sector was {short} executed?",
                options=[
                    region_str,
                    "Sahara Desert Meteorological Outpost",
                    "Great Barrier Reef Oceanographic Station",
                    "Mariana Trench Submarine Observatory"
                ],
                correct_answer=0,
                explanation=f"{short} conducted multi-disciplinary research in {region_str}."
            ),
            QuizQuestion(
                id=4,
                question=f"In which year was {short} launched by the Ministry of Earth Sciences?",
                options=[
                    str(yr),
                    str(yr - 12),
                    str(yr + 8),
                    "1950"
                ],
                correct_answer=0,
                explanation=f"Official MoES archives record {short} as being executed in {yr}."
            ),
            QuizQuestion(
                id=5,
                question=f"Which nodal Indian autonomous institute oversaw operations for {short}?",
                options=[
                    "National Centre for Polar and Ocean Research (NCPOR), Goa",
                    "Indian Space Research Organisation (ISRO)",
                    "Council of Scientific & Industrial Research (CSIR)",
                    "Survey of India"
                ],
                correct_answer=0,
                explanation=f"NCPOR in Goa, under MoES, is the premier institute directing all Indian expeditions for {short}."
            ),
        ]

        return QuizResponse(
            expedition_id=exp_id,
            expedition_name=hub_name,
            questions=fallback_questions,
        )


# ==============================================================================
# 2B. POST /api/polarlab/generate-flashcards
# ==============================================================================

@app.post("/api/polarlab/generate-flashcards", response_model=FlashcardResponse)
async def generate_flashcards(request: FlashcardRequest):
    kg = load_knowledge_graph_data()
    exp_id = request.expedition_id or "exp-043"
    expeditions = kg.get("expeditions", [])
    active_hub = next((h for h in expeditions if h["id"] == exp_id), None)
    if not active_hub and expeditions:
        active_hub = expeditions[0]

    hub_name = active_hub["name"] if active_hub else "Indian Scientific Expedition"
    short_name = active_hub.get("short_name", "Indian Expedition") if active_hub else "Polar Mission"
    region = active_hub.get("region", "Antarctica") if active_hub else "Antarctica"
    polar_site = active_hub.get("polar_region", "Bharati & Maitri") if active_hub else "Bharati Station"
    chief_sci = active_hub.get("chief_scientist", "MoES Lead Scientist") if active_hub else "NCPOR Scientist"
    summary = active_hub.get("research_summary", "") if active_hub else ""
    year = active_hub.get("year", 2023) if active_hub else 2023

    cards = [
        FlashcardItem(
            id=1,
            term=f"{short_name} Primary Objective",
            category=region,
            explanation=active_hub.get("objectives", ["Glaciological traverse and paleoclimate ice core drilling"])[0] if active_hub else "Glaciological profiling",
            keyTakeaway=f"Operational Base: {polar_site} ({year})"
        ),
        FlashcardItem(
            id=2,
            term=f"Chief Scientist: {chief_sci}",
            category="Expedition Leadership",
            explanation=f"Led multi-disciplinary research teams across {region}, conducting paleoclimate ice sampling and AWS calibrations.",
            keyTakeaway=f"Published technical monograph series under NCPOR {year} Archive."
        ),
        FlashcardItem(
            id=3,
            term=f"{polar_site} Observatories",
            category="Sensor Telemetry",
            explanation=f"Continuous meteorological AWS profiling and surface mass balance tracking across {polar_site}.",
            keyTakeaway=f"Datasets published under DOI: 10.6084/m9.figshare.ncpor.{exp_id}"
        ),
        FlashcardItem(
            id=4,
            term="Research Findings & Synthesis",
            category="Climate Dynamics",
            explanation=summary[:220] + "..." if len(summary) > 220 else summary,
            keyTakeaway="Supports global sea-level and polar climate modeling."
        ),
    ]

    return FlashcardResponse(
        expedition_id=exp_id,
        expedition_name=hub_name,
        flashcards=cards,
    )


# ==============================================================================
# 2C. POST /api/polarlab/generate-lesson-plan
# ==============================================================================

@app.post("/api/polarlab/generate-lesson-plan", response_model=LessonPlanResponse)
async def generate_lesson_plan(request: LessonPlanRequest):
    kg = load_knowledge_graph_data()
    exp_id = request.expedition_id or "exp-043"
    audience = request.audience or "secondary"

    expeditions = kg.get("expeditions", [])
    active_hub = next((h for h in expeditions if h["id"] == exp_id), None)
    if not active_hub and expeditions:
        active_hub = expeditions[0]

    hub_name = active_hub["name"] if active_hub else "Indian Scientific Expedition"
    region = active_hub.get("region", "Antarctica") if active_hub else "Antarctica"
    polar_site = active_hub.get("polar_region", "Bharati & Maitri") if active_hub else "Bharati Station"
    chief_sci = active_hub.get("chief_scientist", "MoES Lead Scientist") if active_hub else "NCPOR Scientist"
    summary = active_hub.get("research_summary", "") if active_hub else ""
    year = active_hub.get("year", 2023) if active_hub else 2023

    level_title = (
        "Senior Secondary (Grades 11-12 Earth Sciences & Geography)"
        if audience == "secondary"
        else "Undergraduate Earth & Cryospheric Sciences"
        if audience == "undergrad"
        else "UPSC / Civil Services Geoscience Specialization"
    )

    objectives_formatted = "\n".join([f"- {o}" for o in active_hub.get("objectives", ["Glaciological traverse", "AWS meteorology"])]) if active_hub else "- Glaciological profiling"

    lesson_text = f"""### CURRICULUM LESSON PLAN: {hub_name.upper()}
**Module Level:** {level_title}  
**Target Expedition Hub:** {hub_name} ({region})  
**Chief Scientist:** {chief_sci}  
**Operational Season:** {year}  
**Accredited Body:** Ministry of Earth Sciences (MoES) / NCPOR Pedagogical Framework  

---

#### 1. Core Learning Objectives (10 Mins)
{objectives_formatted}
- Analyze continuous AWS telemetry recorded at **{polar_site}**.

#### 2. Expedition Research Synthesis (15 Mins)
{summary}

#### 3. Data & Methodology Analysis (10 Mins)
- **Primary Field Site:** {polar_site} ({region})
- **Scientific Keywords:** {', '.join(active_hub.get('keywords', ['Glaciology', 'AWS', 'Isotope Analysis'])) if active_hub else 'Glaciology'}
- **Data Repositories:** Ingested in NetCDF4 format in the **POLARIUM National Polar Registry**.

#### 4. Assessment & Reflection (10 Mins)
1. Explain how the objectives of {active_hub.get('short_name', 'this mission')} contribute to global sea-level modeling.
2. Discuss the operational challenges faced at {polar_site} during the {year} field campaign.
"""

    return LessonPlanResponse(
        expedition_id=exp_id,
        expedition_name=hub_name,
        audience=audience,
        lesson_markdown=lesson_text.strip(),
    )


# ==============================================================================
# 3. POST /api/admin/generate-outreach
# Prompt Groq: MoES PRO -> 1 Professional Twitter thread + 1 Official Press Release (English & Hindi)
# ==============================================================================

@app.post("/api/admin/generate-outreach", response_model=OutreachResponse)
async def generate_outreach(request: OutreachRequest):
    kg = load_knowledge_graph_data()

    # Look up selected expedition hub from knowledge graph
    exp_id = request.expedition_id or "exp-043"
    expeditions = kg.get("expeditions", [])
    active_hub = next((h for h in expeditions if h["id"] == exp_id or h["name"] == request.topic), None)
    if not active_hub and expeditions:
        active_hub = expeditions[0]

    hub_title = active_hub["name"] if active_hub else request.topic
    hub_summary = active_hub.get("research_summary", "") if active_hub else ""
    hub_region = active_hub.get("region", "Antarctica") if active_hub else "Polar Region"
    hub_year = active_hub.get("year", 2024) if active_hub else 2024
    hub_scientist = active_hub.get("chief_scientist", "MoES Lead Scientist") if active_hub else ""

    channel = request.channel or "Website Article"
    language = request.language or "English & Hindi"
    audience = request.target_audience or "General Public"

    # PHASE 4 RULE: Strict conditional formatting based on requested channel
    channel_clean = channel.strip()
    if channel_clean == "Website Article" or "article" in channel_clean.lower() or "blog" in channel_clean.lower() or "portal" in channel_clean.lower():
        channel_directive = (
            "Write a highly authoritative, expert-level website article. Use heavy Markdown formatting: "
            "bold key scientific terms, use bullet points for findings, and structure it with clear H2 headings. "
            "The tone must be professional and explanatory."
        )
    elif channel_clean == "Twitter/X" or "twitter" in channel_clean.lower() or "x" in channel_clean.lower():
        channel_directive = "Write a 3-part Twitter thread. Keep it punchy. Use emojis and #PolarScience hashtags."
    elif channel_clean == "Press Release" or "press" in channel_clean.lower() or "pib" in channel_clean.lower():
        channel_directive = "Write a formal PIB-style press dispatch for news agencies."
    else:
        channel_directive = f"Write an official communications release tailored for {channel_clean}."

    outreach_system_prompt = (
        "You are the Senior Media & Public Relations Officer (PRO) for the Ministry of Earth Sciences (MoES) "
        "and National Centre for Polar and Ocean Research (NCPOR), Government of India.\n\n"
        f"MANDATORY CHANNEL INSTRUCTION: {channel_directive}\n\n"
        f"CRITICAL BHASHINI / LANGUAGE REQUIREMENT: You MUST generate the COMPLETE outreach text in {language}.\n"
        "- If an Indian language (e.g. Hindi/हिन्दी, Tamil/தமிழ், Marathi/मराठी, Telugu/తెలుగు, Bengali/বাংলা, Gujarati/ગુજરાતી) is requested, write the FULL content in that official script with accurate scientific terminology (e.g., पृथ्वी विज्ञान मंत्रालय, राष्ट्रीय ध्रुवीय एवं महासागर अनुसंधान केंद्र).\n"
        "- If 'Bilingual (English + Hindi)' is requested, provide both the complete English section and the complete Devanagari Hindi section."
    )

    context_prompt = (
        f"Expedition: {hub_title}\n"
        f"Region: {hub_region}\n"
        f"Season/Year: {hub_year}\n"
        f"Chief Scientist: {hub_scientist}\n"
        f"Key Discoveries & Summary: {hub_summary}\n"
        f"Target Audience: {audience}\n"
        f"Requested Channel: {channel}\n"
        f"Target Language: {language}\n"
    )

    try:
        llm = get_groq_llm(temperature=0.3)
        if not llm:
            raise ValueError("Groq API key not configured in .env")

        response = llm.invoke([
            SystemMessage(content=outreach_system_prompt),
            HumanMessage(content=context_prompt),
        ])

        output_text = response.content.strip()

        # Separate English and Hindi sections cleanly if present
        english_part = output_text
        hindi_part = ""
        if "HINDI" in output_text.upper() or "हिन्दी" in output_text:
            splits = re.split(r"(?:###?\s*(?:HINDI|हिन्दी)|---+\s*(?:HINDI|हिन्दी))", output_text, flags=re.IGNORECASE)
            if len(splits) > 1:
                english_part = splits[0].strip()
                hindi_part = splits[1].strip()

        return OutreachResponse(
            drafted_text=output_text,
            report_id=request.report_id or exp_id,
            channel=channel,
            language=language,
            english_thread=english_part,
            hindi_thread=hindi_part,
            press_release=output_text,
            summary_excerpt=hub_summary[:250] + "..." if hub_summary else "",
        )

    except Exception as e:
        print(f"Notice: Groq LLM unavailable, using Knowledge Graph RAG Synthesizer: {e}")
        lang_str = str(language).lower()

        hub_site = active_hub.get("polar_region", "Bharati & Maitri Observatories")
        datasets = [d for d in kg.get("datasets", []) if d.get("expedition_id") == active_hub.get("id")]
        documents = [d for d in kg.get("documents", []) if d.get("expedition_id") == active_hub.get("id")]

        ds_titles = [d.get("title", "") for d in datasets[:3] if d.get("title")]
        ds_str = ", ".join(ds_titles) if ds_titles else "AWS Telemetry & Ice Core Geochemistry Series"

        doc_titles = [d.get("title", "") for d in documents[:2] if d.get("title")]
        doc_str = ", ".join(doc_titles) if doc_titles else "NCPOR Declassified Polar Expedition Monograph"

        objectives_list = active_hub.get("objectives", ["Glaciological Mass Balance Profiling", "Continuous AWS Telemetry Logging", "Paleoclimate Firn Core Geochemistry"])
        obj_bullet_en = "\n".join([f"• {o}" for o in objectives_list])

        is_hi = "hi" in lang_str or "hindi" in lang_str or "हिन्दी" in lang_str
        is_bilingual = "bilingual" in lang_str or "dual" in lang_str
        is_ta = "ta" in lang_str or "tamil" in lang_str or "தமிழ்" in lang_str
        is_mr = "mr" in lang_str or "marathi" in lang_str or "मराठी" in lang_str

        # DYNAMIC ENGLISH SYNTHESIS
        draft_en = ""
        if "twitter" in channel.lower() or "x" in channel.lower():
            draft_en = (
                f"1/4 ❄️ BREAKING DISPATCH: India's landmark {hub_title} ({hub_year}) in {hub_region}! Led by Chief Scientist {hub_scientist}, scientific operations at {hub_site} have achieved long-term climate modeling breakthroughs. 🇮🇳🔬 #PolarScience #NCPOR #MoES\n\n"
                f"2/4 🧊 KEY SCIENTIFIC OBJECTIVES EXECUTED:\n{obj_bullet_en}\n\n"
                f"3/4 📊 REAL DATASETS INGESTED: {len(datasets)} verified time-series data streams ({ds_str}) and {len(documents)} official scientific monograph publications.\n\n"
                f"4/4 📡 Open-access scientific datasets and declassified reports are available now on the POLARIUM National Polar Repository (MoES / NCPOR). Explore today! 🌐 #ViksitBharat #ClimateAction"
            )
        elif "press" in channel.lower() or "pib" in channel.lower():
            draft_en = (
                f"PRESS INFORMATION BUREAU\nGOVERNMENT OF INDIA | MINISTRY OF EARTH SCIENCES (MoES)\n\n"
                f"FOR IMMEDIATE RELEASE\n"
                f"NEW DELHI / VASCO DA GAMA (GOA) — {hub_year}\n\n"
                f"INDIA'S {hub_title.upper()} CONCLUDES OPERATIONAL FIELD DEPLOYMENT IN {hub_region.upper()}\n\n"
                f"The National Centre for Polar and Ocean Research (NCPOR), an autonomous research institution under the Ministry of Earth Sciences (MoES), Government of India, has announced the official completion of operational scientific activities for the {hub_title}.\n\n"
                f"Operating from permanent scientific observatories at {hub_site}, the multi-institutional scientific team under Chief Scientist {hub_scientist} executed extensive glaciological traverses, firn core retrievals, and continuous Automated Weather Station (AWS) calibrations.\n\n"
                f"PRIMARY FIELD SCIENTIFIC OBJECTIVES:\n{obj_bullet_en}\n\n"
                f"EXECUTIVE RESEARCH SYNTHESIS:\n{hub_summary}\n\n"
                f"OPEN ACCESS DATA & MONOGRAPHS:\n"
                f"All continuous telemetry streams, including {ds_str}, and official published monographs ({doc_str}) have been ingested into the POLARIUM National Polar Repository for open international scientific access.\n\n"
                f"***\n(MoES / NCPOR Dissemination Unit)"
            )
        elif "script" in channel.lower() or "youtube" in channel.lower() or "video" in channel.lower():
            draft_en = (
                f"🎬 DOCUMENTARY SCRIPT: {hub_title.upper()}\n"
                f"Target Audience: {audience} | Dissemination Channel: Video / Documentary\n\n"
                f"[SCENE OPENING - VISUAL: High-resolution footage of Indian scientific research station {hub_site} in {hub_region}]\n"
                f"NARRATOR (VO): 'At the edge of the world, operating under temperatures below minus 30 degrees Celsius, Indian scientists continue a four-decade legacy of polar exploration...'\n\n"
                f"[CUT TO FIELD TRAVERSE - VISUAL: Scientists operating radar equipment and AWS meteorological towers]\n"
                f"NARRATOR (VO): 'Under the leadership of Chief Scientist {hub_scientist}, the {hub_title} was deployed to unlock key climate indicators preserved in ancient polar ice.'\n\n"
                f"[KEY SCIENTIFIC HIGHLIGHTS]\n{obj_bullet_en}\n\n"
                f"[RESEARCH SYNTHESIS & DATA DISCOVERY]\n"
                f"NARRATOR (VO): '{hub_summary}'\n\n"
                f"[CLOSING GRAPHIC: POLARIUM National Polar Knowledge Registry Logo]\n"
                f"NARRATOR (VO): 'All verified datasets and monograph records from the {hub_year} expedition are now declassified and available at POLARIUM, under the Ministry of Earth Sciences.'"
            )
        else:
            draft_en = (
                f"# Unlocking Polar Science: Key Discoveries from the {hub_title}\n\n"
                f"### 1. Executive Summary\n{hub_summary}\n\n"
                f"### 2. Operational Field Deployments\n"
                f"• **Expedition Title:** {hub_title}\n"
                f"• **Operational Season:** {hub_year}\n"
                f"• **Chief Scientist:** {hub_scientist}\n"
                f"• **Observatory & Field Site:** {hub_site} ({hub_region})\n"
                f"• **Target Audience:** {audience}\n\n"
                f"### 3. Primary Scientific Field Objectives\n{obj_bullet_en}\n\n"
                f"### 4. Verified Datasets & Declassified Monograph Records\n"
                f"• **Connected Datasets ({len(datasets)}):** {ds_str}\n"
                f"• **Official Published Monographs ({len(documents)}):** {doc_str}\n\n"
                f"### 5. Conclusion & National Registry Access\n"
                f"All verified records generated during the {hub_year} campaign are declassified and open-access on the POLARIUM National Polar Knowledge Registry, executed under the Ministry of Earth Sciences (MoES)."
            )

        # DYNAMIC HINDI SYNTHESIS
        draft_hi = ""
        if "twitter" in channel.lower() or "x" in channel.lower():
            draft_hi = (
                f"1/4 ❄️ मुख्य समाचार: {hub_region} क्षेत्र में भारत का ऐतिहासिक {hub_title} ({hub_year})! मुख्य वैज्ञानिक {hub_scientist} के नेतृत्व में {hub_site} पर प्रमुख जलवायु मॉडल परिणाम हासिल किए गए। 🇮🇳🔬 #PolarScience #NCPOR #MoES\n\n"
                f"2/4 🧊 प्रमुख वैज्ञानिक उद्देश्य:\n{obj_bullet_en}\n\n"
                f"3/4 📊 संचित डेटासेट: {len(datasets)} सत्यापित टाइम-सीरीज़ डेटा रिकॉर्ड्स ({ds_str}) एवं {len(documents)} आधिकारिक शोध मोनोग्राफ।\n\n"
                f"4/4 📡 सभी सत्यापित डेटासेट POLARIUM राष्ट्रीय ध्रुवीय ज्ञान पोर्टल पर अध्ययन हेतु उपलब्ध हैं। आज ही एक्सप्लोर करें! 🌐 #ViksitBharat"
            )
        elif "press" in channel.lower() or "pib" in channel.lower():
            draft_hi = (
                f"प्रेस सूचना कार्यालय (PIB)\nभारत सरकार | पृथ्वी विज्ञान मंत्रालय (MoES)\n\n"
                f"तत्काल प्रकाशन हेतु\n"
                f"नई दिल्ली / वास्को-डा-गामा (गोवा) — {hub_year}\n\n"
                f"भारत का {hub_title.upper()} अभियान {hub_region.upper()} में सफलतापूर्वक संपन्न\n\n"
                f"राष्ट्रीय ध्रुवीय एवं महासागर अनुसंधान केंद्र (NCPOR), पृथ्वी विज्ञान मंत्रालय के अंतर्गत, {hub_title} के सफल क्षेत्र संचालन की घोषणा करता है।\n\n"
                f"मुख्य वैज्ञानिक {hub_scientist} के नेतृत्व में वैज्ञानिक दल ने {hub_site} पर व्यापक हिमनद विज्ञान, आइस कोर सैंपलिंग एवं एडब्ल्यूएस (AWS) मौसम विज्ञान प्रेक्षण किए।\n\n"
                f"प्रमुख वैज्ञानिक क्षेत्र उद्देश्य:\n{obj_bullet_en}\n\n"
                f"कार्यकारी अनुसंधान विश्लेषण:\n{hub_summary}\n\n"
                f"खुला डेटा अभिगम (OPEN ACCESS):\n"
                f"सत्यापित डेटासेट ({ds_str}) एवं आधिकारिक मोनोग्राफ ({doc_str}) POLARIUM राष्ट्रीय ध्रुवीय ज्ञान पोर्टल पर निःशुल्क उपलब्ध करा दिए गए हैं।\n\n"
                f"***\n(MoES / NCPOR विज्ञान संचार एवं प्रसार इकाई)"
            )
        elif "script" in channel.lower() or "youtube" in channel.lower() or "video" in channel.lower():
            draft_hi = (
                f"🎬 वृत्तचित्र स्क्रिप्ट: {hub_title}\n"
                f"लक्ष्य श्रोता: {audience} | प्रसार माध्यम: वीडियो / डॉक्यूमेंट्री\n\n"
                f"[दृश्य प्रारंभ - स्थान: {hub_region} स्थित भारतीय वैज्ञानिक स्टेशन {hub_site}]\n"
                f"सूत्रधार (वॉइसओवर): 'शून्य से 35 डिग्री नीचे के तापमान में, दुनिया के छोर पर भारतीय वैज्ञानिक चार दशकों से ध्रुवीय अनुसंधान की मिसाल कायम कर रहे हैं...'\n\n"
                f"[दृश्य बदलें: वैज्ञानिक मौसम टावर और आइस कोर ड्रिलिंग मशीनरी संचालित करते हुए]\n"
                f"सूत्रधार (वॉइसओवर): 'मुख्य वैज्ञानिक {hub_scientist} के नेतृत्व में {hub_title} ने बर्फ की गहराई में छिपे प्राचीन जलवायु रहस्यों को उजागर किया है।'\n\n"
                f"[प्रमुख वैज्ञानिक उपलब्धियां]\n{obj_bullet_en}\n\n"
                f"[अनुसंधान सारांश]\n"
                f"सूत्रधार (वॉइसओवर): '{hub_summary}'\n\n"
                f"[समापन लोगो: POLARIUM राष्ट्रीय ध्रुवीय ज्ञान पोर्टल]\n"
                f"सूत्रधार (वॉइसओवर): 'इस अभियान के सभी सत्यापित डेटासेट पृथ्वी विज्ञान मंत्रालय के POLARIUM पोर्टल पर निःशुल्क उपलब्ध हैं।'"
            )
        else:
            draft_hi = (
                f"# {hub_title}: राष्ट्रीय ध्रुवीय विज्ञान रिपोर्ट\n\n"
                f"### 1. कार्यकारी सारांश (Executive Summary)\n{hub_summary}\n\n"
                f"### 2. क्षेत्र संचालन विवरण\n"
                f"• **अभियान शीर्षक:** {hub_title}\n"
                f"• **सत्र / वर्ष:** {hub_year}\n"
                f"• **मुख्य वैज्ञानिक:** {hub_scientist}\n"
                f"• **स्टेशन एवं क्षेत्र:** {hub_site} ({hub_region})\n"
                f"• **लक्ष्य श्रोता:** {audience}\n\n"
                f"### 3. प्रमुख वैज्ञानिक क्षेत्र उद्देश्य\n{obj_bullet_en}\n\n"
                f"### 4. संचित डेटासेट एवं आधिकारिक अभिलेख\n"
                f"• **संबद्ध डेटासेट ({len(datasets)}):** {ds_str}\n"
                f"• **प्रकाशित शोध मोनोग्राफ ({len(documents)}):** {doc_str}\n\n"
                f"### 5. निष्कर्ष एवं ज्ञान पोर्टल अभिगम\n"
                f"पृथ्वी विज्ञान मंत्रालय (MoES) और एनसीपीओआर द्वारा सत्यापित सभी अवलोकन डेटासेट POLARIUM पोर्टल पर सार्वजनिक अध्ययन हेतु उपलब्ध हैं।"
            )

        if is_bilingual:
            final_draft = f"--- [ENGLISH DISSEMINATION DISPATCH] ---\n\n{draft_en}\n\n=========================================\n\n--- [हिन्दी संस्करण (NATIONAL MOES DISPATCH)] ---\n\n{draft_hi}"
        elif is_hi:
            final_draft = draft_hi
        elif is_ta:
            final_draft = (
                f"# இந்திய துருவ ஆராய்ச்சி அறிக்கை: {hub_title}\n\n"
                f"### 1. நிர்வாக சுருக்கம்\n{hub_summary}\n\n"
                f"### 2. முக்கிய விவரங்கள்\n"
                f"• **ஆண்டு:** {hub_year}\n"
                f"• **தலைமை விஞ்ஞானி:** {hub_scientist}\n"
                f"• **பிராந்தியம்:** {hub_site} ({hub_region})\n\n"
                f"### 3. முதன்மை அறிவியல் நோக்கங்கள்\n{obj_bullet_en}\n\n"
                f"***\n(புவி அறிவியல் அமைச்சகம் - NCPOR ஊடக பிரிவு)"
            )
        elif is_mr:
            final_draft = (
                f"# भारतीय ध्रुवीय संशोधन अहवाल: {hub_title}\n\n"
                f"### १. मुख्य सारांश\n{hub_summary}\n\n"
                f"### २. क्षेत्र संशोधन तपशील\n"
                f"• **वर्ष:** {hub_year}\n"
                f"• **प्रमुख शास्त्रज्ञ:** {hub_scientist}\n"
                f"• **क्षेत्र:** {hub_site} ({hub_region})\n\n"
                f"### ३. मुख्य वैज्ञानिक उद्दिष्टे\n{obj_bullet_en}\n\n"
                f"***\n(पृथ्वी विज्ञान मंत्रालय - NCPOR प्रसार विभाग)"
            )
        else:
            final_draft = draft_en

        return OutreachResponse(
            drafted_text=final_draft,
            report_id=request.report_id or exp_id,
            channel=channel,
            language=language,
            english_thread=draft_en,
            hindi_thread=draft_hi,
            press_release=final_draft,
            summary_excerpt=hub_summary[:250] + "..." if hub_summary else "",
        )


# ==============================================================================
# 4. GET & POST /api/search
# Global Vector Similarity Search across all indexed documents, datasets, and hubs
# ==============================================================================

@app.get("/api/search", response_model=SearchResponse)
@app.post("/api/search", response_model=SearchResponse)
async def global_vector_search(
    q: Optional[str] = None,
    query: Optional[str] = None,
    limit: int = 4,
):
    search_query = (q or query or "").strip()
    limit_n = int(limit) if isinstance(limit, (int, str)) and str(limit).isdigit() else 4
    if not search_query:
        return SearchResponse(query="", results=[], total_found=0)

    embeddings = get_embeddings()
    kg = load_knowledge_graph_data()

    try:
        # Generate query vector
        query_vec = embeddings.embed_query(search_query)

        scored_items: List[SearchResultItem] = []

        # 1. Search Expedition Hubs
        for exp in kg.get("expeditions", []):
            exp_text = f"{exp['name']} {exp['short_name']} {exp['region']} {exp['polar_region']} {exp['description']} {' '.join(exp.get('keywords', []))}"
            exp_emb = exp.get("embedding")
            if not exp_emb or len(exp_emb) != 384:
                exp_emb = embeddings.embed_query(exp_text)
            sim = cosine_sim(query_vec, exp_emb)

            # Keyword boost
            if search_query.lower() in exp_text.lower():
                sim += 0.12

            scored_items.append(SearchResultItem(
                id=exp["id"],
                title=exp["name"],
                type="Expedition Hub",
                region=exp["region"],
                expedition_id=exp["id"],
                expedition_name=exp["short_name"],
                snippet=exp["description"][:160] + "...",
                score=round(float(sim), 3),
                url=f"/knowledge-repository?expedition={exp['id']}",
            ))

        # 2. Search Datasets
        for ds in kg.get("datasets", []):
            ds_text = f"{ds['title']} {ds['station']} {ds['parameter']} {ds.get('summary', '')}"
            ds_emb = embeddings.embed_query(ds_text)
            sim = cosine_sim(query_vec, ds_emb)

            if search_query.lower() in ds_text.lower():
                sim += 0.15

            scored_items.append(SearchResultItem(
                id=ds["id"],
                title=ds["title"],
                type="Scientific Dataset",
                region=ds["region"],
                expedition_id=ds["expedition_id"],
                expedition_name=ds.get("expedition_name", "Indian Expedition"),
                snippet=f"Telemetry parameter: {ds['parameter']} recorded at {ds['station']} station. {ds.get('summary', '')[:100]}",
                score=round(float(sim), 3),
                url=f"/knowledge-repository?expedition={ds['expedition_id']}",
            ))

        # 3. Search Documents
        for doc in kg.get("documents", []):
            doc_text = f"{doc['title']} {doc.get('summary', '')} {doc.get('doc_type', '')}"
            doc_emb = embeddings.embed_query(doc_text)
            sim = cosine_sim(query_vec, doc_emb)

            if search_query.lower() in doc_text.lower():
                sim += 0.15

            scored_items.append(SearchResultItem(
                id=doc["id"],
                title=doc["title"],
                type="Official Publication",
                region=doc["region"],
                expedition_id=doc["expedition_id"],
                expedition_name=doc.get("expedition_name", "Indian Expedition"),
                snippet=f"{doc.get('doc_type')} ({doc.get('file_size')}, {doc.get('pages')} pages): {doc.get('summary', '')[:110]}...",
                score=round(float(sim), 3),
                url=f"/knowledge-repository?expedition={doc['expedition_id']}",
            ))

        # Sort by score descending and take top N
        scored_items.sort(key=lambda x: x.score, reverse=True)
        top_results = scored_items[:limit_n]

        return SearchResponse(
            query=search_query,
            results=top_results,
            total_found=len(scored_items),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Global vector search failed: {str(e)}",
        )


# ==============================================================================
# 5. POST /api/admin/ingest-report
# PDF Ingestion pipeline
# ==============================================================================

@app.post("/api/admin/ingest-report")
async def ingest_report(
    file: UploadFile = File(...),
    report_id: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF files are supported.",
        )

    assigned_report_id = report_id.strip() if report_id else str(uuid.uuid4())
    report_title = title.strip() if title else file.filename.replace(".pdf", "")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        temp_pdf_path = tmp_file.name

    try:
        loader = PyPDFLoader(temp_pdf_path)
        pages = loader.load()

        if not pages:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract text from the provided PDF.",
            )

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            separators=["\n\n", "\n", " ", ""],
        )
        chunks = splitter.split_documents(pages)

        embeddings = get_embeddings()
        texts_to_embed = [chunk.page_content for chunk in chunks]
        chunk_embeddings = embeddings.embed_documents(texts_to_embed)

        rows_to_insert: List[Dict[str, Any]] = []
        for i, (chunk, emb) in enumerate(zip(chunks, chunk_embeddings)):
            page_num = chunk.metadata.get("page", 0) + 1
            rows_to_insert.append({
                "report_id": assigned_report_id,
                "chunk_index": i,
                "content": chunk.page_content,
                "page_number": page_num,
                "embedding": emb,
                "metadata": {
                    "title": report_title,
                    "filename": file.filename,
                    "page": page_num,
                    "chunk_index": i,
                },
            })

        supabase = get_supabase_client()
        batch_size = 50
        for b_start in range(0, len(rows_to_insert), batch_size):
            batch = rows_to_insert[b_start : b_start + batch_size]
            supabase.table("report_chunks").insert(batch).execute()

        return {
            "status": "success",
            "message": f"Successfully ingested {len(chunks)} chunks from '{file.filename}'",
            "report_id": assigned_report_id,
            "report_title": report_title,
            "total_pages": len(pages),
            "chunks_stored": len(chunks),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report ingestion failed: {str(e)}",
        )
    finally:
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)


@app.get("/api/crawl-status")
def get_crawl_status():
    """Returns status and manifest of the NCPOR crawler."""
    manifest_path = BASE_DIR / "raw_knowledge_base" / "crawl_manifest.json"
    if not manifest_path.exists():
        return {
            "status": "idle",
            "message": "No crawl manifest found. Run /api/crawl-ncpor to trigger crawling.",
            "crawled_pages": 0,
            "downloaded_docs": 0,
            "downloaded_media": 0,
        }
    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {
        "status": "completed",
        "crawled_pages_count": len(data.get("crawled_pages", [])),
        "downloaded_docs_count": len(data.get("downloaded_docs", [])),
        "downloaded_data_count": len(data.get("downloaded_data", [])),
        "downloaded_media_count": len(data.get("downloaded_media", [])),
        "manifest": data
    }


@app.post("/api/crawl-ncpor")
def trigger_ncpor_crawler(max_pages: int = Query(30, ge=5, le=200)):
    """Triggers the NCPOR Web Crawler to fetch pages, PDFs, images, and datasets."""
    try:
        from ncpor_crawler import NCPORCrawler
        crawler = NCPORCrawler(max_depth=2, max_pages=max_pages)
        crawler.run()
        return {
            "status": "success",
            "message": f"Crawl completed for up to {max_pages} pages.",
            "manifest_file": str(BASE_DIR / "raw_knowledge_base" / "crawl_manifest.json")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Crawl execution failed: {str(e)}"
        )



@app.post("/api/harvest-dspace")
def trigger_dspace_harvest(max_pdfs: int = Query(500, ge=10, le=1000)):
    """Triggers the high-performance DSpace bulk PDF downloader to harvest all 500+ scientific PDFs."""
    try:
        from dspace_bulk_downloader import DSpaceHarvester
        harvester = DSpaceHarvester(max_threads=8, max_pdfs=max_pdfs)
        harvester.harvest_all()
        return {
            "status": "success",
            "message": f"DSpace PDF harvest completed for up to {max_pdfs} PDFs.",
            "manifest_file": str(BASE_DIR / "raw_knowledge_base" / "dspace_harvest_manifest.json")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"DSpace harvest execution failed: {str(e)}"
        )


@app.get("/api/scraped_docs/{filename}")
@app.get("/api/reports/{filename}")
def serve_scraped_document(filename: str):
    """Serves and downloads scraped PDF scientific reports and monographs."""
    docs_dir = BASE_DIR / "raw_knowledge_base" / "scraped_documents"
    reports_dir = BASE_DIR / "public" / "reports"
    
    file_path = docs_dir / filename
    if not file_path.exists():
        file_path = reports_dir / filename
    
    if not file_path.exists():
        # Fallback search
        for f in list(docs_dir.glob("*")) + list(reports_dir.glob("*")):
            if f.name.lower() == filename.lower() or f.stem.lower() == Path(filename).stem.lower():
                file_path = f
                break
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{filename}' not found on server."
        )
    
    return FileResponse(
        path=str(file_path),
        media_type="application/pdf",
        filename=file_path.name,
        headers={
            "Content-Disposition": f"inline; filename=\"{file_path.name}\"",
            "Access-Control-Allow-Origin": "*",
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
