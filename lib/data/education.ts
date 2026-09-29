import { EducationalResource } from "./types";

export const MOCK_EDUCATION_RESOURCES: EducationalResource[] = [
  {
    id: "edu-001",
    title: "Antarctic Ice Cores & Climate History Masterclass",
    description: "Visual classroom lesson introducing how ancient atmospheric gas bubbles trapped in polar ice cores reveal historical CO2 and temperature cycles.",
    audience: "STUDENT",
    educationLevel: "School",
    topicIds: ["top-ice-cores"],
    sourceEntityIds: ["ds-002", "pub-102"],
    contentType: "LESSON",
    difficulty: "Beginner",
    status: "PUBLISHED",
  },
  {
    id: "edu-002",
    title: "Polar Oceanography & IndARC Mooring Data Exercise",
    description: "Classroom activity guide featuring real CTD depth profiles from Svalbard fjords to teach thermohaline circulation.",
    audience: "TEACHER",
    educationLevel: "Undergraduate",
    topicIds: ["top-oceanography"],
    sourceEntityIds: ["ds-003", "pub-103"],
    contentType: "TEACHER_GUIDE",
    difficulty: "Intermediate",
    status: "PUBLISHED",
  },
  {
    id: "edu-003",
    title: "Himalayan Cryosphere Field Measurement & Safety Manual",
    description: "Protocols for high-altitude glacier stake installation, DGPS surface elevation survey, and weather station calibration.",
    audience: "RESEARCHER",
    educationLevel: "Advanced Research",
    topicIds: ["top-glaciers"],
    sourceEntityIds: ["ds-004", "pub-104"],
    contentType: "ACTIVITY",
    difficulty: "Advanced",
    status: "PUBLISHED",
  }
];
