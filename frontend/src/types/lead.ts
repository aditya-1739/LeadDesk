export interface LeadCreateInput {
  name: string;
  location: string;
  propertyRequirement: string;
  budget: string;
  buyingTimeline: string;
  customerMessage: string;
}

export interface CreatedLeadResult {
  id: string;
  name: string;
  priorityScore: number;
  priorityLabel: string;
}
