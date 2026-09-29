import { useState } from "react";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import BuyerWorkspace from "./components/buyer/BuyerWorkspace";

export default function App() {
  const [role, setRole] = useState<"buyer" | "salesperson">("salesperson");
  const [showBuyerForm, setShowBuyerForm] = useState(false);

  return (
    <AppShell
      role={role}
      onRoleChange={(newRole) => {
        setRole(newRole);
        setShowBuyerForm(false);
      }}
      onAddInquiryClick={() => setShowBuyerForm(true)}
    >
      {role === "buyer" ? (
        <BuyerWorkspace
          showForm={showBuyerForm}
          onOpenForm={() => setShowBuyerForm(true)}
          onCloseForm={() => setShowBuyerForm(false)}
        />
      ) : (
        <Dashboard />
      )}
    </AppShell>
  );
}


