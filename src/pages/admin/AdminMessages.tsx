// src/pages/admin/AdminMessages.tsx
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Mail, User2, CheckCircle2, Clock } from "lucide-react";

type ContactMessage = {
  _id: string;
  userId: string | null;
  name: string;
  email: string;
  message: string;
  handled: boolean;
  createdAt: string;
};

export default function AdminMessages() {
  const { user } = useAuth();
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const loadMessages = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setErr(null);
      const token = await user.getIdToken();
      const res = await api.get<{ items: ContactMessage[]; total: number }>(
        "/api/contact?page=1&limit=50",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(res.data.items || []);
    } catch (e) {
      console.error("Failed to load contact messages:", e);
      setErr("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleHandled = async (id: string, handled: boolean) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await api.patch(
        `/api/contact/${id}`,
        { handled: !handled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems((prev) =>
        prev.map((m) => (m._id === id ? { ...m, handled: !handled } : m))
      );
    } catch (e) {
      console.error("Failed to update handled state:", e);
      alert("Failed to update message state.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#1E2B4F]">Messages</h2>
        <p className="text-sm text-neutral-600">
          Read and manage contact form messages from guests and customers.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        <div className="border-b border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 flex items-center justify-between">
          <span>Inbox</span>
          <span className="text-xs text-neutral-500">
            {items.length} message{items.length !== 1 && "s"}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700">
              <Loader2 className="h-4 w-4 animate-spin text-[#1E2B4F]" />
              Loading messages...
            </div>
          </div>
        ) : err ? (
          <div className="px-4 py-4 text-sm text-red-700 bg-red-50 border-t border-red-200">
            {err}
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-neutral-600">
            No messages yet.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {items.map((m) => (
              <div
                key={m._id}
                className="px-4 py-3 text-sm hover:bg-neutral-50/60 transition-colors"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-neutral-800">
                        <User2 className="h-3 w-3 text-neutral-500" />
                        {m.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-neutral-500">
                        <Mail className="h-3 w-3" />
                        {m.email}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(m.createdAt).toLocaleString()}
                      </span>
                      {m.handled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700 border border-amber-200">
                          <Clock className="h-3 w-3" />
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleHandled(m._id, m.handled)}
                    className="mt-1 inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] text-[#1E2B4F] hover:bg-neutral-50 cursor-pointer"
                  >
                    {m.handled ? "Mark as Unresolved" : "Mark as Resolved"}
                  </button>
                </div>

                <p className="mt-2 text-sm text-neutral-700 whitespace-pre-line">
                  {m.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
