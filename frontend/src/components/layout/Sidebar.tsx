interface SidebarProps {
  role: "buyer" | "salesperson";
}

export default function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="w-full border-b border-slate-200 bg-white md:w-60 md:min-h-screen md:border-r md:border-b-0 flex flex-col">
      <div className="flex h-16 items-center px-6 border-b border-slate-100">
        <span className="text-lg font-bold tracking-tight text-slate-900">
          LeadDesk
        </span>
      </div>
      <nav className="flex flex-row md:flex-col gap-1 p-3">
        {role === "salesperson" ? (
          <>
            <a
              href="#"
              className="flex items-center rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900"
            >
              Leads
            </a>
            <a
              href="#"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              Due Today
            </a>
          </>
        ) : (
          <a
            href="#"
            className="flex items-center rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900"
          >
            My Inquiry
          </a>
        )}
      </nav>
    </aside>
  );
}

