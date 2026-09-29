import {
  Expedition,
  Researcher,
  Institution,
  ResearchProject,
  ProjectProposal,
  Dataset,
  DatasetVersion,
  Publication,
  Report,
  ResearchStation,
  Location,
  SearchDocument,
  KnowledgeRelationship,
} from "./types";
import { MOCK_EXPEDITIONS } from "./expeditions";
import { MOCK_RESEARCHERS } from "./researchers";
import { MOCK_INSTITUTIONS } from "./institutions";
import { MOCK_PROJECTS, MOCK_PROPOSALS } from "./projects";
import { MOCK_DATASETS, MOCK_DATASET_VERSIONS } from "./datasets";
import { MOCK_PUBLICATIONS, MOCK_REPORTS } from "./publications";
import { MOCK_STATIONS, MOCK_LOCATIONS } from "./locations";
import { MOCK_KNOWLEDGE_RELATIONSHIPS } from "./relationships";

// EXPEDITIONS
export function getExpeditions(region?: string): Expedition[] {
  if (!region || region === "ALL") return MOCK_EXPEDITIONS;
  return MOCK_EXPEDITIONS.filter((e) => e.region === region);
}

export function getExpeditionById(id: string): Expedition | undefined {
  return MOCK_EXPEDITIONS.find((e) => e.id === id || e.id === `exp-${id}`);
}

// RESEARCHERS
export function getResearchers(domain?: string): Researcher[] {
  if (!domain || domain === "ALL") return MOCK_RESEARCHERS;
  return MOCK_RESEARCHERS.filter((r) => r.researchDomains.includes(domain));
}

export function getResearcherById(id: string): Researcher | undefined {
  return MOCK_RESEARCHERS.find((r) => r.id === id || r.id === `res-${id}`);
}

// INSTITUTIONS
export function getInstitutions(): Institution[] {
  return MOCK_INSTITUTIONS;
}

export function getInstitutionById(id: string): Institution | undefined {
  return MOCK_INSTITUTIONS.find((i) => i.id === id);
}

// RESEARCH PROJECTS
export function getProjects(domain?: string): ResearchProject[] {
  if (!domain || domain === "ALL") return MOCK_PROJECTS;
  return MOCK_PROJECTS.filter((p) => p.researchDomain === domain || p.disciplines.includes(domain as any));
}

export function getProjectById(id: string): ResearchProject | undefined {
  return MOCK_PROJECTS.find((p) => p.id === id || p.id === `proj-${id}`);
}

// PROJECT PROPOSALS
export function getProposals(): ProjectProposal[] {
  return MOCK_PROPOSALS;
}

export function getProposalById(id: string): ProjectProposal | undefined {
  return MOCK_PROPOSALS.find((p) => p.id === id);
}

// DATASETS
export function getDatasets(discipline?: string): Dataset[] {
  if (!discipline || discipline === "ALL") return MOCK_DATASETS;
  return MOCK_DATASETS.filter((d) => d.researchDomain === discipline || d.disciplines.includes(discipline as any));
}

export function getDatasetById(id: string): Dataset | undefined {
  return MOCK_DATASETS.find((d) => d.id === id || d.id === `ds-${id}`);
}

export function getDatasetVersions(datasetId: string): DatasetVersion[] {
  return MOCK_DATASET_VERSIONS.filter((v) => v.datasetId === datasetId);
}

// PUBLICATIONS
export function getPublications(type?: string): Publication[] {
  if (!type || type === "ALL") return MOCK_PUBLICATIONS;
  return MOCK_PUBLICATIONS.filter((pub) => pub.publicationType === type);
}

export function getPublicationById(id: string): Publication | undefined {
  return MOCK_PUBLICATIONS.find((pub) => pub.id === id || pub.id === `pub-${id}`);
}

// REPORTS
export function getReports(): Report[] {
  return MOCK_REPORTS;
}

export function getReportById(id: string): Report | undefined {
  return MOCK_REPORTS.find((rep) => rep.id === id);
}

// STATIONS & LOCATIONS
export function getStations(region?: string): ResearchStation[] {
  if (!region || region === "ALL") return MOCK_STATIONS;
  return MOCK_STATIONS.filter((s) => s.region === region);
}

export function getStationById(id: string): ResearchStation | undefined {
  return MOCK_STATIONS.find((s) => s.id === id || s.id === `st-${id}`);
}

export function getLocations(): Location[] {
  return MOCK_LOCATIONS;
}

export function getLocationById(id: string): Location | undefined {
  return MOCK_LOCATIONS.find((l) => l.id === id);
}

// KNOWLEDGE GRAPH RELATIONSHIPS
export function getRelatedEntities(entityType: string, entityId: string): KnowledgeRelationship[] {
  return MOCK_KNOWLEDGE_RELATIONSHIPS.filter(
    (rel) =>
      (rel.sourceEntityType === entityType && rel.sourceEntityId === entityId) ||
      (rel.targetEntityType === entityType && rel.targetEntityId === entityId)
  );
}

// SEARCH PREPARATION & DOMAIN SEARCH
export function getSearchIndex(): SearchDocument[] {
  const docs: SearchDocument[] = [];

  MOCK_EXPEDITIONS.forEach((e) => {
    docs.push({
      id: `doc-exp-${e.id}`,
      entityType: "Expedition",
      entityId: e.id,
      title: e.name,
      description: e.description,
      keywords: e.objectives,
      topics: e.topics,
      region: e.region,
      year: e.year,
      relatedIds: [...e.datasets, ...e.publications, ...e.projects],
      source: e.source,
    });
  });

  MOCK_DATASETS.forEach((d) => {
    docs.push({
      id: `doc-ds-${d.id}`,
      entityType: "Dataset",
      entityId: d.id,
      title: d.title,
      description: d.abstract,
      keywords: d.keywords,
      topics: [d.researchDomain],
      relatedIds: [...d.expeditionIds, ...d.projectIds, ...d.creatorIds],
      source: d.source,
    });
  });

  MOCK_PUBLICATIONS.forEach((pub) => {
    docs.push({
      id: `doc-pub-${pub.id}`,
      entityType: "Publication",
      entityId: pub.id,
      title: pub.title,
      description: pub.abstract,
      keywords: pub.keywords,
      topics: [pub.researchDomain],
      year: pub.year,
      relatedIds: [...pub.expeditionIds, ...pub.projectIds, ...pub.authorIds],
      source: pub.source,
    });
  });

  MOCK_RESEARCHERS.forEach((r) => {
    docs.push({
      id: `doc-res-${r.id}`,
      entityType: "Researcher",
      entityId: r.id,
      title: r.name,
      description: r.profileSummary,
      keywords: r.specializations,
      topics: r.researchDomains,
      relatedIds: [...r.expeditionIds, ...r.projectIds, ...r.publicationIds],
      source: r.source,
    });
  });

  return docs;
}

export function searchMockData(query: string): SearchDocument[] {
  if (!query.trim()) return getSearchIndex();
  const q = query.toLowerCase();
  return getSearchIndex().filter(
    (doc) =>
      doc.title.toLowerCase().includes(q) ||
      doc.description.toLowerCase().includes(q) ||
      doc.keywords.some((k) => k.toLowerCase().includes(q))
  );
}
