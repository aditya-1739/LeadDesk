interface SidebarProps {
  activeNav?: "leads" | "my-priority" | "due-today";
  onNavChange?: (nav: "leads" | "my-priority" | "due-today") => void;
}

export default function Sidebar({
  activeNav = "leads",
  onNavChange,
}: SidebarProps) {
  return (
    <aside className="w-full border-b border-slate-200 bg-white md:w-60 md:min-h-screen md:border-r md:border-b-0 flex flex-col">
      <div className="flex h-16 items-center px-6 border-b border-slate-100">
        <span className="text-lg font-bold tracking-tight text-slate-900">
          LeadDesk
        </span>
      </div>
      <nav className="flex flex-row md:flex-col gap-1 p-3">
        <button
          type="button"
          onClick={() => onNavChange?.("leads")}
          className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors text-left cursor-pointer ${
            activeNav === "leads"
              ? "bg-slate-100 text-slate-900"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          Leads
        </button>
        <button
          type="button"
          onClick={() => onNavChange?.("my-priority")}
          className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors text-left cursor-pointer ${
            activeNav === "my-priority"
              ? "bg-slate-100 text-slate-900"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          My Priority
        </button>
        <button
          type="button"
          onClick={() => onNavChange?.("due-today")}
          className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors text-left cursor-pointer ${
            activeNav === "due-today"
              ? "bg-slate-100 text-slate-900"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          Due Today
        </button>
      </nav>
    </aside>
  );
}


