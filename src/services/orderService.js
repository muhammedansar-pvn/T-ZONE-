export const saveOrder = (order) => {
  const existingOrders =
    JSON.parse(localStorage.getItem("orders")) || [];

  existingOrders.push(order);

  localStorage.setItem(
    "orders",
    JSON.stringify(existingOrders)
  );
};

export const getOrders = () => {
  return JSON.parse(localStorage.getItem("orders")) || [];
};

export const cancelOrder = (id) => {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  const updatedOrders = orders.map((order) =>
    order.id === id
      ? { ...order, status: "Cancelled" }
      : order
  );

  localStorage.setItem("orders", JSON.stringify(updatedOrders));
};
