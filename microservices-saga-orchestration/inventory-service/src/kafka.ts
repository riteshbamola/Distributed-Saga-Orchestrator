import { Kafka } from "kafkajs";
import * as service from "./service";
const kafka = new Kafka({
  clientId: "inventory-service",
  brokers: ["localhost:9092"],
});

const admin = kafka.admin();

const createTopics = async () => {
  await admin.connect();

  await admin.createTopics({
    topics: [
      { topic: "inventory.reserve", numPartitions: 3, replicationFactor: 1 },
      { topic: "inventory.release", numPartitions: 3, replicationFactor: 1 },
      { topic: "inventory.reserved", numPartitions: 3, replicationFactor: 1 },
      { topic: "inventory.released", numPartitions: 3, replicationFactor: 1 },
      { topic: "inventory.failed", numPartitions: 3, replicationFactor: 1 },
      { topic: "inventory.handshake", numPartitions: 1, replicationFactor: 1 },
    ],
    waitForLeaders: true,
  });

  await admin.disconnect();
};

export const producer = kafka.producer({
  allowAutoTopicCreation: false,
});

export const consumer = kafka.consumer({
  groupId: "inventory-service-group",
});

export const connectKafka = async () => {
  await createTopics();
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({
    topics: ["inventory.reserve", "inventory.release", "inventory.handshake"],
    fromBeginning: false,
  });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      try {
        switch (topic) {
          case "inventory.handshake":
            console.log(
              `Received message from ${topic}: ${message.value?.toString()}`,
            );
            break;

          case "inventory.reserve":
            const data = JSON.parse(message.value?.toString() || "{}");
            await service.reserveInventory(data);
            break;

          case "inventory.release":
            const releaseData = JSON.parse(message.value?.toString() || "{}");
            await service.releaseInventory(releaseData);
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
        console.error("Kafka Processing Error:", error);
      }
    },
  });
};
