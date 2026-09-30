import { useState, useRef, useEffect, type FormEvent } from "react";
import { chatWithLeadAgent } from "../../services/api";
import type { ChatMessage } from "../../types/lead";

interface LeadAgentChatProps {
  leadId: string;
  leadName: string;
}

const STARTER_PROMPTS = [
  "How should I approach this lead?",
  "What should I ask them first?",
  "Is this lead urgent?",
  "What information is missing?",
];

export default function LeadAgentChat({ leadId, leadName }: LeadAgentChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = { role: "user", content: textToSend };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await chatWithLeadAgent(leadId, textToSend, messages);
      setMessages([...newMessages, { role: "assistant", content: response.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get AI response.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <>
      {/* Floating Circular Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-40">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 cursor-pointer group border border-slate-700"
            title={`Ask AI Copilot about ${leadName}`}
          >
            {/* Sparkles / Chat Icon */}
            <svg
              className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span className="text-xs font-semibold">AI Copilot</span>
          </button>
        </div>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] rounded-xl border border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-150">
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h3 className="text-xs font-bold leading-tight">Sales AI Copilot</h3>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Context: <strong className="font-semibold text-white">{leadName}</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white rounded-md p-1 transition-colors cursor-pointer"
              title="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.length === 0 && (
              <div className="pt-2 text-center">
                <div className="inline-flex p-2 rounded-full bg-amber-50 border border-amber-200 text-amber-600 mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-slate-800">Ask anything about this lead</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  I have analyzed {leadName}&apos;s requirements, budget, timeline, and customer message.
                </p>

                {/* Starter Prompts */}
                <div className="mt-4 space-y-1.5 text-left">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="w-full text-left rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
                    >
                      💡 {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-2.5 leading-relaxed text-xs ${
                      isUser
                        ? "bg-slate-900 text-white rounded-br-xs"
                        : "bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-bl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-white border border-slate-200 p-2.5 shadow-2xs text-slate-500 flex items-center gap-2">
                  <div className="h-3 w-3 animate-spin rounded-full border border-slate-400 border-t-slate-800" />
                  <span className="text-[11px]">Thinking...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-2.5 border border-red-200 text-red-700 text-[11px]">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSubmit} className="p-2 border-t border-slate-200 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this lead..."
              disabled={loading}
              className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-slate-500 focus:outline-hidden disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
