import { pool } from "./db";
import * as repository from "./model";
import { inventoryReserveDTO } from "./types/types";

import { producer } from "./kafka";

export const reserveInventory = async (data: inventoryReserveDTO) => {
  const { order_id, product_id, quantity } = data;

  try {
    const result = await repository.reserveInventory(
      order_id,
      product_id,
      quantity,
    );

    const topic =
      result.status === "RESERVED" ? "inventory.reserved" : "inventory.failed";

    await producer.send({
      topic,
      messages: [
        {
          key: order_id,
          value: JSON.stringify({ order_id, product_id, quantity }),
        },
      ],
    });

    return result;
  } catch (error) {
    console.error("Service reserve error:", error);
    throw error;
  }
};

export const releaseInventory = async (data: inventoryReserveDTO) => {
  const { order_id, product_id, quantity } = data;

  try {
    const result = await repository.releaseInventory(order_id, product_id);

    const topic = "inventory.released";

    await producer.send({
      topic,
      messages: [
        {
          key: order_id,
          value: JSON.stringify({ order_id, product_id, quantity }),
        },
      ],
    });
    return result;
  } catch (error) {
    console.error("Service release error:", error);
    throw error;
  }
};
