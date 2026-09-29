import { KnowledgeRelationship } from "./types";
import { PROTOTYPE_SOURCE } from "./sources";

export const MOCK_KNOWLEDGE_RELATIONSHIPS: KnowledgeRelationship[] = [
  // Expedition -> Station Relationships
  {
    id: "rel-001",
    sourceEntityType: "Expedition",
    sourceEntityId: "exp-022",
    relationshipType: "LOCATED_AT",
    targetEntityType: "ResearchStation",
    targetEntityId: "st-maitri",
    confidence: 1.0,
    source: PROTOTYPE_SOURCE,
  },
  {
    id: "rel-002",
    sourceEntityType: "Expedition",
    sourceEntityId: "exp-023",
    relationshipType: "LOCATED_AT",
    targetEntityType: "ResearchStation",
    targetEntityId: "st-bharati",
    confidence: 1.0,
    source: PROTOTYPE_SOURCE,
  },
  {
    id: "rel-003",
    sourceEntityType: "Expedition",
    sourceEntityId: "exp-arc-015",
    relationshipType: "LOCATED_AT",
    targetEntityType: "ResearchStation",
    targetEntityId: "st-himadri",
    confidence: 1.0,
    source: PROTOTYPE_SOURCE,
  },
  {
    id: "rel-004",
    sourceEntityType: "Expedition",
    sourceEntityId: "exp-him-008",
    relationshipType: "LOCATED_AT",
    targetEntityType: "ResearchStation",
    targetEntityId: "st-himansh",
    confidence: 1.0,
    source: PROTOTYPE_SOURCE,
  },

  // Project -> Expedition Relationships
  {
    id: "rel-005",
    sourceEntityType: "ResearchProject",
    sourceEntityId: "proj-001",
    relationshipType: "CONDUCTED_DURING",
    targetEntityType: "Expedition",
    targetEntityId: "exp-022",
    confidence: 1.0,
    source: PROTOTYPE_SOURCE,
  },
  {
    id: "rel-006",
    sourceEntityType: "ResearchProject",
    sourceEntityId: "proj-004",
    relationshipType: "CONDUCTED_DURING",
    targetEntityType: "Expedition",
    targetEntityId: "exp-025",
    confidence: 1.0,
    source: PROTOTYPE_SOURCE,
  },

  // Publication -> Researcher Relationships
  {
    id: "rel-007",
    sourceEntityType: "Publication",
    sourceEntityId: "pub-101",
    relationshipType: "AUTHORED_BY",
    targetEntityType: "Researcher",
    targetEntityId: "res-05",
    confidence: 1.0,
    source: PROTOTYPE_SOURCE,
  },
  {
    id: "rel-008",
    sourceEntityType: "Publication",
    sourceEntityId: "pub-102",
    relationshipType: "AUTHORED_BY",
    targetEntityType: "Researcher",
    targetEntityId: "res-01",
    confidence: 1.0,
    source: PROTOTYPE_SOURCE,
  },

  // Dataset -> Project Relationships
  {
    id: "rel-009",
    sourceEntityType: "Dataset",
    sourceEntityId: "ds-001",
    relationshipType: "GENERATED_FROM",
    targetEntityType: "ResearchProject",
    targetEntityId: "proj-001",
    confidence: 1.0,
    source: PROTOTYPE_SOURCE,
  },
  {
    id: "rel-010",
    sourceEntityType: "Dataset",
    sourceEntityId: "ds-002",
    relationshipType: "GENERATED_FROM",
    targetEntityType: "ResearchProject",
    targetEntityId: "proj-004",
    confidence: 1.0,
    source: PROTOTYPE_SOURCE,
  },
  {
    id: "rel-011",
    sourceEntityType: "Dataset",
    sourceEntityId: "ds-003",
    relationshipType: "GENERATED_FROM",
    targetEntityType: "ResearchProject",
    targetEntityId: "proj-002",
    confidence: 1.0,
    source: PROTOTYPE_SOURCE,
  }
];
