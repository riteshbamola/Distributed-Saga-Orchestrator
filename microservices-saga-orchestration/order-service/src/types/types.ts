export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export interface OrderData {
  user_id: string;
  product_id: string;
  quantity: number;
  amount: number;
  status: OrderStatus;
}

export interface CreateOrderDTO {
  user_id: string;
  product_id: string;
  quantity: number;
  amount: number;
}
