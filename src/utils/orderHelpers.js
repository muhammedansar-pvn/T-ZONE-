// ==========================================
// 🎨 STATUS BADGE STYLE
// ==========================================
export const getStatusStyle = (status) => {
  switch (status) {
    case "Delivered":
      return "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-green-500/30 px-3 py-1 rounded-full text-xs font-semibold";

    case "Shipped":
    case "Out for Delivery":
      return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold";

    case "Placed":
    case "Processing":
      return "bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md shadow-yellow-500/30 px-3 py-1 rounded-full text-xs font-semibold";

    case "Cancelled":
      return "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/30 px-3 py-1 rounded-full text-xs font-semibold";

    default:
      return "bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-semibold";
  }
};

// ==========================================
// 📊 PROGRESS WIDTH
// ==========================================
export const getProgressWidth = (status) => {
  switch (status) {
    case "Placed":
      return "20%";

    case "Processing":
      return "40%";

    case "Shipped":
      return "65%";

    case "Out for Delivery":
      return "85%";

    case "Delivered":
      return "100%";

    default:
      return "0%";
  }
};