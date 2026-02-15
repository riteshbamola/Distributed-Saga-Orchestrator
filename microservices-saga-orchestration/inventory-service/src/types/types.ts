export enum InventoryReservationStatus {
  RESERVED = "RESERVED",
  RELEASED = "RELEASED",
  CONFIRMED = "CONFIRMED",
}

export interface OrderData {
  user_id: string;
  product_id: string;
  quantity: number;
  amount: number;
  status: InventoryReservationStatus;
}

export interface inventoryReserveDTO {
  order_id: string;
  product_id: string;
  quantity: number;
}
