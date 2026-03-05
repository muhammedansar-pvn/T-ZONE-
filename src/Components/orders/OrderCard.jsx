import { useState } from "react";
import OrderItem from "./OrderItem";
import OrderTracking from "./OrderTracking";
import PaymentModal from "../payment/PaymentModel";
import {
  getStatusStyle,
  getProgressWidth,
} from "../../utils/orderHelpers";

const OrderCard = ({
  order,
  orderTotal = 0,
  onCancelOrder,
  onReturnOrder,
  onCancelItem,
  onPaymentSuccess,
}) => {

  const [expanded, setExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const products = order?.products || [];
  const overallStatus = order?.status || "Placed";
  const paymentStatus = order?.paymentStatus || "Pending";

  // ---------- PROFESSIONAL LOGIC ----------

  // Cancel only before shipping
  const canCancel =
    overallStatus === "Placed" ||
    overallStatus === "Processing";

  // Return only after delivery
  const canReturn =
    overallStatus === "Delivered" &&
    paymentStatus === "Paid";

  // Payment only if unpaid
  const canPay =
    paymentStatus !== "Paid" &&
    overallStatus === "Placed";

  return (
    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-yellow-500 transition-all duration-300">

      {/* TOP SECTION */}
      <div className="flex justify-between flex-wrap gap-6">

        {/* LEFT SIDE */}
        <div className="flex-1 min-w-[250px]">

          <p className="text-sm text-gray-400">
            Order ID: {order?.id}
          </p>

          <span
            className={`inline-block mt-3 px-3 py-1 text-sm rounded-full ${getStatusStyle(
              overallStatus
            )}`}
          >
            {overallStatus}
          </span>

          <p className="mt-4 text-2xl font-bold">
            ₹ {Number(orderTotal).toLocaleString()}
          </p>

          {overallStatus !== "Cancelled" && (
            <>
              <OrderTracking status={overallStatus} />

              {/* PROGRESS BAR */}
              <div className="mt-3 bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: getProgressWidth(overallStatus),
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex flex-col gap-3 min-w-[150px]">

          <button
            onClick={() => setExpanded(prev => !prev)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm"
          >
            {expanded ? "Hide Details" : "View Details"}
          </button>

          {/* PAY BUTTON */}
          {canPay && (
            <button
              onClick={() => setShowPayment(true)}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm"
            >
              Pay Now
            </button>
          )}

          {/* CANCEL ORDER */}
          {canCancel && (
            <button
              onClick={() => onCancelOrder?.(order?.id)}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
            >
              Cancel Order
            </button>
          )}

          {/* RETURN ORDER */}
          {canReturn && (
            <button
              onClick={() => onReturnOrder?.(order?.id)}
              className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-sm"
            >
              Return Order
            </button>
          )}

        </div>
      </div>

      {/* PRODUCT DETAILS */}
      {expanded && (
        <div className="mt-6 border-t border-gray-800 pt-4 space-y-4">

          {products.length === 0 && (
            <p className="text-gray-400 text-sm">
              No products found
            </p>
          )}

          {products.map((item) => (
            <OrderItem
              key={item.productId}
              item={item}
              orderStatus={overallStatus}
              onCancel={(productId) =>
                onCancelItem?.(order?.id, productId)
              }
            />
          ))}

        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPayment && (
        <PaymentModal
          order={order}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            onPaymentSuccess?.();
          }}
        />
      )}

    </div>
  );
};

export default OrderCard;