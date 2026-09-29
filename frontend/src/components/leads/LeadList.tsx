import { useState, useEffect } from "react";
import type { LeadListItem } from "../../types/lead";

interface LeadListProps {
  leads: LeadListItem[];
  selectedLeadId: string | null;
  onSelectLead: (id: string) => void;
  priorityLeadIds?: string[];
  onTogglePriority?: (id: string) => void;
  onRequestDelete?: (lead: LeadListItem) => void;
}

const BADGE_STYLES: Record<string, string> = {
  HOT: "bg-red-50 text-red-700 border-red-200",
  WARM: "bg-amber-50 text-amber-700 border-amber-200",
  COLD: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function LeadList({
  leads,
  selectedLeadId,
  onSelectLead,
  priorityLeadIds = [],
  onTogglePriority,
  onRequestDelete,
}: LeadListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {leads.map((lead) => {
        const isSelected = lead.id === selectedLeadId;
        const isPriority = priorityLeadIds.includes(lead.id);
        const badgeClass = BADGE_STYLES[lead.priorityLabel] || BADGE_STYLES.COLD;

        return (
          <div
            key={lead.id}
            onClick={() => onSelectLead(lead.id)}
            className={`cursor-pointer rounded-lg border bg-white p-5 shadow-xs transition-colors flex flex-col justify-between ${
              isSelected
                ? "border-slate-900 ring-2 ring-slate-900"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              {/* Header: Name, location, priority badge, and subtle 3-dot menu */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 truncate" title={lead.name}>
                    {lead.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate" title={lead.location}>
                    {lead.location}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${badgeClass}`}
                  >
                    <span>{lead.priorityLabel}</span>
                    <span>·</span>
                    <span>{lead.priorityScore}</span>
                  </span>

                  {/* Three-dot menu button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === lead.id ? null : lead.id);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="More options"
                      aria-label="Lead actions"
                    >
                      <span className="text-sm leading-none font-bold select-none px-0.5">⋮</span>
                    </button>

                    {openMenuId === lead.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1 w-44 rounded-md bg-white border border-slate-200 py-1 shadow-md z-20 text-xs text-slate-700"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onSelectLead(lead.id);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 cursor-pointer"
                        >
                          View Lead
                        </button>
                        {onTogglePriority && (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onTogglePriority(lead.id);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 cursor-pointer"
                          >
                            {isPriority ? "Remove from Priority" : "Add to Priority"}
                          </button>
                        )}
                        {onRequestDelete && (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onRequestDelete(lead);
                            }}
                            className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            Delete Lead
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Requirement & Details */}
              <div className="my-3">
                <p className="text-sm font-medium text-slate-800 line-clamp-2">
                  {lead.propertyRequirement}
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                  <span>Budget: <strong className="font-medium text-slate-700">{lead.budget}</strong></span>
                  <span>·</span>
                  <span>Timeline: <strong className="font-medium text-slate-700">{lead.buyingTimeline}</strong></span>
                </div>
              </div>
            </div>

            {/* Footer: Status and Add to Priority button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">
                Status:{" "}
                <strong className={lead.status === "CONTACTED" ? "text-emerald-700 font-medium" : "text-slate-700 font-medium"}>
                  {lead.status || "SUBMITTED"}
                </strong>
              </span>

              {onTogglePriority && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePriority(lead.id);
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer border ${
                    isPriority
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {isPriority ? "✓ In Priority" : "+ Add to Priority"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

