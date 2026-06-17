import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import toast from "react-hot-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart, totalPrice } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* ================= REDIRECT ================= */
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (cart.length === 0) {
      navigate("/cart");
      return;
    }

    if (user?.name) {
      setForm((prev) => ({ ...prev, name: user.name }));
    }
  }, [user, cart, navigate]);

  /* ================= VALIDATION ================= */
  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Enter full name";

    if (!form.address.trim() || form.address.length < 10)
      newErrors.address = "Enter valid address (min 10 characters)";

    if (!/^[6-9]\d{9}$/.test(form.phone))
      newErrors.phone = "Enter valid 10-digit phone number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= RAZORPAY PAYMENT ================= */
  const startRazorpayPayment = (keyId, razorpayOrder, dbOrderId, dbOrderReadableId) => {
    return new Promise((resolve) => {
      if (!window.Razorpay) {
        toast.error("Payment gateway SDK failed to load. Please refresh.");
        resolve({ success: false });
        return;
      }

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "T-zone",
        description: "Payment for Order " + dbOrderReadableId,
        order_id: razorpayOrder.id,

        handler: async function (response) {
          try {
            setLoading(true);
            const verifyRes = await API.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: dbOrderId,
            });

            if (verifyRes.data.success) {
              resolve({ success: true });
            } else {
              toast.error(verifyRes.data.message || "Payment verification failed");
              resolve({ success: false });
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error(error.response?.data?.message || "Payment verification failed");
            resolve({ success: false });
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled");
            resolve({ success: false });
          },
        },

        prefill: {
          name: form.name,
          contact: form.phone,
          email: user?.email || "",
        },

        theme: { color: "#facc15" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  /* ================= ORDER PLACEMENT ================= */
  const handleOrder = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // 1. Check if user is blocked before processing
      const userId = user.id || user._id;
      const userRes = await API.get(`/users/${userId}`);
      if (userRes.data.isBlocked) {
        toast.error("Your account is blocked");
        navigate("/login");
        return;
      }

      // 2. Prepare checkout products format
      const preparedProducts = cart.map((item) => ({
        productId: item._id,
        quantity: Number(item.quantity),
        name: item.name,
      }));

      // 3. Create the Order on the backend first
      const orderRes = await API.post("/orders", {
        products: preparedProducts,
        paymentMethod: paymentMethod === "ONLINE" ? "Online" : "Cash on Delivery",
        address: form.address.trim(),
        phone: form.phone,
        customerName: form.name.trim(),
        userEmail: user.email,
      });

      const { success, data: order } = orderRes.data;

      if (!success || !order) {
        toast.error(orderRes.data.message || "Failed to create order");
        return;
      }

      const dbOrderId = order._id;
      const dbOrderReadableId = order.orderId;

      /* A. CASH ON DELIVERY FLOW */
      if (paymentMethod === "COD") {
        toast.success("Order placed successfully!");
        clearCart();
        navigate("/order-success", { state: { orderId: dbOrderReadableId } });
        return;
      }

      /* B. ONLINE PAYMENT FLOW */
      if (paymentMethod === "ONLINE") {
        // Create Razorpay Order on the backend
        const payOrderRes = await API.post("/payments/create-order", {
          orderId: dbOrderId,
        });

        const { success: paySuccess, data: payData } = payOrderRes.data;

        if (!paySuccess || !payData) {
          toast.error(payOrderRes.data.message || "Failed to initiate payment");
          return;
        }

        // Open Razorpay Popup
        const paymentResult = await startRazorpayPayment(
          payData.keyId,
          payData.razorpayOrder,
          dbOrderId,
          dbOrderReadableId
        );

        if (paymentResult.success) {
          toast.success("Payment successful!");
          clearCart();
          navigate("/order-success", { state: { orderId: dbOrderReadableId } });
        }
      }

    } catch (error) {
      console.error("Checkout process failed:", error);
      toast.error(error.response?.data?.message || "Order placement failed. Check stock availability.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-8">
      <div className="bg-gray-900 p-10 rounded-2xl w-full max-w-md shadow-xl border border-gray-800">
        <h2 className="text-2xl font-bold text-yellow-500 mb-6 text-center">
          Checkout
        </h2>

        <div className="mb-4">
          <label htmlFor="checkout-name" className="block text-sm text-gray-400 mb-1">Full Name</label>
          <input
            id="checkout-name"
            type="text"
            placeholder="Full Name"
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-yellow-500"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="checkout-address" className="block text-sm text-gray-400 mb-1">Shipping Address</label>
          <textarea
            id="checkout-address"
            placeholder="Full Address (min 10 characters)"
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-yellow-500 h-24 resize-none"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="checkout-phone" className="block text-sm text-gray-400 mb-1">Phone Number</label>
          <input
            id="checkout-phone"
            type="text"
            placeholder="Phone Number"
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-yellow-500"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value.replace(/\D/g, ""),
              })
            }
            maxLength="10"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="checkout-payment-method" className="block text-sm text-gray-400 mb-1">
            Payment Method
          </label>
          <select
            id="checkout-payment-method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-yellow-500"
          >
            <option value="COD">Cash on Delivery</option>
            <option value="ONLINE">Online Payment (Razorpay)</option>
          </select>
        </div>

        <div className="mb-6 border-t border-gray-800 pt-4 flex justify-between items-center">
          <span className="text-gray-400 text-lg">Total Amount:</span>
          <span className="text-yellow-400 text-2xl font-bold">₹ {totalPrice}</span>
        </div>

        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full bg-yellow-500 text-black py-3 rounded-xl font-semibold hover:bg-yellow-400 transition disabled:opacity-50 focus:outline-none active:scale-[0.98]"
        >
          {loading ? "Processing..." : "Confirm Order"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;