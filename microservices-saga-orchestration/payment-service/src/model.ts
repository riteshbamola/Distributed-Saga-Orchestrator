import { pool } from "./db";

export const createPayment = async (orderId: string, amount: number) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT id, status FROM payments WHERE order_id = $1",
      [orderId],
    );

    if ((existing.rowCount ?? 0) > 0) {
      await client.query("ROLLBACK");
      return existing.rows[0];
    }

    const insertResult = await client.query(
      `
      INSERT INTO payments (order_id, amount, status)
      VALUES ($1, $2, 'PENDING')
      RETURNING id
      `,
      [orderId, amount],
    );

    const paymentId = insertResult.rows[0].id;

    // 3️⃣ Simulate payment result
    const isSuccess = Math.random() > 0.5;

    const finalStatus = isSuccess ? "SUCCESS" : "FAILED";

    await client.query("UPDATE payments SET status = $1 WHERE id = $2", [
      finalStatus,
      paymentId,
    ]);

    await client.query("COMMIT");

    return { id: paymentId, status: finalStatus };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
