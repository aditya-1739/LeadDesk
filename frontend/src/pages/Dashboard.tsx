import { useState, useEffect, useMemo, useCallback } from "react";
import { getLeads, deleteLead } from "../services/api";
import type { LeadListItem } from "../types/lead";
import LeadList from "../components/leads/LeadList";
import LeadDetail from "../components/leads/LeadDetail";
import LeadForm from "../components/leads/LeadForm";

type PriorityFilter = "ALL" | "HOT" | "WARM" | "COLD";

type SortOption =
  | "priority-desc"
  | "priority-asc"
  | "date-desc"
  | "date-asc"
  | "budget-desc"
  | "budget-asc"
  | "timeline-asc"
  | "timeline-desc";

// Temporary browser-scoped demo identity
function getOrCreateSalespersonId(): string {
  let id = localStorage.getItem("salespersonId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("salespersonId", id);
  }
  return id;
}

function parseBudget(value: string): number {
  if (!value) return -1;
  const clean = value.replace(/[₹\s,]/g, "").toLowerCase();

  const crMatch = clean.match(/([\d.]+)\s*(?:crore|cr)/);
  if (crMatch) {
    const num = parseFloat(crMatch[1]);
    return isNaN(num) ? -1 : Math.round(num * 10000000);
  }

  const lMatch = clean.match(/([\d.]+)\s*(?:lakh|lac|l)\b/);
  if (lMatch) {
    const num = parseFloat(lMatch[1]);
    return isNaN(num) ? -1 : Math.round(num * 100000);
  }

  const numMatch = clean.match(/^[\d.]+/);
  if (numMatch) {
    const num = parseFloat(numMatch[0]);
    return isNaN(num) ? -1 : num;
  }

  return -1;
}

function parseTimeline(value: string): number {
  if (!value) return Infinity;
  const lower = value.toLowerCase().trim();

  if (lower.includes("not decided") || lower.includes("undecided")) {
    return Infinity;
  }
  if (lower.includes("immediate")) {
    return 0;
  }

  const dayMatch = lower.match(/(\d+)\s*(?:-\s*\d+\s*)?day/);
  if (dayMatch) {
    return parseInt(dayMatch[1], 10);
  }

  const weekMatch = lower.match(/(\d+)\s*(?:-\s*\d+\s*)?week/);
  if (weekMatch) {
    return parseInt(weekMatch[1], 10) * 7;
  }

  if (lower.includes(">12") || lower.includes("more than 12")) {
    return 365;
  }
  const monthMatch = lower.match(/(\d+)\s*(?:to|-)?\s*(?:\d+)?\s*month/);
  if (monthMatch) {
    return parseInt(monthMatch[1], 10) * 30;
  }

  const yearMatch = lower.match(/(\d+)\s*year/);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10) * 365;
  }

  return Infinity;
}

