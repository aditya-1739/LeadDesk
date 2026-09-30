import { useState, useEffect } from "react";
import { getLead, updateLeadStatus, createFollowUpPlan } from "../../services/api";
import type { LeadDetail as LeadDetailType, ContactMethod } from "../../types/lead";
import ContactDraftModal from "./ContactDraftModal";
import LeadAgentChat from "./LeadAgentChat";

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
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const [selectedContactMethod, setSelectedContactMethod] = useState<ContactMethod | null>(null);

  useEffect(() => {
    if (!contactMenuOpen) return;
    const handleClose = () => setContactMenuOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [contactMenuOpen]);

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
      <div className="mb-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <span className="text-sm leading-none">←</span>
          <span>Back to Leads</span>
        </button>
      </div>

      {/* Lead Header Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{lead.name}</h1>
            <p className="text-sm text-slate-500">{lead.location}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
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

            {/* Contact Action & Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setContactMenuOpen(!contactMenuOpen);
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Contact</span>
                <span className="text-[9px] text-slate-400">▼</span>
              </button>

              {contactMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 w-60 rounded-lg bg-white border border-slate-200 p-2 shadow-xl z-30"
                >
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Contact Method
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setContactMenuOpen(false);
                        setSelectedContactMethod("phone");
                      }}
                      className="flex items-center gap-2 rounded-md p-2 text-xs font-medium text-slate-700 hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Phone</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setContactMenuOpen(false);
                        setSelectedContactMethod("email");
                      }}
                      className="flex items-center gap-2 rounded-md p-2 text-xs font-medium text-slate-700 hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Email</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setContactMenuOpen(false);
                        setSelectedContactMethod("whatsapp");
                      }}
                      className="flex items-center gap-2 rounded-md p-2 text-xs font-medium text-slate-700 hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setContactMenuOpen(false);
                        setSelectedContactMethod("instagram");
                      }}
                      className="flex items-center gap-2 rounded-md p-2 text-xs font-medium text-slate-700 hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-pink-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span>Instagram</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

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

        {/* Contact Information (only when provided) */}
        {(lead.phone || lead.email) && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs border-t border-slate-100 pt-3">
            {lead.phone && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="text-slate-400 font-medium">Phone:</span>
                <a href={`tel:${lead.phone}`} className="font-semibold text-slate-900 hover:underline">
                  {lead.phone}
                </a>
              </div>
            )}
            {lead.phone && lead.email && <span className="text-slate-300">·</span>}
            {lead.email && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="text-slate-400 font-medium">Email:</span>
                <a href={`mailto:${lead.email}`} className="font-semibold text-slate-900 hover:underline">
                  {lead.email}
                </a>
              </div>
            )}
          </div>
        )}

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

      {/* Contact Outreach Draft Modal */}
      <ContactDraftModal
        leadId={lead.id}
        leadName={lead.name}
        method={selectedContactMethod}
        onClose={() => setSelectedContactMethod(null)}
      />

      {/* Floating AI Agent Chat */}
      <LeadAgentChat leadId={lead.id} leadName={lead.name} />
    </div>
  );
}
