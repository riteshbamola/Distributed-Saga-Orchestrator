import { pool } from "./db";

import { OrderStatus, OrderData } from "./types/types";

export const insertOrder = async (data: OrderData) => {
  try {
    const result = await pool.query(
      `
    INSERT INTO orders (user_id, product_id, quantity, amount, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id;
    `,
      [data.user_id, data.product_id, data.quantity, data.amount, data.status],
    );
    return result.rows[0].id;
  } catch (error) {
    console.log("Error Inserting Data");
    throw error;
  }
};

export const showOrders = async () => {
  try {
    const result = await pool.query(
      `
    SELECT * FROM orders;
    `,
    );
    return result.rows;
  } catch (error) {
    console.log("Error Showing Orders");
    throw error;
  }
};

export const getOrdersByUser = async (userId: string) => {
  try {
    const result = await pool.query(
      `
       SELECT * FROM orders WHERE user_id = $1;
      `,
      [userId],
    );
    return result.rows;
  } catch (error) {
    console.log("Error getting orders by user");
    throw error;
  }
};

export const getOrderById = async (orderId: string) => {
  try {
    const result = await pool.query(
      `
       SELECT * FROM orders WHERE id = $1;
      `,
      [orderId],
    );
    return result.rows[0];
  } catch (error) {
    console.log("Error getting order by id");
    throw error;
  }
};

export const deleteOrderById = async (orderID: string) => {
  try {
    const result = await pool.query(
      `
    DELETE FROM orders
    WHERE id = $1
    RETURNING id;
    `,
      [orderID],
    );
    return result.rows[0].id;
  } catch (error) {
    console.log("Error Deleting Order");
    throw error;
  }
};

export const deleteOrders = async () => {
  try {
    const result = await pool.query(
      `
    DELETE FROM orders
    RETURNING id;
    `,
    );
    return result.rows.map((row: any) => row.id);
  } catch (error) {
    console.log("Error Deleting Orders");
    throw error;
  }
};

export const updateOrderStatus = async (
  orderID: string,
  status: OrderStatus,
) => {
  try {
    const result = await pool.query(
      `
    UPDATE orders
    SET status = $2
    WHERE id = $1
    RETURNING id;
    `,
      [orderID, status],
    );
    return result.rows[0].id;
  } catch (error) {
    console.log("Error Updating Order Status");
    throw error;
  }
};
