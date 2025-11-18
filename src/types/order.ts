// src/types/order.ts

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid";

export interface IOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder {
  _id: string;
  userId: string | null;
  userName: string | null;
  email: string | null;

  items: IOrderItem[];

  subtotal: number;
  serviceFee: number;
  total: number;
  currency: string;

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  stripeSessionId: string;

  createdAt: string;
  updatedAt: string;

  // Optional customer notes / special instructions
  notes?: string | null;
}
