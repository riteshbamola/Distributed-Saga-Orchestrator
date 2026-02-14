import { pool, connectDB } from "./db";

const startServer = async () => {
  await connectDB();
  const db = await pool.query(`SELECT current_database();`);
};

startServer();
