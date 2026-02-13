import * as orderService from "./service";
import { Request, Response } from "express";
import { CreateOrderDTO, OrderStatus } from "./types/types";

export const createOrder = async (
  req: Request<{}, {}, CreateOrderDTO>,
  res: Response,
) => {
  try {
    await orderService.createOrder(req.body);
    res.status(201).json({ msg: "Order created successfully" });
  } catch (error) {
    res.status(400).json({ msg: "Invalid request", error });
  }
};

export const getOrders = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const orders = await orderService.getOrder(req.params.id);
    res.status(200).json({ orders });
  } catch (error) {
    res.status(400).json({ msg: "Invalid request", error });
  }
};

export const updateOrderStatus = async (
  req: Request<{ id: string }, {}, { status: OrderStatus }>,
  res: Response,
) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status,
    );
    res.status(200).json({ order });
  } catch (error) {
    res.status(400).json({ msg: "Invalid request", error });
  }
};

export const deleteOrder = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    await orderService.deleteOrder(req.params.id);
    res.status(200).json({ msg: "Order deleted successfully" });
  } catch (error) {
    res.status(400).json({ msg: "Invalid request", error });
  }
};
