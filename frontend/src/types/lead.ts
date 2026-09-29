export interface LeadCreateInput {
  name: string;
  location: string;
  propertyRequirement: string;
  budget: string;
  buyingTimeline: string;
  customerMessage: string;
  buyerId?: string;
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
  status?: string;
}

export interface BuyerInquiryItem {
  id: string;
  name: string;
  location: string;
  propertyRequirement: string;
  budget: string;
  buyingTimeline: string;
  status: string;
  createdAt: string;
}


