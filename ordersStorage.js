const orders = [];

function getAllOrders() {
  return orders;
}

function getOrderById(id) {
  return orders.find(o => o.id === id);
}

function addOrder(order) {
  orders.unshift(order);
}

function updateOrder(updatedOrder) {
  const index = orders.findIndex(o => o.id === updatedOrder.id);
  if (index !== -1) {
    orders[index] = updatedOrder;
  }
}

module.exports = {
  getAllOrders,
  getOrderById,
  addOrder,
  updateOrder
};