export interface LeadCreateInput {
  name: string;
  location: string;
  propertyRequirement: string;
  budget: string;
  buyingTimeline: string;
  customerMessage: string;
  phone?: string;
  email?: string;
}

export interface CreatedLeadResult {
  id: string;
  name: string;
  priorityScore: number;
  priorityLabel: string;
  status?: string;
  location?: string;
  propertyRequirement?: string;
  budget?: string;
  buyingTimeline?: string;
  phone?: string;
  email?: string;
}

export interface ScoreSignal {
  score: number;
  reason: string;
}

export interface LeadAnalysis {
  summary: string;
  intent: string;
  requirements: string[];
  objections: string[];
  nextAction: string;
  suggestedResponse: string;
  intentStrength: ScoreSignal;
  timelineUrgency: ScoreSignal;
  budgetFit: ScoreSignal;
  requirementClarity: ScoreSignal;
  engagementSignal: ScoreSignal;
}

export interface FollowUpItem {
  action: string;
  dueAt: string;
  reason: string;
  status: string;
}

export interface LeadListItem {
  id: string;
  name: string;
  location: string;
  propertyRequirement: string;
  budget: string;
  buyingTimeline: string;
  priorityScore: number;
  priorityLabel: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  followUpPlan?: FollowUpItem[];
  phone?: string;
  email?: string;
}

export interface LeadDetail {
  id: string;
  name: string;
  location: string;
  propertyRequirement: string;
  budget: string;
  buyingTimeline: string;
  customerMessage: string;
  analysis: LeadAnalysis;
  priorityScore: number;
  priorityLabel: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  followUpPlan?: FollowUpItem[];
  phone?: string;
  email?: string;
}

export type ContactMethod = "phone" | "email" | "whatsapp" | "instagram";

export interface ContactDraftRequest {
  method: ContactMethod;
}

export interface ContactDraftResponse {
  method: ContactMethod;
  subject?: string;
  body?: string;
  message?: string;
  script?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LeadChatRequest {
  message: string;
  history: ChatMessage[];
}

export interface LeadChatResponse {
  reply: string;
}




