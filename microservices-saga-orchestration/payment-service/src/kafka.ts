import { Kafka } from "kafkajs";
import * as service from "./service";
const kafka = new Kafka({
  clientId: "payment-service",
  brokers: ["localhost:9092"],
});

const admin = kafka.admin();

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "payment-service-group" });

export const connectKafka = async () => {
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({
    topics: ["payment.request", "payment.handshake"],
    fromBeginning: false,
  });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      try {
        switch (topic) {
          case "payment.handshake":
            console.log(
              `Received message from ${topic}: ${message.value?.toString()}`,
            );
            break;

          case "payment.request":
            const data = JSON.parse(message.value?.toString() || "{}");
            await service.createPayment(data);
            break;
        }

        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (Number(message.offset) + 1).toString(),
          },
        ]);
      } catch (error) {
        console.error(
          `Error processing message on topic ${topic}, partition ${partition}: ${error}`,
        );
      }
    },
  });
};