function compareLeads(a: LeadListItem, b: LeadListItem, sort: SortOption): number {
  switch (sort) {
    case "priority-desc":
      return b.priorityScore - a.priorityScore;
    case "priority-asc":
      return a.priorityScore - b.priorityScore;
    case "date-desc":
      return (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
    case "date-asc":
      return (Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0);
    case "budget-desc": {
      const bA = parseBudget(a.budget);
      const bB = parseBudget(b.budget);
      if (bA === -1 && bB === -1) return 0;
      if (bA === -1) return 1;
      if (bB === -1) return -1;
      return bB - bA;
    }
    case "budget-asc": {
      const bA = parseBudget(a.budget);
      const bB = parseBudget(b.budget);
      if (bA === -1 && bB === -1) return 0;
      if (bA === -1) return 1;
      if (bB === -1) return -1;
      return bA - bB;
    }
    case "timeline-asc": {
      const tA = parseTimeline(a.buyingTimeline);
      const tB = parseTimeline(b.buyingTimeline);
      if (tA === Infinity && tB === Infinity) return 0;
      if (tA === Infinity) return 1;
      if (tB === Infinity) return -1;
      return tA - tB;
    }
    case "timeline-desc": {
      const tA = parseTimeline(a.buyingTimeline);
      const tB = parseTimeline(b.buyingTimeline);
      if (tA === Infinity && tB === Infinity) return 0;
      if (tA === Infinity) return 1;
      if (tB === Infinity) return -1;
      return tB - tA;
    }
  }
}

function getHeading(filter: PriorityFilter, count: number, isMyPriority: boolean): string {
  if (isMyPriority) {
    return filter === "ALL" ? `My Priority (${count})` : `${filter} Priority (${count})`;
  }
  if (filter === "HOT") return `Hot Leads (${count})`;
  if (filter === "WARM") return `Warm Leads (${count})`;
  if (filter === "COLD") return `Cold Leads (${count})`;
  return `Prioritized Leads (${count})`;
}

interface DashboardProps {
  activeNav?: "leads" | "my-priority" | "due-today";
  onNavChange?: (nav: "leads" | "my-priority" | "due-today") => void;
  showAddLead?: boolean;
  onOpenAddLead?: () => void;
  onCloseAddLead?: () => void;
}

export default function Dashboard({
  activeNav = "leads",
  showAddLead = false,
  onOpenAddLead,
  onCloseAddLead,
}: DashboardProps) {
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [filter, setFilter] = useState<PriorityFilter>("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("priority-desc");

  const [leadToDelete, setLeadToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Temporary browser-scoped salesperson identity initialized on mount
  useEffect(() => {
    getOrCreateSalespersonId();
  }, []);

  // Browser-local storage for salesperson's personal priority list
  const [priorityLeadIds, setPriorityLeadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("priorityLeadIds");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleTogglePriority = (leadId: string) => {
    setPriorityLeadIds((prev) => {
      const next = prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId];
      localStorage.setItem("priorityLeadIds", JSON.stringify(next));
      return next;
    });
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteLead(leadToDelete.id);
      setLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));
      setPriorityLeadIds((prev) => {
        if (!prev.includes(leadToDelete.id)) return prev;
        const next = prev.filter((id) => id !== leadToDelete.id);
        localStorage.setItem("priorityLeadIds", JSON.stringify(next));
        return next;
      });
      if (selectedLeadId === leadToDelete.id) {
        setSelectedLeadId(null);
      }
      setLeadToDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete lead. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load leads. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);


  const isMyPriority = activeNav === "my-priority";
  const isDueToday = activeNav === "due-today";

  const baseLeads = useMemo(() => {
    if (isMyPriority) {
      return leads.filter((l) => priorityLeadIds.includes(l.id));
    }
    if (isDueToday) {
      return leads.filter((l) => l.followUpPlan && l.followUpPlan.length > 0);
    }
    return leads;
  }, [leads, isMyPriority, isDueToday, priorityLeadIds]);

  const counts = useMemo(() => {
    const summary = { HOT: 0, WARM: 0, COLD: 0 };
    for (const lead of baseLeads) {
      if (lead.priorityLabel in summary) {
        summary[lead.priorityLabel as keyof typeof summary]++;
      }
    }
    return summary;
  }, [baseLeads]);

  const visibleLeads = useMemo(() => {
    const filtered =
      filter === "ALL"
        ? baseLeads
        : baseLeads.filter((lead) => lead.priorityLabel === filter);

    return [...filtered].sort((a, b) => compareLeads(a, b, sortOption));
  }, [baseLeads, filter, sortOption]);

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

  // If salesperson clicked + Add Lead, render LeadForm
  if (showAddLead) {
    return (
      <div className="max-w-4xl mx-auto">
        <LeadForm
          onCancel={onCloseAddLead || (() => {})}
          onSuccess={() => {
            onCloseAddLead?.();
            loadLeads();
          }}
        />
      </div>
    );
  }

  // Delete confirmation dialog
  const deleteConfirmationModal = leadToDelete ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
      >
        <h3 className="text-base font-semibold text-slate-900">Delete Lead?</h3>
        <p className="mt-2 text-sm text-slate-600">
          Are you sure you want to delete <strong className="font-semibold text-slate-800">{leadToDelete.name}</strong>? This action cannot be undone.
        </p>

        {deleteError && (
          <div className="mt-3 rounded-md bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
            {deleteError}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setLeadToDelete(null);
              setDeleteError(null);
            }}
            disabled={deleting}
            className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="rounded-md bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // If a lead is selected, display LeadDetail view while preserving filter and sort state
  if (selectedLeadId) {
    return (
      <>
        <LeadDetail
          leadId={selectedLeadId}
          onBack={() => setSelectedLeadId(null)}
          isPriority={priorityLeadIds.includes(selectedLeadId)}
          onTogglePriority={() => handleTogglePriority(selectedLeadId)}
          onLeadUpdated={(updated) => {
            setLeads((prev) =>
              prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l))
            );
          }}
          onDeleteLead={(lead) => setLeadToDelete(lead)}
        />
        {deleteConfirmationModal}
      </>
    );
  }

  // Empty state for My Priority view
  if (isMyPriority && baseLeads.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">My Priority</h2>
          <p className="text-xs text-slate-500">Leads you&apos;ve chosen to focus on.</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-12 text-center bg-white">
          <h3 className="text-base font-semibold text-slate-800">No priority leads yet.</h3>
          <p className="mt-1 text-sm text-slate-500">
            Add leads to your priority list to keep them in focus.
          </p>
        </div>
      </div>
    );
  }

  // Empty state for Due Today view
  if (isDueToday && baseLeads.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Due Today</h2>
          <p className="text-xs text-slate-500">Follow-up items requiring action.</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-12 text-center bg-white">
          <h3 className="text-base font-semibold text-slate-800">No follow-ups due today.</h3>
          <p className="mt-1 text-sm text-slate-500">
            Generate follow-up recommendations on leads to populate this queue.
          </p>
        </div>
      </div>
    );
  }

  // Empty state when database has 0 leads
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-12 text-center bg-white">
        <h2 className="text-base font-semibold text-slate-800">No leads yet.</h2>
        <p className="mt-1 text-sm text-slate-500">
          Click &ldquo;+ Add Lead&rdquo; to add a customer lead and let AI prioritize it.
        </p>
        {onOpenAddLead && (
          <button
            type="button"
            onClick={onOpenAddLead}
            className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            + Add Lead
          </button>
        )}
      </div>
    );
  }

  const filterTabs: PriorityFilter[] = ["ALL", "HOT", "WARM", "COLD"];

  return (
    <div className="max-w-7xl mx-auto">
      {isMyPriority && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">My Priority</h2>
          <p className="text-xs text-slate-500">Leads you&apos;ve chosen to focus on.</p>
        </div>
      )}

      {isDueToday && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Due Today</h2>
          <p className="text-xs text-slate-500">Follow-up items requiring action.</p>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filterTabs.map((tab) => {
            const count = tab === "ALL" ? baseLeads.length : counts[tab] || 0;
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="lead-sort" className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Sort by
          </label>
          <select
            id="lead-sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:border-slate-500 focus:outline-hidden"
          >
            <option value="priority-desc">Priority: High → Low</option>
            <option value="priority-asc">Priority: Low → High</option>
            <option value="date-desc">Date & Time: Newest → Oldest</option>
            <option value="date-asc">Date & Time: Oldest → Newest</option>
            <option value="budget-desc">Budget: Highest → Lowest</option>
            <option value="budget-asc">Budget: Lowest → Highest</option>
            <option value="timeline-asc">Buying Timeline: Earliest → Latest</option>
            <option value="timeline-desc">Buying Timeline: Latest → Earliest</option>
          </select>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          {getHeading(filter, visibleLeads.length, isMyPriority)}
        </h2>
        <span className="text-xs text-slate-500">
          {sortOption.startsWith("priority")
            ? "Ranked by AI priority score"
            : sortOption.startsWith("date")
            ? "Ordered by submission time"
            : sortOption.startsWith("budget")
            ? "Ordered by budget"
            : "Ordered by buying timeline"}
        </span>
      </div>

      {visibleLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-12 text-center bg-white">
          <p className="text-sm text-slate-500">
            {filter === "ALL" ? "No leads match this filter." : `No ${filter} leads found.`}
          </p>
        </div>
      ) : (
        <LeadList
          leads={visibleLeads}
          selectedLeadId={selectedLeadId}
          onSelectLead={setSelectedLeadId}
          priorityLeadIds={priorityLeadIds}
          onTogglePriority={handleTogglePriority}
          onRequestDelete={(lead) => setLeadToDelete({ id: lead.id, name: lead.name })}
        />
      )}

      {deleteConfirmationModal}
    </div>
  );
}


