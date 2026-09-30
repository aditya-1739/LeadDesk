import { useState, useEffect } from "react";
import { generateContactDraft } from "../../services/api";
import type { ContactMethod, ContactDraftResponse } from "../../types/lead";

interface ContactDraftModalProps {
  leadId: string;
  leadName: string;
  method: ContactMethod | null;
  onClose: () => void;
}

export default function ContactDraftModal({
  leadId,
  leadName,
  method,
  onClose,
}: ContactDraftModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ContactDraftResponse | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [script, setScript] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!method) return;

    let isMounted = true;
    async function loadDraft() {
      setLoading(true);
      setError(null);
      setDraft(null);
      setCopied(false);
      try {
        const res = await generateContactDraft(leadId, method as ContactMethod);
        if (!isMounted) return;
        setDraft(res);
        setSubject(res.subject || "");
        setBody(res.body || "");
        setMessage(res.message || "");
        setScript(res.script || "");
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to generate contact draft.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDraft();

    return () => {
      isMounted = false;
    };
  }, [leadId, method]);

  if (!method) return null;

  const handleCopy = async () => {
    let textToCopy = "";
    if (method === "email") {
      textToCopy = `Subject: ${subject}\n\n${body}`;
    } else if (method === "phone") {
      textToCopy = script;
    } else {
      textToCopy = message;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getMethodTitle = (m: ContactMethod) => {
    switch (m) {
      case "phone":
        return "Phone Call Script";
      case "email":
        return "Email Outreach Draft";
      case "whatsapp":
        return "WhatsApp Message Draft";
      case "instagram":
        return "Instagram DM Draft";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">{getMethodTitle(method)}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 capitalize">
                {method}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Drafted for <strong className="font-semibold text-slate-700">{leadName}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 overflow-y-auto flex-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 mb-3" />
              <p className="text-sm font-medium text-slate-700">Generating AI outreach draft...</p>
              <p className="text-xs text-slate-400 mt-1">Tailoring message using stored lead intelligence</p>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200 text-xs text-red-700">
              <p className="font-semibold">Unable to generate draft</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && draft && (
            <div className="space-y-4">
              {method === "email" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-slate-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Body
                    </label>
                    <textarea
                      rows={9}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full rounded-md border border-slate-300 p-3 text-xs text-slate-800 focus:border-slate-500 focus:outline-hidden leading-relaxed"
                    />
                  </div>
                </>
              )}

              {(method === "whatsapp" || method === "instagram") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Message Draft
                  </label>
                  <textarea
                    rows={8}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-3 text-xs text-slate-800 focus:border-slate-500 focus:outline-hidden leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Review and customize before copying to {method === "whatsapp" ? "WhatsApp" : "Instagram"}.
                  </p>
                </div>
              )}

              {method === "phone" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Talking Points & Call Script
                  </label>
                  <textarea
                    rows={9}
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-3 text-xs text-slate-800 focus:border-slate-500 focus:outline-hidden leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Use these talking points when placing a call with the customer.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            AI suggestions based on stored lead facts.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>
            {!loading && !error && draft && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
