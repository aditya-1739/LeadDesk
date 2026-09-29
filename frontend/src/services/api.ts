import type { LeadCreateInput, CreatedLeadResult } from "../types/lead";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

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

