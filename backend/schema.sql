-- ==============================================================================
-- DHRUV AI - SUPABASE PGVECTOR SCHEMA SETUP
-- Run this in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. Enable the pgvector extension for vector embeddings
create extension if not exists vector;

-- 2. Create the report_chunks table to store document chunks and embeddings
create table if not exists report_chunks (
    id uuid primary key default gen_random_uuid(),
    report_id text not null,
    chunk_index int not null,
    content text not null,
    page_number int not null,
    embedding vector(384), -- all-MiniLM-L6-v2 dimension is 384
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create an index for fast cosine distance similarity queries
create index if not exists report_chunks_embedding_idx
on report_chunks
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- 4. Create the match_report_chunks RPC function for cosine similarity retrieval
create or replace function match_report_chunks (
    query_embedding vector(384),
    match_count int default 5,
    filter_report_id text default null
)
returns table (
    id uuid,
    report_id text,
    chunk_index int,
    content text,
    page_number int,
    similarity float,
    metadata jsonb
)
language plpgsql
as $$
begin
    return query
    select
        rc.id,
        rc.report_id,
        rc.chunk_index,
        rc.content,
        rc.page_number,
        1 - (rc.embedding <=> query_embedding) as similarity,
        rc.metadata
    from report_chunks rc
    where (filter_report_id is null or rc.report_id = filter_report_id)
    order by rc.embedding <=> query_embedding
    limit match_count;
end;
$$;


-- ==============================================================================
-- 5. KNOWLEDGE GRAPH SCHEMA: HUB-AND-SPOKE ARCHITECTURE
-- Hub: expeditions
-- Spokes: documents, datasets, media
-- ==============================================================================

-- A. EXPEDITIONS (THE HUBS)
create table if not exists expeditions (
    id text primary key, -- e.g. 'exp-043', 'exp-025', 'exp-arc-015'
    expedition_number int,
    name text not null,
    short_name text not null,
    region text not null, -- 'Antarctica', 'Arctic', 'Himalaya', 'Southern Ocean'
    polar_region text,
    year int not null,
    start_date date,
    end_date date,
    status text default 'Completed',
    description text,
    objectives text[],
    chief_scientist text,
    research_summary text,
    embedding vector(384),
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- B. DOCUMENTS & REPORTS (SPOKE)
create table if not exists documents (
    id text primary key,
    expedition_id text references expeditions(id) on delete set null,
    title text not null,
    doc_type text default 'Scientific Report',
    year int,
    region text,
    file_path text,
    download_url text,
    file_size text,
    pages int,
    summary text,
    embedding vector(384),
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- C. DATASETS (SPOKE)
create table if not exists datasets (
    id text primary key,
    expedition_id text references expeditions(id) on delete set null,
    title text not null,
    station text,
    parameter text,
    dataset_type text default 'Meteorological',
    year int,
    region text,
    file_path text,
    row_count int,
    columns text[],
    sample_data jsonb default '[]'::jsonb,
    summary text,
    embedding vector(384),
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- D. MEDIA & PHOTOS (SPOKE)
create table if not exists media (
    id text primary key,
    expedition_id text references expeditions(id) on delete set null,
    title text not null,
    category text, -- 'Stations', 'Iceberg', 'Penguins', 'Seal', 'Auroras', 'Field work'
    region text default 'Antarctica',
    file_path text,
    url text,
    caption text,
    embedding vector(384),
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for vector similarity search on Knowledge Graph
create index if not exists expeditions_embedding_idx on expeditions using ivfflat (embedding vector_cosine_ops) with (lists = 20);
create index if not exists documents_embedding_idx on documents using ivfflat (embedding vector_cosine_ops) with (lists = 50);
create index if not exists datasets_embedding_idx on datasets using ivfflat (embedding vector_cosine_ops) with (lists = 50);
create index if not exists media_embedding_idx on media using ivfflat (embedding vector_cosine_ops) with (lists = 50);
