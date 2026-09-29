import { useState, useEffect } from "react";
import { getMyLeads } from "../../services/api";
import type { BuyerInquiryItem } from "../../types/lead";
import LeadForm from "../leads/LeadForm";

function getOrCreateBuyerId(): string {
  let id = localStorage.getItem("buyerId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("buyerId", id);
  }
  return id;
}

interface BuyerWorkspaceProps {
  showForm: boolean;
  onOpenForm: () => void;
  onCloseForm: () => void;
}

export default function BuyerWorkspace({
  showForm,
  onOpenForm,
  onCloseForm,
}: BuyerWorkspaceProps) {
  const [inquiries, setInquiries] = useState<BuyerInquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buyerId = getOrCreateBuyerId();

  async function loadInquiries() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyLeads(buyerId);
      setInquiries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load your inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInquiries();
  }, []);

  if (showForm) {
    return (
      <LeadForm
        buyerId={buyerId}
        onCancel={onCloseForm}
        onSuccess={() => {
          onCloseForm();
          loadInquiries();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-slate-500">
        Loading your inquiry...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">My Property Inquiries</h2>
          <p className="text-xs text-slate-500">Track the status of your submitted property requirements</p>
        </div>
        <button
          type="button"
          onClick={onOpenForm}
          className="self-start sm:self-auto rounded-md bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          + Add Inquiry
        </button>
      </div>

      {inquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-12 text-center bg-white">
          <h3 className="text-base font-semibold text-slate-800">You haven&apos;t submitted an inquiry yet.</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            Tell our sales team what property you are looking for and we will reach out with matching options.
          </p>
          <button
            type="button"
            onClick={onOpenForm}
            className="mt-5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            + Add Inquiry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {inquiry.propertyRequirement}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{inquiry.location}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                  {inquiry.status || "SUBMITTED"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <span>Contact: <strong className="font-medium text-slate-900">{inquiry.name}</strong></span>
                <span>·</span>
                <span>Budget: <strong className="font-medium text-slate-900">{inquiry.budget}</strong></span>
                <span>·</span>
                <span>Timeline: <strong className="font-medium text-slate-900">{inquiry.buyingTimeline}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
