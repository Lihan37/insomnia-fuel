import { useLocation, useNavigate } from "react-router-dom";

export default function OrderPlaced() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get("orderId");

  const handleViewOrder = () => {
    if (orderId) {
      navigate(`/dashboard/order/${orderId}`);
      return;
    }
    navigate("/dashboard/order");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF5EF] px-4">
      <div className="bg-white shadow-lg rounded-2xl px-8 py-6 max-w-md w-full text-center">
        <h2 className="text-xl font-bold text-[#3A2C20] mb-2">
          Order received
        </h2>
        <p className="text-sm text-neutral-600 mb-4">
          Thanks! Your order has been sent to the cafe. Please go to the cafe,
          pay at the counter, and collect your food.
        </p>

        {orderId && (
          <p className="text-[11px] text-neutral-400 break-all mb-4">
            Order ID: {orderId}
          </p>
        )}

        <button
          onClick={handleViewOrder}
          className="inline-flex items-center justify-center rounded-full bg-[#3A2C20] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80 transition"
        >
          View my order
        </button>

        <button
          onClick={() => navigate("/menu")}
          className="mt-3 block w-full text-xs text-neutral-500 hover:text-neutral-700 transition"
        >
          Back to menu
        </button>
      </div>
    </div>
  );
}
