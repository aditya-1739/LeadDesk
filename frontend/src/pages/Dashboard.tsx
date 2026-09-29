import { useState, useEffect } from "react";
import { getLeads } from "../services/api";
import type { LeadListItem } from "../types/lead";
import LeadList from "../components/leads/LeadList";

export default function Dashboard() {
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLeads() {
      try {
        const data = await getLeads();
        if (isMounted) {
          setLeads(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load leads. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadLeads();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-slate-500">
        Loading leads...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
        {error}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-12 text-center bg-white">
        <h2 className="text-base font-semibold text-slate-800">No leads yet.</h2>
        <p className="mt-1 text-sm text-slate-500">
          Click &ldquo;+ New Lead&rdquo; to add a lead and let AI prioritize it.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          Prioritized Leads ({leads.length})
        </h2>
        <span className="text-xs text-slate-500">Ranked by AI priority score</span>
      </div>
      <LeadList
        leads={leads}
        selectedLeadId={selectedLeadId}
        onSelectLead={setSelectedLeadId}
      />
    </div>
  );
}
