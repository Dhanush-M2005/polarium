export type ScientificDiscipline =
  | "GLACIOLOGY"
  | "CLIMATE_SCIENCE"
  | "METEOROLOGY"
  | "OCEANOGRAPHY"
  | "GEOLOGY"
  | "GEOPHYSICS"
  | "BIOLOGY"
  | "MARINE_BIOLOGY"
  | "ATMOSPHERIC_SCIENCE"
  | "REMOTE_SENSING"
  | "EARTH_SCIENCE"
  | "ENVIRONMENTAL_SCIENCE"
  | "POLAR_ECOLOGY"
  | "OTHER";

export type AccessLevel = "PUBLIC" | "RESEARCHER" | "RESTRICTED";

export type DatasetType =
  | "OBSERVATIONAL"
  | "EXPERIMENTAL"
  | "REMOTE_SENSING"
  | "CLIMATE"
  | "METEOROLOGICAL"
  | "OCEANOGRAPHIC"
  | "GLACIOLOGICAL"
  | "GEOPHYSICAL"
  | "BIOLOGICAL"
  | "OTHER";

export type PublicationType =
  | "JOURNAL_ARTICLE"
  | "CONFERENCE_PAPER"
  | "TECHNICAL_REPORT"
  | "BOOK_CHAPTER"
  | "THESIS"
  | "OTHER";

export type ReportType =
  | "EXPEDITION_REPORT"
  | "TECHNICAL_REPORT"
  | "PROJECT_REPORT"
  | "ANNUAL_REPORT"
  | "OTHER";

export type LocationType =
  | "STATION"
  | "RESEARCH_AREA"
  | "FIELD_SITE"
  | "OCEAN_REGION"
  | "GLACIER"
  | "MOUNTAIN"
  | "OTHER";

export type MediaType =
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "INFOGRAPHIC"
  | "DOCUMENT";

export type ActivityType =
  | "FIELD_OBSERVATION"
  | "SAMPLE_COLLECTION"
  | "INSTRUMENT_DEPLOYMENT"
  | "LABORATORY_ANALYSIS"
  | "SURVEY"
  | "MONITORING"
  | "OTHER";

export type ProposalStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

export type SourceType =
  | "NCPOR"
  | "NPDC"
  | "PUBLICATION"
  | "RESEARCH_REPORT"
  | "AUTHORIZED_DATASET"
  | "PROTOTYPE"
  | "OTHER";

export type TrustLevel =
  | "AUTHORITATIVE"
  | "VERIFIED"
  | "SECONDARY"
  | "PROTOTYPE";

export interface DataSource {
  id: string;
  name: string;
  sourceType: SourceType;
  description: string;
  url?: string;
  organization: string;
  accessDate: string;
  trustLevel: TrustLevel;
  licenseId?: string;
}

export interface License {
  id: string;
  name: string;
  shortName: string;
  description: string;
  url?: string;
  usageRestrictions?: string;
}

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  type: string;
  location: string;
  description: string;
  website?: string;
  researchDomains: string[];
  researcherIds: string[];
  projectIds: string[];
  source: DataSource;
}

export interface Researcher {
  id: string;
  name: string;
  designation: string;
  institutionId: string;
  department: string;
  specializations: string[];
  researchDomains: string[];
  profileSummary: string;
  orcid?: string;
  email?: string;
  website?: string;
  publicationIds: string[];
  projectIds: string[];
  expeditionIds: string[];
  locationIds: string[];
  source: DataSource;
}

export interface ExpeditionRoutePoint {
  latitude: number;
  longitude: number;
  sequence: number;
  name?: string;
  timestamp?: string;
}

export interface ExpeditionRoute {
  id: string;
  expeditionId: string;
  name: string;
  points: ExpeditionRoutePoint[];
  startLocationId: string;
  endLocationId: string;
  description: string;
  source: DataSource;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  region: "Antarctica" | "Arctic" | "Himalaya" | "Southern Ocean" | "Global";
  country?: string;
  latitude: number;
  longitude: number;
  description: string;
  parentLocationId?: string;
  researchDomain?: string;
  projectIds: string[];
  datasetIds: string[];
  expeditionIds: string[];
  source: DataSource;
}

export interface ResearchStation {
  id: string;
  name: string;
  shortName: string;
  region: "Antarctica" | "Arctic" | "Himalaya";
  country: string;
  latitude: number;
  longitude: number;
  stationType: "Permanent Station" | "High Altitude Observatory" | "Arctic Base";
  status: "Operational" | "Seasonal" | "Decommissioned";
  description: string;
  researchDomains: string[];
  expeditionIds: string[];
  projectIds: string[];
  datasetIds: string[];
  researcherIds: string[];
  summerCapacity?: number;
  winterCapacity?: number;
  source: DataSource;
}

export interface Expedition {
  id: string;
  expeditionNumber: number;
  name: string;
  shortName: string;
  region: "Antarctica" | "Arctic" | "Himalaya";
  polarRegion: string;
  year: number;
  startDate: string;
  endDate: string;
  status: "Completed" | "Ongoing" | "Archived";
  description: string;
  objectives: string[];
  chiefScientist: string;
  chiefScientistId?: string;
  participatingResearchers: string[];
  participatingInstitutions: string[];
  projects: string[];
  locations: string[];
  routes?: string[];
  datasets: string[];
  reports: string[];
  publications: string[];
  media?: string[];
  topics: string[];
  source: DataSource;
  lastUpdated: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  objectives: string[];
  researchDomain: string;
  disciplines: ScientificDiscipline[];
  principalInvestigatorId: string;
  researcherIds: string[];
  institutionIds: string[];
  expeditionIds: string[];
  locationIds: string[];
  datasetIds: string[];
  publicationIds: string[];
  reportIds: string[];
  status: "Active" | "Completed" | "Planned";
  startDate: string;
  endDate: string;
  source: DataSource;
}

