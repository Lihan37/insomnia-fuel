import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAdminLiveThreads,
  fetchUserLiveThreads,
  getAdminUnreadCount,
  getUserUnreadCount,
} from "@/lib/liveChat";

type UseLiveUnreadCountParams = {
  forRole: "user" | "admin";
  enabled?: boolean;
};

export function useLiveUnreadCount({
  forRole,
  enabled = true,
}: UseLiveUnreadCountParams) {
  const { user, isAdmin, isClient } = useAuth();
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    if (!enabled || !user) {
      setCount(0);
      return;
    }

    if (forRole === "admin" && !isAdmin) {
      setCount(0);
      return;
    }

    if (forRole === "user" && !isClient) {
      setCount(0);
      return;
    }

    try {
      const token = await user.getIdToken();
      if (forRole === "admin") {
        const threads = await fetchAdminLiveThreads(token);
        setCount(getAdminUnreadCount(threads));
      } else {
        const threads = await fetchUserLiveThreads(token);
        setCount(getUserUnreadCount(threads));
      }
    } catch (error) {
      console.error("Failed to load live unread count:", error);
      setCount(0);
    }
  }, [enabled, forRole, isAdmin, isClient, user]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      void load();
    }, 60000);
    const handleUpdate = () => {
      void load();
    };

    window.addEventListener("live-chat-updated", handleUpdate);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("live-chat-updated", handleUpdate);
    };
  }, [load]);

  return { count, refresh: load };
}
