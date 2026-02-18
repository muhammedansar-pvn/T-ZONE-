import { useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-4xl text-green-500 mb-4">
        Order Placed Successfully 
      </h1>

      <button
        onClick={() => navigate("/orders")}
        className="bg-yellow-500 text-black px-6 py-2 rounded"
      >
        View My Orders
      </button>
    </div>
  );
};

export default OrderSuccess;
