// Backward Compatibility Wrapper for Phase 1 components
export * from "./data/types";
export * from "./data/sources";
export * from "./data/institutions";
export * from "./data/researchers";
export * from "./data/locations";
export * from "./data/expeditions";
export * from "./data/projects";
export * from "./data/datasets";
export * from "./data/publications";
export * from "./data/topics";
export * from "./data/education";
export * from "./data/outreach";
export * from "./data/relationships";
export * from "./data/validation";
export * from "./data/access-layer";

import { MOCK_EXPEDITIONS } from "./data/expeditions";
import { MOCK_RESEARCHERS } from "./data/researchers";
import { MOCK_DATASETS } from "./data/datasets";
import { MOCK_PUBLICATIONS } from "./data/publications";
import { MOCK_STATIONS } from "./data/locations";
import { MOCK_EDUCATION_RESOURCES } from "./data/education";
import { MOCK_OUTREACH_CONTENT } from "./data/outreach";

export const MOCK_EXPEDITION_LIST = MOCK_EXPEDITIONS;
export const MOCK_EDUCATION = MOCK_EDUCATION_RESOURCES;
export const MOCK_OUTREACH = MOCK_OUTREACH_CONTENT;

export const MOCK_STATS = {
  totalExpeditions: "40+ Antarctic / 15+ Arctic",
  polarStations: "4 Stations (Maitri, Bharati, Himadri, Himansh)",
  publicationsCount: "1,200+ Research Papers",
  datasetsCount: "450+ Scientific Datasets",
  researchersCount: "600+ Polar Scientists",
};
