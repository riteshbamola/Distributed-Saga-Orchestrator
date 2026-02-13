import { connectDB } from "./db.ts";
import { pool } from "./db.ts";
const startServer = async () => {
  await connectDB();
  console.log("Order Service Started");

  // table creation
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
            CREATE TYPE order_status AS ENUM (
                'PENDING',
                'CONFIRMED',
                'CANCELLED'
            );
        END IF;
    END$$;

    CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        product_id UUID NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
        status order_status NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
startServer();
