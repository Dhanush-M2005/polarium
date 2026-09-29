import { MOCK_EXPEDITIONS } from "./expeditions";
import { MOCK_RESEARCHERS } from "./researchers";
import { MOCK_INSTITUTIONS } from "./institutions";
import { MOCK_PROJECTS } from "./projects";
import { MOCK_DATASETS } from "./datasets";
import { MOCK_PUBLICATIONS } from "./publications";
import { MOCK_STATIONS, MOCK_LOCATIONS } from "./locations";

export interface ValidationReport {
  isValid: boolean;
  duplicateIds: string[];
  missingReferences: Array<{ entity: string; id: string; target: string; missingId: string }>;
  invalidCoordinates: Array<{ entity: string; id: string; lat: number; lng: number }>;
  warnings: string[];
}

export function validateKnowledgeData(): ValidationReport {
  const duplicateIds: string[] = [];
  const missingReferences: Array<{ entity: string; id: string; target: string; missingId: string }> = [];
  const invalidCoordinates: Array<{ entity: string; id: string; lat: number; lng: number }> = [];
  const warnings: string[] = [];

  const allIds = new Set<string>();

  const checkId = (id: string, entityType: string) => {
    if (!id) {
      warnings.push(`Empty ID found in ${entityType}`);
      return;
    }
    if (allIds.has(id)) {
      duplicateIds.push(id);
    } else {
      allIds.add(id);
    }
  };

  // Collect all valid IDs
  MOCK_EXPEDITIONS.forEach((e) => checkId(e.id, "Expedition"));
  MOCK_RESEARCHERS.forEach((r) => checkId(r.id, "Researcher"));
  MOCK_INSTITUTIONS.forEach((i) => checkId(i.id, "Institution"));
  MOCK_PROJECTS.forEach((p) => checkId(p.id, "ResearchProject"));
  MOCK_DATASETS.forEach((d) => checkId(d.id, "Dataset"));
  MOCK_PUBLICATIONS.forEach((pub) => checkId(pub.id, "Publication"));
  MOCK_STATIONS.forEach((s) => checkId(s.id, "ResearchStation"));
  MOCK_LOCATIONS.forEach((l) => checkId(l.id, "Location"));

  // Check coordinates
  MOCK_STATIONS.forEach((s) => {
    if (s.latitude < -90 || s.latitude > 90 || s.longitude < -180 || s.longitude > 180) {
      invalidCoordinates.push({ entity: "ResearchStation", id: s.id, lat: s.latitude, lng: s.longitude });
    }
  });
  MOCK_LOCATIONS.forEach((l) => {
    if (l.latitude < -90 || l.latitude > 90 || l.longitude < -180 || l.longitude > 180) {
      invalidCoordinates.push({ entity: "Location", id: l.id, lat: l.latitude, lng: l.longitude });
    }
  });

  // Check references
  MOCK_PROJECTS.forEach((p) => {
    p.researcherIds.forEach((rid) => {
      if (!allIds.has(rid)) {
        missingReferences.push({ entity: "ResearchProject", id: p.id, target: "Researcher", missingId: rid });
      }
    });
  });

  MOCK_DATASETS.forEach((d) => {
    d.creatorIds.forEach((cid) => {
      if (!allIds.has(cid)) {
        missingReferences.push({ entity: "Dataset", id: d.id, target: "Researcher", missingId: cid });
      }
    });
  });

  const isValid = duplicateIds.length === 0 && missingReferences.length === 0 && invalidCoordinates.length === 0;

  return {
    isValid,
    duplicateIds,
    missingReferences,
    invalidCoordinates,
    warnings,
  };
}
