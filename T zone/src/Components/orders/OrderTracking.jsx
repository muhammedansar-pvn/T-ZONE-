const steps = [
  "Placed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const OrderTracking = ({ status }) => {
  if (!status) return null;

  if (status === "Cancelled") {
    return (
      <div className="mt-6 text-center text-red-500 font-semibold">
        Order Cancelled
      </div>
    );
  }

  if (status === "Partially Cancelled") {
    return (
      <div className="mt-6 text-center text-yellow-500 font-semibold">
        Partially Cancelled
      </div>
    );
  }

  const currentStep = steps.indexOf(status);

  return (
    <div className="mt-6 relative">

      <div className="flex justify-between items-center relative">

        {steps.map((step, index) => {
          const isActive = index <= currentStep;

          return (
            <div
              key={step}
              className="flex-1 flex flex-col items-center relative"
            >
              {/* Line */}
              {index !== 0 && (
                <div
                  className={`absolute top-3 -left-1/2 w-full h-1 ${
                    index <= currentStep
                      ? "bg-green-500"
                      : "bg-gray-600"
                  }`}
                />
              )}

              {/* Circle */}
              <div
                className={`w-6 h-6 rounded-full z-10 ${
                  isActive
                    ? "bg-green-500"
                    : "bg-gray-600"
                }`}
              />

              {/* Label */}
              <p className="text-xs mt-2 text-center">
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracking;