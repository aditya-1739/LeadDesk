interface HeaderProps {
  onNewLeadClick?: () => void;
}

export default function Header({ onNewLeadClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-xl font-semibold text-slate-900">Leads</h1>
      <button
        type="button"
        onClick={onNewLeadClick}
        className="rounded-md bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer"
      >
        + New Lead
      </button>
    </header>
  );
}
