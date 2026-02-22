import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  fetchUserLiveThreads,
  getUserUnreadCount,
  markLiveThreadRead,
  sendUserLiveMessage,
  type LiveChatThread,
} from "@/lib/liveChat";
import { useLiveUnreadCount } from "@/hooks/useLiveUnreadCount";

function DashboardTabs({ unreadCount }: { unreadCount: number }) {
  const location = useLocation();

  const tabs = [
    { label: "Overview", href: "/dashboard" },
    { label: "My Orders", href: "/dashboard/my-orders" },
    { label: "Live Chat", href: "/dashboard/live-chat" },
  ];

  return (
    <div className="mt-6 border-b border-neutral-200">
      <nav className="flex gap-6 text-sm md:text-base">
        {tabs.map((tab) => {
          const active = location.pathname === tab.href;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={`pb-3 border-b-2 transition-colors ${
                active
                  ? "border-[#3A2C20] text-[#3A2C20] font-semibold"
                  : "border-transparent text-neutral-500 hover:text-[#3A2C20]"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {tab.label}
                {tab.href === "/dashboard/live-chat" && unreadCount > 0 && (
                  <span className="min-w-[18px] rounded-full bg-[#790808] px-1 text-[10px] font-semibold leading-[18px] text-white text-center">
                    {unreadCount}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function LiveChat() {
  const { user } = useAuth();
  const { count: unreadCount, refresh } = useLiveUnreadCount({ forRole: "user" });
  const [threads, setThreads] = useState<LiveChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const loadThreads = useCallback(async () => {
    if (!user) {
      setThreads([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const token = await user.getIdToken();
      const nextThreads = await fetchUserLiveThreads(token);
      setThreads(nextThreads);

      if (nextThreads.length > 0 && getUserUnreadCount(nextThreads) > 0) {
        await Promise.all(
          nextThreads.map((thread) =>
            markLiveThreadRead({ threadId: thread._id, actor: "user", token })
          )
        );
      }
    } catch (err) {
      console.error("Failed to load live chats:", err);
      setError("Failed to load live chat messages.");
    } finally {
      setLoading(false);
      window.dispatchEvent(new Event("live-chat-updated"));
      void refresh();
    }
  }, [refresh, user]);

  useEffect(() => {
    void loadThreads();
    const id = window.setInterval(() => {
      void loadThreads();
    }, 60000);

    return () => window.clearInterval(id);
  }, [loadThreads]);

  const timeline = useMemo(() => {
    return threads
      .flatMap((thread) => {
        const base = {
          threadId: thread._id,
          senderRole: "user" as const,
          senderName: thread.name,
          message: thread.message,
          createdAt: thread.createdAt,
        };
        const replies = thread.replies.map((reply) => ({
          threadId: thread._id,
          senderRole: reply.senderRole,
          senderName:
            reply.senderName || (reply.senderRole === "admin" ? "Admin" : thread.name),
          message: reply.message,
          createdAt: reply.createdAt,
        }));
        return [base, ...replies];
      })
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  }, [threads]);

  const onSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const trimmed = message.trim();
    if (!trimmed) return;

    try {
      setSending(true);
      setError(null);
      const token = await user.getIdToken();
      await sendUserLiveMessage({
        name: user.displayName || user.email || "Customer",
        email: user.email || "no-email@insomniafuel.local",
        message: trimmed,
        token,
      });
      setMessage("");
      await loadThreads();
      window.dispatchEvent(new Event("live-chat-updated"));
    } catch (err) {
      console.error("Failed to send live message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 min-h-screen">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold text-[#3A2C20]">
          Live Chat
        </h1>
        <p className="mt-2 text-neutral-600">
          Chat with admin and get support updates in real time.
        </p>
      </header>

      <DashboardTabs unreadCount={unreadCount} />

      {loading ? (
        <div className="mt-8 space-y-3 animate-pulse">
          <div className="h-20 rounded-xl bg-neutral-200" />
          <div className="h-20 rounded-xl bg-neutral-200" />
          <div className="h-20 rounded-xl bg-neutral-200" />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#3A2C20]">
                Conversation
              </h2>
              <span className="text-xs text-neutral-500">
                {timeline.length} message{timeline.length === 1 ? "" : "s"}
              </span>
            </div>

            {timeline.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                <p className="font-semibold text-neutral-800">
                  No live chat messages yet.
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Send your first message from the panel on the right.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {timeline.map((entry, index) => {
                  const isAdmin = entry.senderRole === "admin";
                  return (
                    <div
                      key={`${entry.threadId}-${entry.createdAt}-${index}`}
                      className={`rounded-xl border px-4 py-3 ${
                        isAdmin
                          ? "border-[#dbe8ff] bg-[#f5f9ff]"
                          : "border-neutral-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            isAdmin ? "text-[#1E2B4F]" : "text-[#3A2C20]"
                          }`}
                        >
                          {isAdmin ? "Admin Reply" : "You"}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-neutral-700 whitespace-pre-line">
                        {entry.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-5 h-fit">
            <h2 className="text-lg font-semibold text-[#3A2C20]">
              Send Message
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Admin replies will appear here and on your Activity notification.
            </p>

            <form onSubmit={onSend} className="mt-4 space-y-3">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="w-full min-h-[140px] rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 caret-neutral-900 outline-none focus:border-[#3A2C20]"
                placeholder="Type your message to admin..."
                maxLength={2000}
                required
              />
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center rounded-full bg-[#3A2C20] px-5 py-2 text-sm font-semibold text-white hover:bg-black transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>

            {error && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-4 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
              Need order help? You can also check
              <Link to="/dashboard/my-orders" className="ml-1 underline">
                My Orders
              </Link>
              .
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
