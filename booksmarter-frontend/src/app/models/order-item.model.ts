export interface OrderItem {
  orderItemId: number;
  orderId: number; // Foreign key to Order
  bookId: number; // Foreign key to Book
  quantity: number;
}
