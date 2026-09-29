export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-12 text-center bg-white">
      <h2 className="text-base font-semibold text-slate-800">
        Your prioritized leads will appear here.
      </h2>
      <p className="mt-1 text-sm text-slate-500 max-w-md">
        LeadDesk helps salespeople prioritize inbound leads and follow up using AI.
      </p>
    </div>
  );
}
