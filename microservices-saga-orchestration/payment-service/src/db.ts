import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const connectDB = async () => {
  try {
    await pool.connect();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};
