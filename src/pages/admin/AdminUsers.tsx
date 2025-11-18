// src/pages/admin/AdminUsers.tsx
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type IUser = {
  _id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  role?: "admin" | "user";
  createdAt?: string;
  updatedAt?: string;
};

type IUserResponse = {
  items: IUser[];
  total: number;
  page: number;
  limit: number;
};

export default function AdminUsers() {
  const { user } = useAuth();
  const [rows, setRows] = useState<IUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!user) return;
        const token = await user.getIdToken();
        const res = await api.get<IUserResponse>("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!mounted) return;
        setRows(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
      } catch (e: any) {
        console.error("Failed to fetch users:", e);
        setErr(e?.response?.data?.message ?? e?.message ?? "Failed to load users.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) return <div className="max-w-6xl mx-auto p-6 text-neutral-600">Loading users…</div>;
  if (err) return <div className="max-w-6xl mx-auto p-6 text-red-600 font-medium">{err}</div>;

  return (
    <section className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Users</h2>
        <span className="text-sm text-neutral-500">Total: {total}</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-black/5 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Role</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((u) => (
                <tr key={u._id} className="border-t border-black/5">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.displayName || "-"}</td>
                  <td className="p-3">{u.phone || "-"}</td>
                  <td className="p-3 capitalize">{u.role || "user"}</td>
                  <td className="p-3">
                    {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-neutral-500 font-medium">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
