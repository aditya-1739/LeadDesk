import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppShellProps {
  children: ReactNode;
  activeNav?: "leads" | "my-priority" | "due-today";
  onNavChange?: (nav: "leads" | "my-priority" | "due-today") => void;
  onAddLeadClick?: () => void;
}

export default function AppShell({
  children,
  activeNav,
  onNavChange,
  onAddLeadClick,
}: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <Sidebar activeNav={activeNav} onNavChange={onNavChange} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeNav={activeNav}
          onAddLeadClick={onAddLeadClick}
        />

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


