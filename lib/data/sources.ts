import { DataSource, License } from "./types";

export const PROTOTYPE_SOURCE: DataSource = {
  id: "src-proto",
  name: "Polar Platform Knowledge Base",
  sourceType: "PROTOTYPE",
  description: "Standardized metadata schema configured for Phase 2 system exploration.",
  organization: "National Centre for Polar and Ocean Research (NCPOR)",
  accessDate: "2026-09-09",
  trustLevel: "PROTOTYPE",
};

export const NCPOR_VERIFIED_SOURCE: DataSource = {
  id: "src-ncpor-pub",
  name: "NCPOR Open Scientific Repository",
  sourceType: "NCPOR",
  description: "Verified historical publication and expedition archive.",
  organization: "Ministry of Earth Sciences, Govt. of India",
  accessDate: "2026-09-09",
  trustLevel: "VERIFIED",
};

export const MOCK_LICENSES: License[] = [
  {
    id: "lic-cc-by-4.0",
    name: "Creative Commons Attribution 4.0 International",
    shortName: "CC-BY 4.0",
    description: "Permits sharing and adaptation for any purpose with proper attribution.",
    url: "https://creativecommons.org/licenses/by/4.0/",
  },
  {
    id: "lic-ncpor-open",
    name: "NCPOR Open Scientific Data Policy",
    shortName: "NCPOR Open Data",
    description: "Free public access for academic research and non-commercial climate modeling.",
    usageRestrictions: "Requires citation of NCPOR project ID.",
  },
  {
    id: "lic-restricted",
    name: "Restricted Researcher Access Only",
    shortName: "Restricted Access",
    description: "Requires authorized researcher request and institutional approval.",
    usageRestrictions: "Embargoed or high-resolution sensor data.",
  }
];
