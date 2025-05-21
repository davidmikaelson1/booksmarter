class OrderItem {
  constructor(orderItemId, orderId, bookId, quantity) {
    this.orderItemId = orderItemId;
    this.orderId = orderId;
    this.bookId = bookId;
    this.quantity = quantity;
  }

  static fromDatabase(row) {
    return new OrderItem(row.orderItemId, row.orderId, row.bookId, row.quantity);
  }
}

module.exports = OrderItem;