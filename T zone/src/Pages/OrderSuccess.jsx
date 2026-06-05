import { useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      
      <div className="bg-gray-900 p-10 rounded-2xl shadow-xl text-center max-w-md w-full">

        <h1 className="text-3xl font-bold text-green-500 mb-3">
          Order Placed Successfully 
        </h1>

        <p className="text-gray-400 mb-6">
          Thank you for shopping with us.  
          Your order has been confirmed.
        </p>

        <div className="flex flex-col gap-3">

          <button
            onClick={() => navigate("/orders")}
            className="bg-yellow-500 text-black py-3 rounded-xl font-semibold hover:bg-yellow-400 transition"
          >
            View My Orders
          </button>

          <button
            onClick={() => navigate("/")}
            className="border border-gray-600 py-3 rounded-xl hover:bg-gray-800 transition"
          >
            Continue Shopping
          </button>

        </div>

      </div>

    </div>
  );
};

export default OrderSuccess;