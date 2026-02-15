import { connectDB, pool } from "./db";
import { producer, connectKafka } from "./kafka";

const startServer = async () => {
  await connectDB();

  const res = await pool.query(`SELECT current_database();`);
  console.log(res.rows[0].current_database);
  await connectKafka();
  console.log("Kafka connected");

  await producer.send({
    topic: "payment.handshake",
    messages: [
      {
        key: "1234",
        value: "Hello KafkaJS user!",
      },
    ],
  });
  console.log("Ok");
};

startServer();
