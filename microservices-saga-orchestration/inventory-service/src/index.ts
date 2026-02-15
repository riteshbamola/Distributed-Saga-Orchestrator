import { pool, connectDB } from "./db";
import { connectKafka, producer } from "./kafka";
const startServer = async () => {
  await connectDB();
  const db = await pool.query(`SELECT current_database();`);

  await connectKafka();
  console.log("Kafka fully connected");
  await producer.send({
    topic: "inventory.handshake",
    messages: [
      {
        key: "234",
        value: "Hello Kafka!",
      },
    ],
  });

  console.log("OK");
};

startServer();
