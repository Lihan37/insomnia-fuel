import { api } from "@/lib/api";

export type LiveChatSenderRole = "user" | "admin";

export type LiveChatReply = {
  _id?: string;
  senderRole: LiveChatSenderRole;
  senderName?: string;
  senderEmail?: string;
  message: string;
  createdAt: string;
  readByUser?: boolean;
  readByAdmin?: boolean;
};

export type LiveChatThread = {
  _id: string;
  userId: string | null;
  name: string;
  email: string;
  message: string;
  handled: boolean;
  createdAt: string;
  updatedAt?: string;
  unreadByUser?: number;
  unreadByAdmin?: number;
  replies: LiveChatReply[];
};

type RawObject = Record<string, unknown>;

const LIVE_CHAT_ENDPOINTS = {
  userThreads: "/api/contact/my?page=1&limit=50",
  adminThreads: "/api/contact?page=1&limit=100",
  sendUserMessage: "/api/contact",
  sendAdminReply: (threadId: string) => `/api/contact/${threadId}/reply`,
  markRead: (threadId: string) => `/api/contact/${threadId}/read`,
} as const;

function getAuthHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function asObject(input: unknown): RawObject | null {
  if (!input || typeof input !== "object") return null;
  return input as RawObject;
}

function asString(input: unknown, fallback = ""): string {
  return typeof input === "string" ? input : fallback;
}

function asBoolean(input: unknown, fallback = false): boolean {
  return typeof input === "boolean" ? input : fallback;
}

function asNumber(input: unknown, fallback = 0): number {
  return typeof input === "number" && Number.isFinite(input) ? input : fallback;
}

function parseReply(input: unknown): LiveChatReply | null {
  const obj = asObject(input);
  if (!obj) return null;

  const senderRoleRaw = asString(obj.senderRole, "admin");
  const senderRole: LiveChatSenderRole =
    senderRoleRaw === "user" ? "user" : "admin";
  const message = asString(obj.message).trim();
  if (!message) return null;

  return {
    _id: asString(obj._id) || undefined,
    senderRole,
    senderName: asString(obj.senderName) || undefined,
    senderEmail: asString(obj.senderEmail) || undefined,
    message,
    createdAt: asString(obj.createdAt, new Date().toISOString()),
    readByUser:
      typeof obj.readByUser === "boolean" ? obj.readByUser : undefined,
    readByAdmin:
      typeof obj.readByAdmin === "boolean" ? obj.readByAdmin : undefined,
  };
}

function parseThread(input: unknown): LiveChatThread | null {
  const obj = asObject(input);
  if (!obj) return null;

  const id = asString(obj._id);
  if (!id) return null;

  const repliesRaw = Array.isArray(obj.replies) ? obj.replies : [];
  const replies = repliesRaw
    .map((reply) => parseReply(reply))
    .filter((reply): reply is LiveChatReply => Boolean(reply));

  return {
    _id: id,
    userId:
      obj.userId === null
        ? null
        : typeof obj.userId === "string"
        ? obj.userId
        : null,
    name: asString(obj.name, "Guest"),
    email: asString(obj.email),
    message: asString(obj.message),
    handled: asBoolean(obj.handled, false),
    createdAt: asString(obj.createdAt, new Date().toISOString()),
    updatedAt: asString(obj.updatedAt) || undefined,
    unreadByUser:
      typeof obj.unreadByUser === "number" ? asNumber(obj.unreadByUser) : undefined,
    unreadByAdmin:
      typeof obj.unreadByAdmin === "number" ? asNumber(obj.unreadByAdmin) : undefined,
    replies,
  };
}

function parseThreadList(payload: unknown): LiveChatThread[] {
  const data = asObject(payload);
  if (!data) return [];

  const firstList =
    (Array.isArray(data.items) && data.items) ||
    (Array.isArray(data.threads) && data.threads) ||
    (Array.isArray(data.messages) && data.messages) ||
    (Array.isArray(data.data) && data.data) ||
    [];

  return firstList
    .map((item) => parseThread(item))
    .filter((item): item is LiveChatThread => Boolean(item));
}

async function getWithFallback(
  path: string,
  token?: string
): Promise<LiveChatThread[]> {
  const headers = getAuthHeaders(token);
  const res = await api.get(path, { headers });
  return parseThreadList(res.data);
}

export async function fetchUserLiveThreads(token?: string) {
  return getWithFallback(LIVE_CHAT_ENDPOINTS.userThreads, token);
}

export async function fetchAdminLiveThreads(token?: string) {
  const headers = getAuthHeaders(token);
  const res = await api.get(LIVE_CHAT_ENDPOINTS.adminThreads, { headers });
  return parseThreadList(res.data);
}

export async function sendUserLiveMessage(params: {
  name: string;
  email: string;
  message: string;
  token?: string;
}) {
  const headers = getAuthHeaders(params.token);
  await api.post(
    LIVE_CHAT_ENDPOINTS.sendUserMessage,
    {
      name: params.name.trim(),
      email: params.email.trim(),
      message: params.message.trim(),
    },
    { headers }
  );
}

export async function sendAdminReply(params: {
  threadId: string;
  message: string;
  token: string;
}) {
  const headers = getAuthHeaders(params.token);
  await api.post(
    LIVE_CHAT_ENDPOINTS.sendAdminReply(params.threadId),
    { message: params.message.trim() },
    { headers }
  );
}

export async function markLiveThreadRead(params: {
  threadId: string;
  actor: LiveChatSenderRole;
  token: string;
}) {
  const headers = getAuthHeaders(params.token);
  await api.post(
    LIVE_CHAT_ENDPOINTS.markRead(params.threadId),
    { actor: params.actor },
    { headers }
  );
}

export function getUserUnreadCount(threads: LiveChatThread[]): number {
  return threads.reduce((sum, thread) => {
    if (typeof thread.unreadByUser === "number") {
      return sum + Math.max(thread.unreadByUser, 0);
    }

    const fromReplies = thread.replies.filter(
      (reply) => reply.senderRole === "admin" && reply.readByUser !== true
    ).length;
    return sum + fromReplies;
  }, 0);
}

export function getAdminUnreadCount(threads: LiveChatThread[]): number {
  return threads.reduce((sum, thread) => {
    if (typeof thread.unreadByAdmin === "number") {
      return sum + Math.max(thread.unreadByAdmin, 0);
    }

    const fromReplies = thread.replies.filter(
      (reply) => reply.senderRole === "user" && reply.readByAdmin !== true
    ).length;
    const root = thread.handled ? 0 : 1;
    return sum + fromReplies + root;
  }, 0);
}
