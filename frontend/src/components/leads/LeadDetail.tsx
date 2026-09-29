import { useState, useEffect } from "react";
import { getLead, updateLeadStatus, createFollowUpPlan } from "../../services/api";
import type { LeadDetail as LeadDetailType } from "../../types/lead";

interface LeadDetailProps {
  leadId: string;
  onBack: () => void;
  isPriority: boolean;
  onTogglePriority: () => void;
  onLeadUpdated?: (lead: LeadDetailType) => void;
  onDeleteLead?: (lead: { id: string; name: string }) => void;
}

const BADGE_STYLES: Record<string, string> = {
  HOT: "bg-red-50 text-red-700 border-red-200",
  WARM: "bg-amber-50 text-amber-700 border-amber-200",
  COLD: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function LeadDetail({
  leadId,
  onBack,
  isPriority,
  onTogglePriority,
  onLeadUpdated,
  onDeleteLead,
}: LeadDetailProps) {
  const [lead, setLead] = useState<LeadDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetail() {
      try {
        const data = await getLead(leadId);
        if (isMounted) {
          setLead(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load lead details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [leadId]);

  const handleMarkContacted = async () => {
    if (!lead || lead.status === "CONTACTED" || actionLoading) return;
    setActionLoading("contacted");
    try {
      const updated = await updateLeadStatus(lead.id, "CONTACTED");
      setLead(updated);
      onLeadUpdated?.(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to mark contacted.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFollowUp = async () => {
    if (!lead || actionLoading) return;
    setActionLoading("followup");
    try {
      const followUp = await createFollowUpPlan(lead.id);
      const updated: LeadDetailType = {
        ...lead,
        followUpPlan: [...(lead.followUpPlan || []), followUp],
      };
      setLead(updated);
      onLeadUpdated?.(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate follow-up.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-slate-500">
        Loading lead details...
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          ← Back to Leads
        </button>
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error || "Lead not found."}
        </div>
      </div>
    );
  }

  const badgeClass = BADGE_STYLES[lead.priorityLabel] || BADGE_STYLES.COLD;
  const analysis = lead.analysis;

  const signals = [
    { name: "Intent Strength", signal: analysis?.intentStrength },
    { name: "Timeline Urgency", signal: analysis?.timelineUrgency },
    { name: "Budget Fit", signal: analysis?.budgetFit },
    { name: "Requirement Clarity", signal: analysis?.requirementClarity },
    { name: "Engagement Signal", signal: analysis?.engagementSignal },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Top back button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          ← Back to Leads
        </button>
      </div>

      {/* Lead Header Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{lead.name}</h1>
            <p className="text-sm text-slate-500">{lead.location}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}
            >
              <span>{lead.priorityLabel}</span>
              <span>·</span>
              <span>{lead.priorityScore}</span>
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                lead.status === "CONTACTED"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {lead.status || "SUBMITTED"}
            </span>
            {onDeleteLead && (
              <button
                type="button"
                onClick={() => onDeleteLead({ id: lead.id, name: lead.name })}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                title="Delete lead"
              >
                Delete Lead
              </button>
            )}
          </div>
        </div>

        {/* Basic Details */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-xs">
          <div>
            <span className="text-slate-500 block">Property Requirement</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {lead.propertyRequirement}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Budget</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {lead.budget}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Buying Timeline</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {lead.buyingTimeline}
            </span>
          </div>
        </div>

        {/* Customer Message */}
        <div className="mt-4 border-t border-slate-100 pt-3">
          <span className="text-xs font-medium text-slate-500 block">Customer Message</span>
          <p className="mt-1 text-xs text-slate-700 bg-slate-50 rounded-md p-3 border border-slate-100 italic">
            &ldquo;{lead.customerMessage}&rdquo;
          </p>
        </div>
      </div>

      {/* AI Priority Signals */}
      {analysis && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs mb-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            AI Score Signals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {signals.map(({ name, signal }) => (
              <div key={name} className="rounded-md border border-slate-200 p-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">{name}</span>
                  <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {signal?.score ?? "—"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 line-clamp-3">
                  {signal?.reason || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis Details */}
      {analysis && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs mb-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            AI Lead Analysis
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-slate-700 block">Summary</span>
              <p className="text-slate-600 mt-0.5">{analysis.summary}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Intent</span>
              <p className="text-slate-600 mt-0.5">{analysis.intent}</p>
            </div>
            {analysis.requirements?.length > 0 && (
              <div>
                <span className="font-semibold text-slate-700 block">Key Requirements</span>
                <ul className="list-disc list-inside text-slate-600 mt-0.5 space-y-0.5">
                  {analysis.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.objections?.length > 0 && (
              <div>
                <span className="font-semibold text-slate-700 block">Objections / Concerns</span>
                <ul className="list-disc list-inside text-slate-600 mt-0.5 space-y-0.5">
                  {analysis.objections.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <span className="font-semibold text-slate-700 block">Recommended Next Action</span>
              <p className="text-slate-600 mt-0.5">{analysis.nextAction}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Suggested Response</span>
              <p className="text-slate-600 mt-0.5 italic bg-slate-50 p-2.5 rounded border border-slate-100">
                {analysis.suggestedResponse}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Follow-Up Plan Section */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Follow-Up Plan
          </h2>
          <span className="text-xs text-slate-500">
            {lead.followUpPlan?.length || 0} items
          </span>
        </div>

        {lead.followUpPlan && lead.followUpPlan.length > 0 ? (
          <div className="space-y-3">
            {lead.followUpPlan.map((item, idx) => (
              <div
                key={idx}
                className="rounded-md border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">{item.action}</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-2xs font-semibold text-amber-800">
                    {item.status} · Due {item.dueAt}
                  </span>
                </div>
                <p className="text-slate-600">{item.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            No follow-up planned yet. Click &ldquo;Follow Up&rdquo; on the action bar to generate a recommendation.
          </p>
        )}
      </div>

      {/* Sticky / Floating Quick-Action Bar */}
      <div className="fixed bottom-4 left-0 right-0 z-40 px-4">
        <div className="max-w-4xl mx-auto rounded-xl border border-slate-300 bg-white/95 backdrop-blur-xs p-3 shadow-lg flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-semibold text-slate-700 hidden sm:block">
            Quick Actions
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onTogglePriority}
              className={`flex-1 sm:flex-initial rounded-md px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer border ${
                isPriority
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {isPriority ? "✓ Remove from Priority" : "+ Add to Priority"}
            </button>

            <button
              type="button"
              onClick={handleMarkContacted}
              disabled={lead.status === "CONTACTED" || actionLoading === "contacted"}
              className={`flex-1 sm:flex-initial rounded-md px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer border ${
                lead.status === "CONTACTED"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 cursor-default"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              }`}
            >
              {actionLoading === "contacted"
                ? "Updating..."
                : lead.status === "CONTACTED"
                ? "✓ Contacted"
                : "Mark Contacted"}
            </button>

            <button
              type="button"
              onClick={handleFollowUp}
              disabled={actionLoading === "followup"}
              className="flex-1 sm:flex-initial rounded-md bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {actionLoading === "followup" ? "Generating..." : "Follow Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
