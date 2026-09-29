interface HeaderProps {
  activeNav?: "leads" | "my-priority" | "due-today";
  onAddLeadClick?: () => void;
}

export default function Header({
  activeNav = "leads",
  onAddLeadClick,
}: HeaderProps) {
  const title =
    activeNav === "my-priority"
      ? "My Priority"
      : activeNav === "due-today"
      ? "Due Today"
      : "Leads";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 gap-4">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>

      {onAddLeadClick && (
        <button
          type="button"
          onClick={onAddLeadClick}
          className="rounded-md bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          + Add Lead
        </button>
      )}
    </header>
  );
}



