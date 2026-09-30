import type {
  LeadCreateInput,
  CreatedLeadResult,
  LeadListItem,
  LeadDetail,
  FollowUpItem,
  ContactMethod,
  ContactDraftResponse,
  ChatMessage,
  LeadChatResponse,
} from "../types/lead";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export async function createLead(data: LeadCreateInput): Promise<CreatedLeadResult> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }

  if (!response.ok) {
    throw new Error("Unable to create the lead. Please try again.");
  }

  return response.json();
}

export async function getLeads(): Promise<LeadListItem[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/leads`);
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }

  if (!response.ok) {
    throw new Error("Unable to load leads. Please try again.");
  }

  return response.json();
}

export async function getLead(leadId: string): Promise<LeadDetail> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/leads/${encodeURIComponent(leadId)}`);
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }

  if (!response.ok) {
    throw new Error("Unable to load lead details. Please try again.");
  }

  return response.json();
}

export async function updateLeadStatus(leadId: string, status: "CONTACTED"): Promise<LeadDetail> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/leads/${encodeURIComponent(leadId)}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }

  if (!response.ok) {
    throw new Error("Unable to update lead status. Please try again.");
  }

  return response.json();
}

export async function createFollowUpPlan(leadId: string): Promise<FollowUpItem> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/leads/${encodeURIComponent(leadId)}/follow-up-plan`, {
      method: "POST",
    });
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }

  if (!response.ok) {
    throw new Error("Unable to generate follow-up plan. Please try again.");
  }

  return response.json();
}

export async function deleteLead(leadId: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/leads/${encodeURIComponent(leadId)}`, {
      method: "DELETE",
    });
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }

  if (!response.ok) {
    throw new Error("Unable to delete lead. Please try again.");
  }
}

export async function generateContactDraft(
  leadId: string,
  method: ContactMethod
): Promise<ContactDraftResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/leads/${encodeURIComponent(leadId)}/contact-draft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ method }),
    });
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }

  if (!response.ok) {
    throw new Error("Unable to generate contact draft. Please try again.");
  }

  return response.json();
}

export async function chatWithLeadAgent(
  leadId: string,
  message: string,
  history: ChatMessage[]
): Promise<LeadChatResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/leads/${encodeURIComponent(leadId)}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, history }),
    });
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }

  if (!response.ok) {
    throw new Error("Unable to get AI assistant response. Please try again.");
  }

  return response.json();
}





