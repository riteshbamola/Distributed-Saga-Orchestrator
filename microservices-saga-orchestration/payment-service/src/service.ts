import * as repository from "./model";
import { producer } from "./kafka";
import { createPaymentDTO } from "./types/types";
export async function createPayment(data: createPaymentDTO) {
  const { order_id, amount } = data;
  try {
    const result = await repository.createPayment(order_id, amount);

    const paymentId = result.insertId;
    const status = result.status;

    const topic = status === "SUCCESS" ? "payments.success" : "payments.failed";

    await producer.send({
      topic: "topic",
      messages: [{ value: JSON.stringify({ order_id, amount }) }],
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}
