import { useState } from "react";
import API from "../../config/api";

const PaymentModal = ({ order, onClose, onSuccess }) => {
  const [method, setMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  // ✅ Safe Paid Check
  const isAlreadyPaid =
    order?.paymentStatus?.toLowerCase() === "paid";

  // ✅ Safe Amount
  const totalAmount = Math.round(
    Number(order?.totalAmount || order?.total || 0)
  );

  const handlePayment = async () => {
    // 🛑 Prevent double click
    if (loading) return;

    if (isAlreadyPaid) {
      alert("This order is already paid.");
      return;
    }

    if (!totalAmount || totalAmount <= 0) {
      alert("Invalid order amount.");
      return;
    }

    try {
      setLoading(true);
      const now = new Date().toISOString();

      // ================= COD =================
      if (method === "Cash on Delivery") {
        await API.patch(`/orders/${order._id || order.id}`, {
          paymentStatus: "Pending",
          paymentMethod: "Cash on Delivery",
          placedAt: now,
        });

        alert("Order Placed Successfully (Pay on Delivery)");

        setLoading(false);

        // ✅ ONLY call success (parent handles close)
        onSuccess?.();
        return;
      }

      // ================= RAZORPAY CHECK =================
      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Refresh page.");
        setLoading(false);
        return;
      }

      // 1. Create Razorpay Order on the backend
      const payOrderRes = await API.post("/payments/create-order", {
        orderId: order._id || order.id,
      });

      const { success: paySuccess, data: payData } = payOrderRes.data;

      if (!paySuccess || !payData) {
        alert(payOrderRes.data.message || "Failed to initiate payment");
        setLoading(false);
        return;
      }

      // ================= RAZORPAY =================
      const options = {
        key: payData.keyId,
        amount: payData.razorpayOrder.amount,
        currency: payData.razorpayOrder.currency,
        name: "T-ZONE",
        description: `Order #${order.orderId || order.id}`,
        order_id: payData.razorpayOrder.id,

        handler: async function (response) {
          try {
            // 2. Verify Payment on the backend (handles signature verification & stock updates)
            const verifyRes = await API.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id || order.id,
            });

            if (verifyRes.data.success) {
              alert("Payment Successful ✅");
              onSuccess?.();
            } else {
              alert(verifyRes.data.message || "Payment verification failed");
              setLoading(false);
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert(err.response?.data?.message || "Error updating payment status");
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            alert("Payment Cancelled ❌");
            setLoading(false);
          },
        },

        prefill: {
          email: order.userEmail || "",
          contact: order.phone || "",
        },

        theme: {
          color: "#22c55e",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Payment Failed ❌");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl w-96 shadow-xl border border-gray-800">

        <h2 className="text-xl font-bold mb-4 text-yellow-500 text-center">
          Complete Payment
        </h2>

        <p className="mb-4 text-center">
          Amount:
          <span className="font-semibold ml-2">
            ₹ {totalAmount.toLocaleString()}
          </span>
        </p>

        {isAlreadyPaid && (
          <p className="text-green-400 text-sm text-center mb-3">
            This order is already paid.
          </p>
        )}

        {/* PAYMENT METHOD */}
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          disabled={isAlreadyPaid || loading}
          className="w-full p-2 bg-gray-800 text-white rounded mb-4 outline-none"
        >
          <option>UPI</option>
          <option>Card</option>
          <option>Net Banking</option>
          <option>Wallet</option>
          <option>Cash on Delivery</option>
        </select>

        {method === "Cash on Delivery" && (
          <p className="text-sm text-yellow-400 mb-3 text-center">
            You will pay when the order is delivered.
          </p>
        )}

        {/* BUTTONS */}
        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handlePayment}
            disabled={loading || isAlreadyPaid}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentModal;