import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppShellProps {
  children: ReactNode;
  role: "buyer" | "salesperson";
  onRoleChange: (role: "buyer" | "salesperson") => void;
  onAddInquiryClick?: () => void;
}

export default function AppShell({
  children,
  role,
  onRoleChange,
  onAddInquiryClick,
}: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          role={role}
          onRoleChange={onRoleChange}
          onAddInquiryClick={onAddInquiryClick}
        />

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

