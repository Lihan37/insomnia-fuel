// src/pages/auth/Register.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { updateProfile } from "firebase/auth";

export default function Register() {
  const { registerUser } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1) Firebase account
      const cred = await registerUser(email.trim(), password);

      // Set Firebase displayName so it’s visible across the app
      const trimmedName = name.trim();
      if (trimmedName) {
        await updateProfile(cred.user, { displayName: trimmedName });
      }

      // 2) Get ID token for secured backend call
      const token = await cred.user.getIdToken(true);

      // 3) Send user to backend (simple upsert)
      await api.post(
        "/api/users",
        {
          name: trimmedName,
          phone: phone.trim(),
          displayName: trimmedName,
          photoURL: cred.user.photoURL ?? "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await Swal.fire({
        icon: "success",
        title: "Welcome to Insomnia Fuel!",
        text: "Account created successfully.",
        timer: 1600,
        showConfirmButton: false,
      });

      navigate("/");
    } catch (err: any) {
      await Swal.fire({
        icon: "error",
        title: "Registration failed",
        text:
          err?.response?.data?.message ?? err?.message ?? "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#F7F0E8] px-4 py-10">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-[#3B0A00]/10 rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center text-[#3B0A00]">
          Create account
        </h1>
        <p className="text-sm text-center text-[#3B0A00]/70 mb-6">
          Join the Insomnia Fuel family in a few quick steps.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-1">
            <label
              htmlFor="register-name"
              className="text-sm font-medium text-[#3B0A00]"
            >
              Full name
            </label>
            <input
              id="register-name"
              type="text"
              placeholder="Your full name"
              className="w-full px-4 py-3 rounded-lg border border-[#3B0A00]/30 text-[#3B0A00] placeholder:text-[#A67B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#A67B5B] bg-white/80 transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label
              htmlFor="register-phone"
              className="text-sm font-medium text-[#3B0A00]"
            >
              Phone number (optional)
            </label>
            <input
              id="register-phone"
              type="tel"
              placeholder="e.g. +61 4 1234 5678"
              className="w-full px-4 py-3 rounded-lg border border-[#3B0A00]/30 text-[#3B0A00] placeholder:text-[#A67B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#A67B5B] bg-white/80 transition"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="register-email"
              className="text-sm font-medium text-[#3B0A00]"
            >
              Email
            </label>
            <input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg border border-[#3B0A00]/30 text-[#3B0A00] placeholder:text-[#A67B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#A67B5B] bg-white/80 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password with toggle */}
          <div className="space-y-1">
            <label
              htmlFor="register-password"
              className="text-sm font-medium text-[#3B0A00]"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                className="w-full px-4 py-3 pr-16 rounded-lg border border-[#3B0A00]/30 text-[#3B0A00] placeholder:text-[#A67B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#A67B5B] bg-white/80 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-[#A67B5B] hover:text-[#3B0A00] focus:outline-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-[#3B0A00]/60">
              Use at least 6 characters. A mix of letters and numbers is safer.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#3B0A00] hover:bg-[#A67B5B] text-white rounded-lg font-semibold tracking-wide transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-[#3B0A00]/70">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#3B0A00] font-medium hover:text-[#A67B5B] transition"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
