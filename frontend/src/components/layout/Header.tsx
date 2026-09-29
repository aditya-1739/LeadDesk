interface HeaderProps {
  role: "buyer" | "salesperson";
  onRoleChange: (role: "buyer" | "salesperson") => void;
  onAddInquiryClick?: () => void;
}

export default function Header({ role, onRoleChange, onAddInquiryClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 gap-4">
      <h1 className="text-xl font-semibold text-slate-900">
        {role === "salesperson" ? "Leads" : "My Inquiry"}
      </h1>

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => onRoleChange("salesperson")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              role === "salesperson"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Salesperson
          </button>
          <button
            type="button"
            onClick={() => onRoleChange("buyer")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              role === "buyer"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Buyer
          </button>
        </div>

        {role === "buyer" && onAddInquiryClick && (
          <button
            type="button"
            onClick={onAddInquiryClick}
            className="rounded-md bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            + Add Inquiry
          </button>
        )}
      </div>
    </header>
  );
}


