import * as repository from "./models";
import { producer } from "./kafka";
import { OrderCreatedDTO, sagaDTO } from "./types/types";

export const handleOrderCreated = async (data: OrderCreatedDTO) => {
  const { orderID, productID, quantity } = data;
  try {
    const saga = await repository.createSaga(orderID);

    const step = await repository.createSagaSteps(
      saga.id,
      "ORDER-CREATED",
      "COMPLETED",
    );

    // INVENTORY SERVICE STARTED
    await repository.createSagaSteps(saga.id, "INVENTORY-RESERVED", "PENDING");

    const inventoryData: sagaDTO = {
      orderID: step.order_id,
      sagaID: step.saga_id,
      productID: data.productID,
      quantity: data.quantity,
      amount: data.amount,
    };

    await producer.send({
      topic: "inventory.reserve",
      messages: [
        {
          key: step.order_id,
          value: JSON.stringify(inventoryData),
        },
      ],
    });

    return step;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create saga");
  }
};

export const handleOrderConfirmed = async (data: sagaDTO) => {
  const { orderID, sagaID, productID, quantity, amount } = data;
  try {
    const step = await repository.createSagaSteps(
      sagaID,
      "ORDER-CREATED",
      "COMPLETED",
    );

    const inventoryData: sagaDTO = {
      orderID: step.order_id,
      sagaID: step.saga_id,
      productID: data.productID,
      quantity: data.quantity,
      amount: data.amount,
    };
    return step;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create saga");
  }
};

export const handleInventoryReserved = async (data: sagaDTO) => {
  const { orderID, sagaID, productID, quantity, amount } = data;
  try {
    const step = await repository.updateSagaStepStatus(
      sagaID,
      "INVENTORY-RESERVED",
      "COMPLETED",
    );

    const paymentdata: sagaDTO = {
      orderID: step.order_id,
      sagaID: step.saga_id,
      productID: data.productID,
      quantity: data.quantity,
      amount: data.amount,
    };

    await repository.createSagaSteps(sagaID, "PAYMENT-REQUEST", "PENDING");

    await producer.send({
      topic: "payment.request",
      messages: [
        {
          key: step.order_id,
          value: JSON.stringify(paymentdata),
        },
      ],
    });

    return step;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create saga");
  }
};

export const handleInventoryFailed = async (data: sagaDTO) => {
  const { orderID, sagaID, productID, quantity, amount } = data;
  try {
    const currstep = await repository.updateSagaStepStatus(
      sagaID,
      "INVENTORY-RESERVED",
      "FAILED",
    );

    const newdata: sagaDTO = {
      orderID: orderID,
      sagaID: sagaID,
      productID: productID,
      quantity: quantity,
      amount: amount,
    };
    //compensating logic
    producer.send({
      topic: "order.cancel",
      messages: [
        {
          key: orderID,
          value: JSON.stringify(newdata),
        },
      ],
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create saga");
  }
};

export const handleinventoryCompleted = async (data: sagaDTO) => {
  const { orderID, sagaID, productID, quantity, amount } = data;
  try {
    const currstep = await repository.createSagaSteps(
      sagaID,
      "INVENTORY-COMPLETED",
      "COMPLETE",
    );

    const newdata: sagaDTO = {
      orderID: orderID,
      sagaID: sagaID,
      productID: productID,
      quantity: quantity,
      amount: amount,
    };
    //compensating logic
    producer.send({
      topic: "order.cancel",
      messages: [
        {
          key: orderID,
          value: JSON.stringify(newdata),
        },
      ],
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create saga");
  }
};

export const handlePaymentSuccess = async (data: sagaDTO) => {
  const { orderID, sagaID, productID, quantity, amount } = data;
  try {
    const step = await repository.updateSagaStepStatus(
      sagaID,
      "PAYMENT-REQUESTED",
      "COMPLETED",
    );

    const newdata: sagaDTO = {
      orderID: step.order_id,
      sagaID: step.saga_id,
      productID: data.productID,
      quantity: data.quantity,
      amount: data.amount,
    };

    await producer.send({
      topic: "inventory.complete",
      messages: [
        {
          key: step.order_id,
          value: JSON.stringify(newdata),
        },
      ],
    });

    return step;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create saga");
  }
};

export const handlePaymentFailed = async (data: sagaDTO) => {
  const { orderID, sagaID, productID, quantity, amount } = data;
  try {
    const step = await repository.updateSagaStepStatus(
      sagaID,
      "PAYMENT-REQUESTED",
      "FAILED",
    );

    const newdata: sagaDTO = {
      orderID: step.order_id,
      sagaID: step.saga_id,
      productID: data.productID,
      quantity: data.quantity,
      amount: data.amount,
    };

    await producer.send({
      topic: "inventory.release",
      messages: [
        {
          key: step.order_id,
          value: JSON.stringify(newdata),
        },
      ],
    });

    return step;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create saga");
  }
};
