import { useState, type FormEvent } from "react";
import { createLead } from "../../services/api";
import type { LeadCreateInput, CreatedLeadResult } from "../../types/lead";

interface LeadFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

const INITIAL_FORM: LeadCreateInput = {
  name: "",
  location: "",
  propertyRequirement: "",
  budget: "",
  buyingTimeline: "",
  customerMessage: "",
};

export default function LeadForm({ onCancel, onSuccess }: LeadFormProps) {
  const [formData, setFormData] = useState<LeadCreateInput>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLead, setCreatedLead] = useState<CreatedLeadResult | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed: LeadCreateInput = {
      name: formData.name.trim(),
      location: formData.location.trim(),
      propertyRequirement: formData.propertyRequirement.trim(),
      budget: formData.budget.trim(),
      buyingTimeline: formData.buyingTimeline.trim(),
      customerMessage: formData.customerMessage.trim(),
    };

    if (
      !trimmed.name ||
      !trimmed.location ||
      !trimmed.propertyRequirement ||
      !trimmed.budget ||
      !trimmed.buyingTimeline ||
      !trimmed.customerMessage
    ) {
      setError("All fields are required. Please fill in all fields.");
      return;
    }

    setLoading(true);
    let success = false;
    let result: CreatedLeadResult | null = null;
    try {
      result = await createLead(trimmed);
      success = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the lead. Please try again.");
    } finally {
      setLoading(false);
    }

    if (success && result) {
      setCreatedLead(result);
    }
  };

  if (createdLead) {
    return (
      <div className="max-w-xl mx-auto rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-lg font-semibold text-slate-900">Lead Created Successfully</h2>
        <p className="mt-1 text-sm text-slate-500">
          AI analysis and priority scoring completed. You can now review the lead from the Leads workspace.
        </p>
        <div className="mt-4 rounded-md bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-900">{createdLead.name}</span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
            {createdLead.priorityLabel} · {createdLead.priorityScore}
          </span>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => {
              setCreatedLead(null);
              setFormData(INITIAL_FORM);
              onSuccess?.();
            }}
            className="rounded-md bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Create Another Lead
          </button>
          <button
            type="button"
            onClick={onSuccess || onCancel}
            className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
      <h2 className="text-lg font-semibold text-slate-900">New Lead</h2>
      <p className="text-sm text-slate-500 mb-5">
        Add a customer lead and let AI analyze its priority.
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="lead-name" className="block text-sm font-medium text-slate-700">Name</label>
          <input
            id="lead-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-hidden"
          />
        </div>
        <div>
          <label htmlFor="lead-location" className="block text-sm font-medium text-slate-700">Location</label>
          <input
            id="lead-location"
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-hidden"
          />
        </div>
        <div>
          <label htmlFor="lead-req" className="block text-sm font-medium text-slate-700">Property Requirement</label>
          <input
            id="lead-req"
            type="text"
            value={formData.propertyRequirement}
            onChange={(e) => setFormData({ ...formData, propertyRequirement: e.target.value })}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-hidden"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lead-budget" className="block text-sm font-medium text-slate-700">Budget</label>
            <input
              id="lead-budget"
              type="text"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label htmlFor="lead-timeline" className="block text-sm font-medium text-slate-700">Buying Timeline</label>
            <input
              id="lead-timeline"
              type="text"
              value={formData.buyingTimeline}
              onChange={(e) => setFormData({ ...formData, buyingTimeline: e.target.value })}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-hidden"
            />
          </div>
        </div>
        <div>
          <label htmlFor="lead-message" className="block text-sm font-medium text-slate-700">Customer Message</label>
          <textarea
            id="lead-message"
            rows={4}
            value={formData.customerMessage}
            onChange={(e) => setFormData({ ...formData, customerMessage: e.target.value })}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 transition-opacity cursor-pointer"
        >
          {loading ? "Analyzing lead..." : "Create Lead"}
        </button>
      </div>
    </form>
  );
}

