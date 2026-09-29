import { useState } from "react";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [activeNav, setActiveNav] = useState<"leads" | "my-priority" | "due-today">("leads");
  const [showAddLead, setShowAddLead] = useState(false);

  return (
    <AppShell
      activeNav={activeNav}
      onNavChange={(nav) => {
        setActiveNav(nav);
        setShowAddLead(false);
      }}
      onAddLeadClick={() => setShowAddLead(true)}
    >
      <Dashboard
        activeNav={activeNav}
        onNavChange={setActiveNav}
        showAddLead={showAddLead}
        onOpenAddLead={() => setShowAddLead(true)}
        onCloseAddLead={() => setShowAddLead(false)}
      />
    </AppShell>
  );
}



