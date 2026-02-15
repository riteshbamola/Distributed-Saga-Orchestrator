import { pool } from "./db";

export const reserveInventory = async (
  orderId: string,
  productId: string,
  quantity: number,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updateResult = await client.query(
      `
      UPDATE inventory
      SET stock = stock - $1
      WHERE product_id = $2
      AND stock >= $1
      `,
      [quantity, productId],
    );

    if (updateResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { status: "FAILED" };
    }

    await client.query(
      `
      INSERT INTO inventory_reservations (order_id, product_id, quantity, status)
      VALUES ($1, $2, $3, $4)
      `,
      [orderId, productId, quantity, "RESERVED"],
    );

    await client.query("COMMIT");

    return { status: "RESERVED" };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    throw new Error("Inventory reservation failed");
  } finally {
    client.release();
  }
};

export const releaseInventory = async (orderId: string, productId: string) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const reservationResult = await client.query(
      `
      SELECT quantity, status
      FROM inventory_reservations
      WHERE order_id = $1
      AND product_id = $2
      FOR UPDATE
      `,
      [orderId, productId],
    );

    if (reservationResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { status: "ALREADY_RELEASED" };
    }

    const { quantity, status } = reservationResult.rows[0];

    if (status !== "RESERVED") {
      await client.query("ROLLBACK");
      return { status: "ALREADY_RELEASED" };
    }

    await client.query(
      `
      UPDATE inventory
      SET stock = stock + $1
      WHERE product_id = $2
      `,
      [quantity, productId],
    );

    await client.query(
      `
      UPDATE inventory_reservations
      SET status = 'RELEASED'
      WHERE order_id = $1
      AND product_id = $2
      `,
      [orderId, productId],
    );

    await client.query("COMMIT");

    return { status: "RELEASED" };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    throw new Error("Inventory release failed");
  } finally {
    client.release();
  }
};
