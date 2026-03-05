import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../Context/CartContext";

const MAX_QUANTITY = 5;

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice } =
    useContext(CartContext);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 px-4 md:px-10 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
        Your Cart
      </h1>

      {cart.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-gray-600 text-lg">Your cart is empty 🛒</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-yellow-500 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-6 max-w-5xl mx-auto">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row gap-6 items-center"
              >
                {/* Image */}
                <img
                  src={
                    item.images?.[0] ||
                    item.image ||
                    "https://via.placeholder.com/150"
                  }
                  alt={item.name}
                  className="w-28 h-28 object-cover rounded-xl"
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/150")
                  }
                />

                {/* Details */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-yellow-500 font-bold mt-2">
                    ₹ {item.price}
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className={`px-3 py-1 rounded 
                      ${
                        item.quantity <= 1
                          ? "bg-gray-100 cursor-not-allowed"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                  >
                    -
                  </button>

                  <span className="font-semibold w-6 text-center">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= MAX_QUANTITY}
                    className={`px-3 py-1 rounded 
                      ${
                        item.quantity >= MAX_QUANTITY
                          ? "bg-gray-100 cursor-not-allowed"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                  >
                    +
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 font-medium hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Total Section */}
          <div className="max-w-5xl mx-auto mt-12 text-right">
            <h2 className="text-2xl font-bold mb-4">Total: ₹ {totalPrice}</h2>

            <button
              onClick={() => navigate("/checkout")}
              className="bg-yellow-500 text-black px-8 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition shadow"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
