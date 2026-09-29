import { MediaAsset, ResearchActivity, KnowledgeTopic } from "./types";
import { PROTOTYPE_SOURCE } from "./sources";

export const MOCK_MEDIA: MediaAsset[] = [
  {
    id: "med-001",
    title: "Maitri Station Operations during 25th Silver Jubilee Traverse",
    description: "High-resolution field photograph showing snowcat vehicles preparing for continental ice sheet traverse.",
    mediaType: "IMAGE",
    url: "/media/maitri-traverse.jpg",
    caption: "Maitri Station snowcats lined up for Dronning Maud Land traverse.",
    credit: "NCPOR Expedition Archive",
    licenseId: "lic-cc-by-4.0",
    expeditionIds: ["exp-025"],
    projectIds: ["proj-004"],
    locationIds: ["loc-maitri"],
    researcherIds: ["res-01"],
    tags: ["Maitri", "Antarctica", "Traverse", "Snowcat"],
    source: PROTOTYPE_SOURCE,
    accessLevel: "PUBLIC",
  },
  {
    id: "med-002",
    title: "IndARC Mooring Deployment in Kongsfjorden",
    description: "Subsea deployment diagram of IndARC acoustic Doppler current profiler (ADCP) at 190m depth.",
    mediaType: "INFOGRAPHIC",
    url: "/media/indarc-mooring.png",
    caption: "IndARC sensor payload schematic.",
    credit: "NCPOR Arctic Sciences Group",
    licenseId: "lic-cc-by-4.0",
    expeditionIds: ["exp-arc-015"],
    projectIds: ["proj-002"],
    locationIds: ["loc-kongsfjorden"],
    researcherIds: ["res-03"],
    tags: ["IndARC", "Arctic", "Fjord", "Oceanography"],
    source: PROTOTYPE_SOURCE,
    accessLevel: "PUBLIC",
  }
];

export const MOCK_ACTIVITIES: ResearchActivity[] = [
  {
    id: "act-001",
    title: "70m Ice Core Drilling Operations",
    description: "Sub-zero ice core recovery using electromechanical drill during 25th Antarctic Expedition.",
    activityType: "SAMPLE_COLLECTION",
    date: "2006-01-15",
    expeditionId: "exp-025",
    projectId: "proj-004",
    researcherIds: ["res-01"],
    locationId: "loc-maitri",
    researchDomain: "Glaciology",
    source: PROTOTYPE_SOURCE,
  },
  {
    id: "act-002",
    title: "IndARC Subsurface Mooring Annual Recovery and Servicing",
    description: "Acoustic release trigger and data download cast in Kongsfjorden fjord.",
    activityType: "INSTRUMENT_DEPLOYMENT",
    date: "2023-08-10",
    expeditionId: "exp-arc-015",
    projectId: "proj-002",
    researcherIds: ["res-03"],
    locationId: "loc-kongsfjorden",
    researchDomain: "Oceanography",
    source: PROTOTYPE_SOURCE,
  }
];

export const MOCK_TOPICS: KnowledgeTopic[] = [
  {
    id: "top-ice-cores",
    name: "Ice Core Paleoclimatology",
    description: "Reconstruction of historical global temperature and greenhouse gas fluctuations from deep polar ice cores.",
    keywords: ["Ice Core", "Isotopes", "Paleoclimate", "delta-18O"],
    relatedEntityIds: ["ds-002", "pub-102", "proj-004"],
    source: PROTOTYPE_SOURCE,
  },
  {
    id: "top-atm-aerosols",
    name: "Atmospheric Aerosols & Surface Ozone",
    description: "Continuous spectral measurements of aerosol optical depth and seasonal ozone intrusion events.",
    keywords: ["Surface Ozone", "Aerosol Optical Depth", "Maitri", "Ultraviolet"],
    relatedEntityIds: ["ds-001", "pub-101", "proj-001"],
    source: PROTOTYPE_SOURCE,
  },
  {
    id: "top-oceanography",
    name: "Arctic Fjord Hydrodynamics",
    description: "Thermohaline circulation and Atlantic water oceanographic mass exchange in Svalbard fjords.",
    keywords: ["IndARC", "Kongsfjorden", "CTD", "Salinity", "Arctic Ocean"],
    relatedEntityIds: ["ds-003", "pub-103", "proj-002"],
    source: PROTOTYPE_SOURCE,
  },
  {
    id: "top-glaciers",
    name: "Himalayan Glacier Mass Balance",
    description: "Field ablation stake measurement and streamflow hydrology monitoring across Western Himalayan glaciers.",
    keywords: ["Mass Balance", "Himansh", "Sutri Dhaka", "Runoff"],
    relatedEntityIds: ["ds-004", "pub-104", "proj-003"],
    source: PROTOTYPE_SOURCE,
  }
];
