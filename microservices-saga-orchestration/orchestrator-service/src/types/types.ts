export interface OrderCreatedDTO {
  orderID: string;
  productID: string;
  quantity: number;
  amount: number;
}

export interface sagaDTO {
  orderID: string;
  sagaID: string;
  productID: string;
  quantity: number;
  amount: number;
}
