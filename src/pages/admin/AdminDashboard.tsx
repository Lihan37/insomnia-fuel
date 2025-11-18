import { NavLink } from "react-router-dom";

export default function AdminDashboard() {
  const tab = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? "bg-black text-white" : "bg-white text-black hover:bg-black/10"
    }`;

  return (
    <section className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="mt-4 flex gap-2">
        <NavLink to="/admin" end className={tab}>
          Overview
        </NavLink>
        <NavLink to="/admin/users" className={tab}>
          Users
        </NavLink>
      </div>

      <div className="mt-6">
        <p className="text-neutral-700">
          Welcome, admin. Use the tabs to manage the site.
        </p>
      </div>
    </section>
  );
}
