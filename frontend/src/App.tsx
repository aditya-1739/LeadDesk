import { useState } from "react";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import LeadForm from "./components/leads/LeadForm";

export default function App() {
  const [currentView, setCurrentView] = useState<"dashboard" | "new-lead">("dashboard");

  return (
    <AppShell onNewLeadClick={() => setCurrentView("new-lead")}>
      {currentView === "new-lead" ? (
        <LeadForm onCancel={() => setCurrentView("dashboard")} />
      ) : (
        <Dashboard />
      )}
    </AppShell>
  );
}
