import express from "express";
import { createOrder, getOrders, updateOrderStatus } from "./controller";
const router = express.Router();

router.post("/create-order", createOrder);
router.get("/orders", getOrders);
router.patch("/update-order-status/:id", updateOrderStatus);
