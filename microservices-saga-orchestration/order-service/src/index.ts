import { connectDB } from "./db";
import { connectKafka } from "./kafka";
import { producer } from "./kafka";
const startServer = async () => {
  await connectDB();

  await connectKafka();

  console.log("Order Service Started");

  producer.send({
    topic: "order.handshake",
    messages: [{ value: "Hello, Kafka!" }],
  });
};
startServer();
