import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../Context/CartContext";
import { AuthContext } from "../Context/AuthContext";
import { saveOrder } from "../services/orderService";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [errors, setErrors] = useState({});

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const validate = () => {
    let newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!user) {
      newErrors.user = "You must be logged in to place order";
    }

    if (cart.length === 0) {
      newErrors.cart = "Cart is empty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOrder = () => {
    if (!validate()) return;

    const order = {
      id: Date.now(),
      userEmail: user.email,
      items: cart,
      total,
      name,
      address,
      phone,
      date: new Date().toLocaleString(),
      status: "Placed",
    };

    saveOrder(order);
    clearCart();
    navigate("/order-success");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-gray-900 p-10 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-yellow-500 mb-6">
          Checkout
        </h2>

        {/* Name */}
        <input
          type="text"
          placeholder="Full Name"
          className="w-full mb-1 p-3 rounded bg-gray-800"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mb-3">{errors.name}</p>
        )}

        {/* Address */}
        <input
          type="text"
          placeholder="Address"
          className="w-full mb-1 p-3 rounded bg-gray-800"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        {errors.address && (
          <p className="text-red-500 text-sm mb-3">{errors.address}</p>
        )}

        {/* Phone */}
        <input
          type="text"
          placeholder="Phone Number"
          className="w-full mb-1 p-3 rounded bg-gray-800"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mb-3">{errors.phone}</p>
        )}

        {errors.user && (
          <p className="text-red-500 text-sm mb-3">{errors.user}</p>
        )}

        {errors.cart && (
          <p className="text-red-500 text-sm mb-3">{errors.cart}</p>
        )}

        <p className="mb-6 text-lg">
          Total: <span className="text-yellow-400">₹ {total}</span>
        </p>

        <button
          onClick={handleOrder}
          className="w-full bg-yellow-500 text-black py-3 rounded-lg font-semibold hover:bg-yellow-400 transition"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Checkout;
