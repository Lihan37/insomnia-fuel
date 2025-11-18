// src/pages/dashboard/CheckoutSuccess.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

type Status = "loading" | "success" | "error";

type StripeSession = {
  id: string;
  amount_total?: number | null;
  currency?: string | null;
  payment_status?: string;
};

export default function CheckoutSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<Status>("loading");
  const [session, setSession] = useState<StripeSession | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const verifyPayment = async () => {
      try {
        // baseURL = http://localhost:4000/
        // → GET http://localhost:4000/api/orders/<sessionId>
        const res = await api.get(
          `/api/orders/${encodeURIComponent(sessionId)}`
        );

        if (!res.data?.ok || !res.data.session) {
          throw new Error("Session not confirmed");
        }

        setSession(res.data.session as StripeSession);
        setStatus("success");
      } catch (err) {
        console.error("stripe-complete error", err);
        setStatus("error");
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF5EF] px-4">
        <div className="bg-white shadow-md rounded-2xl px-8 py-6 text-center">
          <p className="text-lg font-semibold text-[#3A2C20]">
            Verifying your payment...
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Please wait a moment while we confirm your order.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF5EF] px-4">
        <div className="bg-white shadow-lg rounded-2xl px-8 py-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-[#B3261E] mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-neutral-600 mb-4">
            We could not confirm your order. Please contact us with this
            reference so we can help you.
          </p>

          {sessionId && (
            <p className="text-[11px] text-neutral-400 break-all mb-6">
              Reference: {sessionId}
            </p>
          )}

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center rounded-full bg-[#E53935] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c62828] transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // SUCCESS
  const total =
    typeof session?.amount_total === "number"
      ? (session.amount_total / 100).toFixed(2)
      : null;

  const currency = session?.currency?.toUpperCase() || "AUD";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF5EF] px-4">
      <div className="bg-white shadow-lg rounded-2xl px-8 py-6 max-w-md w-full text-center">
        <h2 className="text-xl font-bold text-[#3A2C20] mb-2">
          Payment Successful 🎉
        </h2>
        <p className="text-sm text-neutral-600 mb-4">
          Your payment has been confirmed. We&apos;ll start preparing your order
          right away.
        </p>

        {total && (
          <p className="text-sm text-neutral-700 mb-1">
            Amount paid:{" "}
            <span className="font-semibold">
              {total} {currency}
            </span>
          </p>
        )}

        {session?.payment_status && (
          <p className="text-xs text-neutral-500 mb-4">
            Stripe status: {session.payment_status}
          </p>
        )}

        <button
          onClick={() => navigate("/dashboard/order")}
          className="inline-flex items-center justify-center rounded-full bg-[#3A2C20] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80 transition"
        >
          View My Order
        </button>

        <button
          onClick={() => navigate("/")}
          className="mt-3 block w-full text-xs text-neutral-500 hover:text-neutral-700 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
