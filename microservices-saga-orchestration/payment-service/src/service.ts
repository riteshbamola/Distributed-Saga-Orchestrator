import * as repository from "./model";
import { producer } from "./kafka";
import { createPaymentDTO } from "./types/types";

export async function createPayment(data: createPaymentDTO) {
  const { orderID, amount } = data;
  try {
    const result = await repository.createPayment(orderID, amount);

    const paymentId = result.id;
    const status = result.status;

    const topic = status === "SUCCESS" ? "payment.success" : "payment.failed";

    await producer.send({
      topic,
      messages: [{ value: JSON.stringify({ orderID, amount, paymentId }) }],
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}
