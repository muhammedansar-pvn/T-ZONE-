import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../Context/CartContext";
import { AuthContext } from "../Context/AuthContext";
import { BASE_URL } from "../config/api";

const RAZORPAY_KEY = "rzp_test_SL2c0HhDhEtqp1";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart, totalPrice } = useContext(CartContext);
  const { user } = useContext(AuthContext);

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
    if (!user) navigate("/login");
    if (cart.length === 0) navigate("/cart");

    if (user?.name) {
      setForm((prev) => ({ ...prev, name: user.name }));
    }
  }, [user, cart, navigate]);

  /* ================= VALIDATION ================= */
  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Enter full name";

    if (!form.address.trim() || form.address.length < 10)
      newErrors.address = "Enter valid address";

    if (!/^[6-9]\d{9}$/.test(form.phone))
      newErrors.phone = "Enter valid 10 digit phone number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= RAZORPAY ================= */
  const openRazorpay = () => {
    return new Promise((resolve) => {
      if (!window.Razorpay) {
        alert("Payment gateway failed to load");
        resolve({ success: false });
        return;
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: totalPrice * 100,
        currency: "INR",
        name: "T-zone",
        description: "Order Payment",
        handler: function (response) {
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
          });
        },
        modal: {
          ondismiss: function () {
            resolve({ success: false });
          },
        },
        theme: { color: "#facc15" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  /* ================= MAIN ORDER ================= */
  const handleOrder = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      /* 0️⃣ CHECK USER BLOCK STATUS */
      const userRes = await axios.get(`${BASE_URL}/users/${user.id}`);

      if (userRes.data.isBlocked) {
        alert("Your account has been blocked by admin ❌");
        setLoading(false);
        navigate("/login");
        return;
      }

      /* 1️⃣ FETCH LATEST PRODUCTS */
      const productResponses = await Promise.all(
        cart.map((item) =>
          axios.get(`${BASE_URL}/products/${item.id}`)
        )
      );

      const preparedProducts = [];

      for (let i = 0; i < cart.length; i++) {
        const product = productResponses[i].data;
        const cartItem = cart[i];

        if (product.stock < cartItem.quantity) {
          alert(`${product.name} only ${product.stock} left`);
          setLoading(false);
          return;
        }

        preparedProducts.push({
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          costPrice: Number(product.costPrice || 0),
          quantity: Number(cartItem.quantity),
          status: "Placed",
        });
      }

      const orderId = "ORD_" + Date.now();

      let paymentData = null;

      /* 2️⃣ ONLINE PAYMENT */
      if (paymentMethod === "ONLINE") {
        paymentData = await openRazorpay();

        if (!paymentData.success) {
          alert("Payment Cancelled ❌");
          setLoading(false);
          return;
        }
      }

      /* 3️⃣ CREATE ORDER */
      const newOrder = {
        id: orderId,
        userEmail: user.email,
        customerName: form.name,
        address: form.address,
        phone: form.phone,
        paymentMethod:
          paymentMethod === "ONLINE"
            ? "Online"
            : "Cash on Delivery",
        paymentStatus:
          paymentMethod === "ONLINE"
            ? "Paid"
            : "Pending",
        paymentId:
          paymentMethod === "ONLINE"
            ? paymentData.paymentId
            : null,
        status: "Placed",
        isDeleted: false,
        createdAt: new Date().toISOString(),
        totalAmount: totalPrice,
        products: preparedProducts,
      };

      await axios.post(`${BASE_URL}/orders`, newOrder);

      /* 4️⃣ UPDATE STOCK */
      await Promise.all(
        preparedProducts.map(async (item) => {
          const res = await axios.get(
            `${BASE_URL}/products/${item.productId}`
          );

          await axios.patch(
            `${BASE_URL}/products/${item.productId}`,
            {
              stock: res.data.stock - item.quantity,
            }
          );
        })
      );

      /* 5️⃣ SAVE PAYMENT RECORD */
      if (paymentMethod === "ONLINE") {
        await axios.post(`${BASE_URL}/payments`, {
          orderId,
          paymentId: paymentData.paymentId,
          amount: totalPrice,
          status: "Success",
          createdAt: new Date().toISOString(),
        });
      }

      /* 6️⃣ CLEAR CART + REDIRECT */
      clearCart();
      navigate("/order-success", { state: { orderId } });

    } catch (error) {
      console.error(error);
      alert("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="bg-gray-900 p-10 rounded-2xl w-full max-w-md shadow-xl">

        <h2 className="text-2xl font-bold text-yellow-500 mb-6 text-center">
          Checkout
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full mb-2 p-3 rounded bg-gray-800"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />
        {errors.name && (
          <p className="text-red-500 text-sm mb-2">
            {errors.name}
          </p>
        )}

        <textarea
          placeholder="Full Address"
          className="w-full mb-2 p-3 rounded bg-gray-800"
          value={form.address}
          onChange={(e) =>
            setForm({ ...form, address: e.target.value })
          }
        />
        {errors.address && (
          <p className="text-red-500 text-sm mb-2">
            {errors.address}
          </p>
        )}

        <input
          type="text"
          placeholder="Phone Number"
          className="w-full mb-2 p-3 rounded bg-gray-800"
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
          <p className="text-red-500 text-sm mb-2">
            {errors.phone}
          </p>
        )}

        <div className="mb-4">
          <label className="block mb-2">
            Payment Method
          </label>

          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value)
            }
            className="w-full p-3 rounded bg-gray-800"
          >
            <option value="COD">
              Cash on Delivery
            </option>
            <option value="ONLINE">
              Online Payment (Razorpay Test)
            </option>
          </select>
        </div>

        <p className="mb-6 text-lg">
          Total:
          <span className="text-yellow-400 ml-2">
            ₹ {totalPrice}
          </span>
        </p>

        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full bg-yellow-500 text-black py-3 rounded-xl font-semibold hover:bg-yellow-400 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Confirm Order"}
        </button>

      </div>
    </div>
  );
};

export default Checkout;