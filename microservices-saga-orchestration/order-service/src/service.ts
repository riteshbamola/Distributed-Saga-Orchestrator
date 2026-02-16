import * as orderRepository from "./model";
import { OrderStatus, CreateOrderDTO, OrderData } from "./types/types";
import { producer } from "./kafka";
const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.CANCELLED],
  [OrderStatus.CANCELLED]: [],
};

export const createOrder = async (data: CreateOrderDTO) => {
  if (!data.user_id || !data.product_id) {
    throw new Error("User ID and Product ID are required");
  }

  if (data.quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  if (data.amount < 0) {
    throw new Error("Amount cannot be negative");
  }

  const orderData = {
    ...data,
    status: OrderStatus.PENDING,
  };

  const orderId = await orderRepository.insertOrder(orderData);

  // publish event order.created
  try {
    await producer.send({
      topic: "order.created",
      messages: [
        {
          key: orderId,
          value: JSON.stringify({
            eventId: crypto.randomUUID(),
            orderID: orderId,
            productID: data.product_id,
            quantity: data.quantity,
            amount: data.amount,
            occurredAt: new Date().toISOString(),
          }),
        },
      ],
    });

  } catch (error) {
    console.error("Failed to publish order.created", error);
    throw new Error("Order created but event publishing failed");
  }

  return orderId;
};

export const getOrder = async (id: string) => {
  const order = await orderRepository.getOrderById(id);
  return order;
};

export const deleteOrder = async (id: string) => {
  const order = await orderRepository.getOrderById(id);
  if (!order) {
    throw new Error("Order not found");
  }

  await orderRepository.deleteOrderById(id);
};

export const updateOrderStatus = async (id: string, newStatus: OrderStatus) => {
  const order = await orderRepository.getOrderById(id);
  if (!order) {
    throw new Error("Order not found");
  }

  const currentStatus = order.status as OrderStatus;
  const isValid = allowedTransitions[currentStatus]?.includes(newStatus);

  if (!isValid) {
    throw new Error(
      `Invalid status transition from ${currentStatus} to ${newStatus}`,
    );
  }

  return await orderRepository.updateOrderStatus(id, newStatus);
};
