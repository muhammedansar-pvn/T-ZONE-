const OrderItem = ({ item, orderStatus, onCancel }) => {
  if (!item) return null;

  const canCancel =
    (orderStatus === "Placed" ||
      orderStatus === "Processing") &&
    item.status !== "Delivered" &&
    item.status !== "Cancelled" &&
    Number(item.quantity) > 0;

  return (
    <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg hover:bg-gray-750 transition">

      <div>
        <p className="font-semibold">{item?.name}</p>

        <p className="text-sm text-gray-400">
          {item?.quantity} x ₹ {item?.price}
        </p>

        <p className="text-xs mt-1 text-yellow-400">
          Status: {item?.status}
        </p>

        <p className="text-xs text-green-400">
          Payment: {item?.paymentStatus}
        </p>
      </div>

      {canCancel && (
        <button
          onClick={() => onCancel?.(item?.productId)}
          className="text-red-400 text-sm hover:text-red-300"
        >
          Cancel 1 Qty
        </button>
      )}
    </div>
  );
};

export default OrderItem;