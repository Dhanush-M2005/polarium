import rawKnowledgeGraph from "./knowledge-graph.json";

export interface ExpeditionHub {
  id: string;
  expedition_number: number;
  name: string;
  short_name: string;
  region: "Antarctica" | "Arctic" | "Himalaya" | "Southern Ocean";
  polar_region: string;
  year: number;
  status: string;
  chief_scientist: string;
  description: string;
  objectives: string[];
  research_summary: string;
  keywords: string[];
  embedding?: number[];
}

export interface DatasetSampleRow {
  Year?: number;
  Parameter?: string;
  Value?: number | string | null;
  [key: string]: string | number | null | undefined;
}

export interface DatasetSpoke {
  id: string;
  expedition_id: string;
  expedition_name: string;
  title: string;
  station: string;
  parameter: string;
  dataset_type: string;
  year?: number | null;
  region: string;
  file_path: string;
  row_count: number;
  columns: string[];
  sample_data: DatasetSampleRow[];
  summary: string;
  match_confidence: number;
}

export interface DocumentSpoke {
  id: string;
  expedition_id: string;
  expedition_name: string;
  title: string;
  doc_type: string;
  year: number;
  region: string;
  file_size: string;
  pages: number;
  download_url: string;
  summary: string;
  match_confidence: number;
}

export interface MediaSpoke {
  id: string;
  expedition_id: string;
  expedition_name: string;
  title: string;
  category: string;
  region: string;
  url: string;
  caption: string;
  match_confidence: number;
}

export interface KnowledgeGraphData {
  metadata: {
    generated_by: string;
    agency: string;
    architecture: string;
    total_expeditions: number;
    total_datasets: number;
    total_documents: number;
    total_media: number;
  };
  expeditions: ExpeditionHub[];
  datasets: DatasetSpoke[];
  documents: DocumentSpoke[];
  media: MediaSpoke[];
}

const data = rawKnowledgeGraph as unknown as KnowledgeGraphData;

export function getKnowledgeGraph(): KnowledgeGraphData {
  return data;
}

export function getAllExpeditions(): ExpeditionHub[] {
  return data.expeditions || [];
}

export function getExpeditionById(id: string): ExpeditionHub | undefined {
  return data.expeditions?.find((exp) => exp.id === id);
}

export function getDatasetsForExpedition(expeditionId: string): DatasetSpoke[] {
  return (data.datasets || []).filter((ds) => ds.expedition_id === expeditionId);
}

export function getDocumentsForExpedition(expeditionId: string): DocumentSpoke[] {
  return (data.documents || []).filter((doc) => doc.expedition_id === expeditionId);
}

export function getMediaForExpedition(expeditionId: string): MediaSpoke[] {
  return (data.media || []).filter((m) => m.expedition_id === expeditionId);
}

export function getAllDatasets(): DatasetSpoke[] {
  return data.datasets || [];
}

export function getAllDocuments(): DocumentSpoke[] {
  return data.documents || [];
}

export function getAllMedia(): MediaSpoke[] {
  return data.media || [];
}

export function getGraphMetrics() {
  return {
    expeditionsCount: data.expeditions?.length || 0,
    datasetsCount: data.datasets?.length || 0,
    documentsCount: data.documents?.length || 0,
    mediaCount: data.media?.length || 0,
  };
}
