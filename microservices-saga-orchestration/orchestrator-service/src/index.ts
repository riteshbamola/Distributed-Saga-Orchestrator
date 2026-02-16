import { connectDB } from "./db";
import { connectKafka, producer } from "./kafka";
const startServer = async () => {
  await connectDB();
  console.log("Db Connected");
  await connectKafka();
  await producer.send({
    topic: "order.created",
    messages: [
      { key: "abc123", value: "Hello Kafka! Testing on order.created" },
    ],
  });

  console.log("Server started");
};
startServer();
