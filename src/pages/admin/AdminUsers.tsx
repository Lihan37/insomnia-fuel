// src/pages/admin/AdminUsers.tsx
import { useEffect, useMemo, useState } from "react";
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
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  const adminCount = useMemo(
    () => rows.filter((row) => (row.role || "user") === "admin").length,
    [rows]
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const role = row.role || "user";
      if (roleFilter !== "all" && role !== roleFilter) return false;
      if (!q) return true;
      return (
        row.email.toLowerCase().includes(q) ||
        (row.displayName || "").toLowerCase().includes(q) ||
        (row.phone || "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, roleFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, roleFilter, rows.length]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  if (loading)
    return (
      <div className="max-w-6xl mx-auto p-6 text-neutral-600">
        Loading users...
      </div>
    );
  if (err) return <div className="max-w-6xl mx-auto p-6 text-red-600 font-medium">{err}</div>;

  return (
    <section className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#1E2B4F]">Users</h2>
          <p className="text-sm text-neutral-600">
            Manage access and view account details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm text-neutral-700">
            Total: <span className="font-semibold text-neutral-900">{total}</span>
          </div>
          <div className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm text-neutral-700">
            Admins: <span className="font-semibold text-neutral-900">{adminCount}</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative w-full md:w-80">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by email, name, or phone"
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 shadow-sm focus:border-[#1E2B4F] focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]/10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "user")}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 shadow-sm focus:border-[#1E2B4F] focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]/10"
          >
            <option value="all">All roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>
        <div className="text-xs text-neutral-500">
          Showing {pagedRows.length} of {filteredRows.length}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.length > 0 ? (
              pagedRows.map((u) => {
                const role = u.role || "user";
                const initials = (u.displayName || u.email || "?")
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr key={u._id} className="border-t border-neutral-100 hover:bg-neutral-50/60">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E2B4F]/10 text-xs font-semibold text-[#1E2B4F]">
                          {initials}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {u.displayName || "Unnamed user"}
                          </div>
                          <div className="text-xs text-neutral-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-700">{u.phone || "-"}</td>
                    <td className="p-4">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                          role === "admin"
                            ? "bg-[#1E2B4F]/10 text-[#1E2B4F]"
                            : "bg-amber-100 text-amber-900",
                        ].join(" ")}
                      >
                        {role}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-600">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-10 text-center text-neutral-500 font-medium">
                  No users match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-col items-center justify-between gap-3 text-sm text-neutral-600 md:flex-row">
        <div>
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={[
                "h-9 w-9 rounded-lg border text-sm shadow-sm",
                p === page
                  ? "border-[#1E2B4F] bg-[#1E2B4F] text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
              ].join(" ")}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
