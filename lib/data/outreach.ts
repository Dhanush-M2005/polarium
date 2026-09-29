import { OutreachContent } from "./types";

export const MOCK_OUTREACH_CONTENT: OutreachContent[] = [
  {
    id: "out-001",
    title: "Exploring Schirmacher Oasis: 40 Years of Indian Science in Antarctica",
    contentType: "ARTICLE",
    audience: "General Public",
    platform: "Web Portal / Science Magazine",
    sourceEntityIds: ["exp-022", "exp-025", "st-maitri"],
    status: "PUBLISHED",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    reviewStatus: "APPROVED",
  },
  {
    id: "out-002",
    title: "Why does Arctic Fjord warming matter to the Indian Monsoon?",
    contentType: "X_POST",
    audience: "General Public",
    platform: "Twitter/X",
    sourceEntityIds: ["proj-002", "ds-003"],
    status: "PUBLISHED",
    createdAt: "2024-02-10",
    updatedAt: "2024-02-10",
    reviewStatus: "APPROVED",
  },
  {
    id: "out-003",
    title: "Behind the Scenes at Himansh: Life at 13,500 Feet in the Himalayas",
    contentType: "VIDEO_SCRIPT",
    audience: "Students",
    platform: "YouTube / Documentary",
    sourceEntityIds: ["st-himansh", "proj-003"],
    status: "PUBLISHED",
    createdAt: "2024-03-01",
    updatedAt: "2024-03-05",
    reviewStatus: "APPROVED",
  }
];
