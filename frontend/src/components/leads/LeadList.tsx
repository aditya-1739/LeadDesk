import type { LeadListItem } from "../../types/lead";

interface LeadListProps {
  leads: LeadListItem[];
  selectedLeadId: string | null;
  onSelectLead: (id: string) => void;
}

const BADGE_STYLES: Record<string, string> = {
  HOT: "bg-red-50 text-red-700 border-red-200",
  WARM: "bg-amber-50 text-amber-700 border-amber-200",
  COLD: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function LeadList({ leads, selectedLeadId, onSelectLead }: LeadListProps) {
  return (
    <div className="space-y-3">
      {leads.map((lead) => {
        const isSelected = lead.id === selectedLeadId;
        const badgeClass = BADGE_STYLES[lead.priorityLabel] || BADGE_STYLES.COLD;

        return (
          <div
            key={lead.id}
            onClick={() => onSelectLead(lead.id)}
            className={`cursor-pointer rounded-lg border bg-white p-5 shadow-xs transition-colors ${
              isSelected
                ? "border-slate-900 ring-2 ring-slate-900"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">{lead.name}</h3>
                <p className="text-xs text-slate-500">{lead.location}</p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
              >
                <span>{lead.priorityLabel}</span>
                <span>·</span>
                <span>{lead.priorityScore}</span>
              </span>
            </div>

            <p className="mt-2 text-sm font-medium text-slate-800">
              {lead.propertyRequirement}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span>Budget: <strong className="font-medium text-slate-700">{lead.budget}</strong></span>
              <span>·</span>
              <span>Timeline: <strong className="font-medium text-slate-700">{lead.buyingTimeline}</strong></span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