export interface ProjectProposal {
  id: string;
  title: string;
  summary: string;
  researchDomain: string;
  principalInvestigatorId: string;
  institutionId: string;
  proposedExpeditionIds: string[];
  status: ProposalStatus;
  submittedDate: string;
  approvalDate?: string;
  relatedProjectId?: string;
  source: DataSource;
}

export interface DatasetVersion {
  id: string;
  datasetId: string;
  version: string;
  releaseDate: string;
  changeSummary: string;
  fileIds: string[];
  checksum?: string;
  status: "CURRENT" | "ARCHIVED" | "DEPRECATED";
  source: DataSource;
}

export interface SpatialCoverage {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  description?: string;
}

export interface TemporalCoverage {
  start: string;
  end: string;
}

export interface Dataset {
  id: string;
  title: string;
  description: string;
  abstract: string;
  datasetType: DatasetType;
  researchDomain: string;
  disciplines: ScientificDiscipline[];
  keywords: string[];
  publisher: string;
  creatorIds: string[];
  institutionIds: string[];
  projectIds: string[];
  expeditionIds: string[];
  locationIds: string[];
  coverageStart: string;
  coverageEnd: string;
  spatialCoverage?: SpatialCoverage;
  temporalCoverage?: TemporalCoverage;
  formats: string[];
  size: string;
  version: string;
  versionIds: string[];
  licenseId: string;
  doi?: string;
  accessLevel: AccessLevel;
  status: "ACTIVE" | "ARCHIVED";
  source: DataSource;
  createdAt: string;
  updatedAt: string;
}

export interface Publication {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  authorIds: string[];
  publicationType: PublicationType;
  journal: string;
  year: number;
  doi?: string;
  keywords: string[];
  researchDomain: string;
  projectIds: string[];
  expeditionIds: string[];
  datasetIds: string[];
  citationCount: number;
  source: DataSource;
  publishedDate: string;
}

export interface Report {
  id: string;
  title: string;
  reportType: ReportType;
  description: string;
  authors: string[];
  expeditionIds: string[];
  projectIds: string[];
  publicationDate: string;
  documentUrl: string;
  pageCount: number;
  keywords: string[];
  accessLevel: AccessLevel;
  source: DataSource;
  version: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  description: string;
  mediaType: MediaType;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  credit: string;
  licenseId: string;
  expeditionIds: string[];
  projectIds: string[];
  locationIds: string[];
  researcherIds: string[];
  tags: string[];
  source: DataSource;
  accessLevel: AccessLevel;
}

export interface ResearchActivity {
  id: string;
  title: string;
  description: string;
  activityType: ActivityType;
  date: string;
  expeditionId?: string;
  projectId?: string;
  researcherIds: string[];
  locationId: string;
  researchDomain: string;
  source: DataSource;
}

export interface KnowledgeTopic {
  id: string;
  name: string;
  description: string;
  parentTopicId?: string;
  keywords: string[];
  relatedEntityIds: string[];
  source: DataSource;
}

export interface EducationalResource {
  id: string;
  title: string;
  description: string;
  audience: "STUDENT" | "TEACHER" | "RESEARCHER" | "GENERAL_PUBLIC";
  educationLevel: "School" | "Undergraduate" | "Advanced Research";
  topicIds: string[];
  sourceEntityIds: string[];
  contentType: "LESSON" | "QUIZ" | "FLASHCARDS" | "EXPLAINER" | "TEACHER_GUIDE" | "ACTIVITY";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  status: "PUBLISHED" | "DRAFT";
}

export interface OutreachContent {
  id: string;
  title: string;
  contentType: "ARTICLE" | "SOCIAL_POST" | "LINKEDIN_POST" | "INSTAGRAM_POST" | "X_POST" | "INFOGRAPHIC" | "VIDEO_SCRIPT" | "REEL_SCRIPT";
  audience: "General Public" | "Policy Makers" | "Students";
  platform: string;
  sourceEntityIds: string[];
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
  updatedAt: string;
  reviewStatus: "DRAFT" | "SCIENTIFIC_REVIEW" | "COMMUNICATION_REVIEW" | "APPROVED" | "PUBLISHED" | "REJECTED";
}

export type RelationshipType =
  | "PART_OF"
  | "RELATED_TO"
  | "AUTHORED_BY"
  | "CONDUCTED_DURING"
  | "LOCATED_AT"
  | "GENERATED_FROM"
  | "SUPPORTED_BY"
  | "USES_DATASET"
  | "RESULTED_IN"
  | "ASSOCIATED_WITH"
  | "PARTICIPATED_IN";

export interface KnowledgeRelationship {
  id: string;
  sourceEntityType: string;
  sourceEntityId: string;
  relationshipType: RelationshipType;
  targetEntityType: string;
  targetEntityId: string;
  confidence: number; // 0.0 - 1.0
  source: DataSource;
}

export interface SearchDocument {
  id: string;
  entityType: string;
  entityId: string;
  title: string;
  description: string;
  keywords: string[];
  topics: string[];
  region?: string;
  year?: number;
  relatedIds: string[];
  source: DataSource;
}
