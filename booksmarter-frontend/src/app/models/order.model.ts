import { OrderItem } from './order-item.model';

export interface Order {
  rentId: number;
  rentedBookId: number; // Foreign key to Book
  rentDate: string; // ISO date string
  returnDeadline: string; // ISO date string
  returnDate?: string; // Optional ISO date string
  readerId: number; // Foreign key to Reader
  status: 'Waiting' | 'Denied' | 'Approved'; // Enum for order status
}
