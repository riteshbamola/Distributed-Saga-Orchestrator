import { pool } from "./db";

export const createSaga = async (orderID: string) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      INSERT INTO sagas (order_id, status)
      VALUES ($1, 'CREATED')
      ON CONFLICT (order_id)
      DO UPDATE SET order_id = EXCLUDED.order_id
      RETURNING id, status
      `,
      [orderID],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateSagaStatus = async (id: string, status: string) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      UPDATE sagas
      SET status = $2
      WHERE id = $1
      RETURNING id, status
      `,
      [id, status],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const createSagaSteps = async (
  sagaID: string,
  step: string,
  status: string,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      INSERT INTO saga_steps (saga_id, state, status)
      VALUES ($1, $2, $3)
      RETURNING id, saga_id, step_name
      `,
      [sagaID, step, status],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateSagaStepStatus = async (
  id: string,
  step: string,
  status: string,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      UPDATE saga_steps
      SET status = $2
      WHERE id = $1
      RETURNING id, saga_id, step_name
      `,
      [id, status],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
