// src/pages/auth/Login.tsx
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { api, setAuthToken } from "@/lib/api";

export default function Login() {
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();
  const location = useLocation() as { state?: { next?: string } };
  const next = location.state?.next || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // 1) Firebase sign-in
      const cred = await loginWithEmail(email.trim(), password);

      // 2) Get token & set axios header for this session
      const token = await cred.user.getIdToken(true);
      setAuthToken(token);

      // 3) Upsert user profile in backend (idempotent)
      await api.post(
        "/api/users",
        {
          displayName: cred.user.displayName ?? "",
          photoURL: cred.user.photoURL ?? "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await Swal.fire({
        icon: "success",
        title: "Welcome back!",
        timer: 1200,
        showConfirmButton: false,
      });

      // 4) Go to intended page (e.g., /order) or home
      nav(next, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      await Swal.fire({ icon: "error", title: "Login failed", text: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#F7F0E8] px-4 py-10">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-[#3B0A00]/10 rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center text-[#3B0A00]">
          Welcome back
        </h1>
        <p className="text-sm text-center text-[#3B0A00]/70 mb-6">
          Log in to manage your orders and activity.
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="login-email"
              className="text-sm font-medium text-[#3B0A00]"
            >
              Email
            </label>
            <input
              id="login-email"
              className="w-full px-4 py-3 rounded-lg border border-[#3B0A00]/30 text-[#3B0A00] placeholder:text-[#A67B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#A67B5B] bg-white/80 transition"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password with toggle */}
          <div className="space-y-1">
            <label
              htmlFor="login-password"
              className="text-sm font-medium text-[#3B0A00]"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                className="w-full px-4 py-3 pr-16 rounded-lg border border-[#3B0A00]/30 text-[#3B0A00] placeholder:text-[#A67B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#A67B5B] bg-white/80 transition"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-[#A67B5B] hover:text-[#3B0A00] focus:outline-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            className="w-full rounded-lg bg-[#350404] hover:bg-[#790808] text-white py-3 font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-[#3B0A00]/70">
          New here?{" "}
          <Link
            className="text-[#3B0A00] font-medium hover:text-[#A67B5B] transition"
            to="/register"
            state={{ next }}
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
