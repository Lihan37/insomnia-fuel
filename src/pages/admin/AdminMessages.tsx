import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, User2, CheckCircle2, Clock, Send } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAdminLiveThreads,
  markLiveThreadRead,
  sendAdminReply,
  type LiveChatThread,
} from "@/lib/liveChat";

export default function AdminMessages() {
  const { user } = useAuth();
  const [items, setItems] = useState<LiveChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setErr(null);
      const token = await user.getIdToken();
      const nextItems = await fetchAdminLiveThreads(token);
      setItems(nextItems);

      await Promise.all(
        nextItems.map((item) =>
          markLiveThreadRead({ threadId: item._id, actor: "admin", token })
        )
      );
      window.dispatchEvent(new Event("live-chat-updated"));
    } catch (error) {
      console.error("Failed to load live messages:", error);
      setErr("Failed to load live messages.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void loadMessages();
    }, 60000);
    return () => window.clearInterval(id);
  }, [loadMessages]);

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
        prev.map((item) => (item._id === id ? { ...item, handled: !handled } : item))
      );
      window.dispatchEvent(new Event("live-chat-updated"));
    } catch (error) {
      console.error("Failed to update handled state:", error);
      alert("Failed to update message state.");
    }
  };

  const handleReply = async (threadId: string) => {
    if (!user) return;
    const draft = (replyDrafts[threadId] || "").trim();
    if (!draft) return;

    try {
      setReplyingId(threadId);
      setErr(null);
      const token = await user.getIdToken();
      await sendAdminReply({ threadId, message: draft, token });
      setReplyDrafts((prev) => ({ ...prev, [threadId]: "" }));
      await loadMessages();
      window.dispatchEvent(new Event("live-chat-updated"));
    } catch (error) {
      console.error("Failed to send reply:", error);
      setErr("Reply route is unavailable or failed. Please verify backend live chat reply route.");
    } finally {
      setReplyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#1E2B4F]">Live Messages</h2>
        <p className="text-sm text-neutral-600">
          Two-way chat inbox between customers and admin.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        <div className="border-b border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 flex items-center justify-between">
          <span>Inbox</span>
          <span className="text-xs text-neutral-500">
            {items.length} conversation{items.length !== 1 && "s"}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700">
              <Loader2 className="h-4 w-4 animate-spin text-[#1E2B4F]" />
              Loading live messages...
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
            {items.map((item) => (
              <div
                key={item._id}
                className="px-4 py-4 text-sm hover:bg-neutral-50/60 transition-colors"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-neutral-800">
                        <User2 className="h-3 w-3 text-neutral-500" />
                        {item.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-neutral-500">
                        <Mail className="h-3 w-3" />
                        {item.email}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                      {item.handled ? (
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
                    onClick={() => toggleHandled(item._id, item.handled)}
                    className="mt-1 inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] text-[#1E2B4F] hover:bg-neutral-50 cursor-pointer"
                  >
                    {item.handled ? "Mark as Unresolved" : "Mark as Resolved"}
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                      User Message
                    </p>
                    <p className="mt-1 text-sm text-neutral-700 whitespace-pre-line">
                      {item.message}
                    </p>
                  </div>

                  {item.replies.map((reply, index) => (
                    <div
                      key={`${item._id}-reply-${index}-${reply.createdAt}`}
                      className={`rounded-lg border px-3 py-2 ${
                        reply.senderRole === "admin"
                          ? "border-[#dbe8ff] bg-[#f5f9ff]"
                          : "border-neutral-200 bg-neutral-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
                          {reply.senderRole === "admin" ? "Admin Reply" : "User Reply"}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {new Date(reply.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-neutral-700 whitespace-pre-line">
                        {reply.message}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <textarea
                    value={replyDrafts[item._id] || ""}
                    onChange={(event) =>
                      setReplyDrafts((prev) => ({
                        ...prev,
                        [item._id]: event.target.value,
                      }))
                    }
                    placeholder="Write a reply..."
                    className="w-full min-h-[76px] rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 caret-neutral-900 outline-none focus:border-[#1E2B4F]"
                    maxLength={2000}
                  />
                  <button
                    type="button"
                    onClick={() => void handleReply(item._id)}
                    disabled={replyingId === item._id || !(replyDrafts[item._id] || "").trim()}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#1E2B4F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#16203a] transition disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Send className="h-3 w-3" />
                    {replyingId === item._id ? "Sending..." : "Reply"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
