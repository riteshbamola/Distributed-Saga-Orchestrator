import { pool } from "./db";
import * as repository from "./model";
import { sagaDTO } from "./types/types";

import { producer } from "./kafka";

export const reserveInventory = async (data: sagaDTO) => {
  const { orderID, productID, quantity } = data;

  try {
    const result = await repository.reserveInventory(
      orderID,
      productID,
      quantity,
    );

    const topic =
      result.status === "RESERVED" ? "inventory.reserved" : "inventory.failed";

    const newdata: sagaDTO = {
      orderID: orderID,
      sagaID: data.sagaID,
      productID: productID,
      quantity: quantity,
      amount: data.amount,
    };

    await producer.send({
      topic,
      messages: [
        {
          key: orderID,
          value: JSON.stringify(newdata),
        },
      ],
    });

    return result;
  } catch (error) {
    console.error("Service reserve error:", error);
    throw error;
  }
};

export const releaseInventory = async (data: sagaDTO) => {
  const { orderID, productID, quantity } = data;

  try {
    const result = await repository.releaseInventory(orderID, productID);

    const topic = "inventory.released";

    const newdata: sagaDTO = {
      orderID: orderID,
      sagaID: data.sagaID,
      productID: productID,
      quantity: quantity,
      amount: data.amount,
    };

    await producer.send({
      topic,
      messages: [
        {
          key: orderID,
          value: JSON.stringify(newdata),
        },
      ],
    });
    return result;
  } catch (error) {
    console.error("Service release error:", error);
    throw error;
  }
};

export const completeInventory = async (data: sagaDTO) => {
  const { orderID, productID, quantity } = data;

  try {
    const result = await repository.completeInventory(orderID, productID);

    const topic = "inventory.confirmed";

    const newdata: sagaDTO = {
      orderID: orderID,
      sagaID: data.sagaID,
      productID: productID,
      quantity: quantity,
      amount: data.amount,
    };

    await producer.send({
      topic,
      messages: [
        {
          key: orderID,
          value: JSON.stringify(newdata),
        },
      ],
    });
    return result;
  } catch (error) {
    console.error("Service confirm error:", error);
    throw error;
  }
};
