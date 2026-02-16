export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export interface CreateOrderDTO {
  user_id: string;
  product_id: string;
  quantity: number;
  amount: number;
}

export interface OrderCreatedDTO {
  orderID: string;
  productID: string;
  quantity: number;
  amount: number;
}
