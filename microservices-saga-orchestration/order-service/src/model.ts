import { pool } from "./db";

export const insertOrder = async (
  userID: string,
  productID: string,
  quantity: number,
  amount: number,
  status: string,
) => {
  try {
    const result = await pool.query(
      `
    INSERT INTO orders (user_id, product_id, quantity, amount, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id;


    `,
      [userID, productID, quantity, amount, status],
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

export const updateOrder = async (
  orderID: string,
  userID: string,
  productID: string,
  quantity: number,
  amount: number,
  status: string,
) => {
  try {
    const result = await pool.query(
      `
    UPDATE orders
    SET user_id = $2, product_id = $3, quantity = $4, amount = $5, status = $6
    WHERE id = $1
    RETURNING id;
    `,
      [orderID, userID, productID, quantity, amount, status],
    );
    return result.rows[0].id;
  } catch (error) {
    console.log("Error Updating Order");
    throw error;
  }
};

export const deleteOrder = async (orderID: string) => {
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
