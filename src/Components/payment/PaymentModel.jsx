import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/api";

const RAZORPAY_KEY = "rzp_test_SL2c0HhDhEtqp1";

const PaymentModal = ({ order, onClose, onSuccess }) => {
  const [method, setMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const isAlreadyPaid = order.paymentStatus === "Paid";

  // ✅ Safe Amount Calculation
  const totalAmount = Math.round(
    Number(order.totalAmount || order.total || 0)
  );

  const handlePayment = async () => {
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
        await axios.patch(`${BASE_URL}/orders/${order.id}`, {
          paymentStatus: "Pending",
          paymentMethod: "Cash on Delivery",
          placedAt: now,
        });

        alert("Order Placed Successfully (Pay on Delivery)");
        setLoading(false);
        onSuccess?.();
        onClose?.();
        return;
      }

      // ================= CHECK RAZORPAY SCRIPT =================
      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Refresh page.");
        setLoading(false);
        return;
      }

      // ================= RAZORPAY TEST =================
      const options = {
        key: RAZORPAY_KEY,
        amount: totalAmount * 100, // ✅ Always paise
        currency: "INR",
        name: "T-ZONE",
        description: `Order #${order.id}`,
        handler: async function (response) {
          await axios.patch(`${BASE_URL}/orders/${order.id}`, {
            paymentStatus: "Paid",
            paymentMethod: method,
            paymentId: response.razorpay_payment_id,
            paidAt: now,
          });

          alert("Payment Successful ✅ (Test Mode)");
          setLoading(false);
          onSuccess?.();
          onClose?.();
        },
        modal: {
          ondismiss: function () {
            alert("Payment Cancelled ❌");
            setLoading(false);
          },
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

        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          disabled={isAlreadyPaid}
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