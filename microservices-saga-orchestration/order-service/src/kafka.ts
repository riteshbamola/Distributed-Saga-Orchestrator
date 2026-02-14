import { Kafka } from "kafkajs";

// ----------------------
// Kafka Setup
// ----------------------

const kafka = new Kafka({
  clientId: "order-service",
  brokers: ["localhost:9092"],
});

export const producer = kafka.producer({
  allowAutoTopicCreation: false,
});

export const consumer = kafka.consumer({
  groupId: "order-service-group",
});

const admin = kafka.admin();

const createTopics = async () => {
  await admin.connect();

  await admin.createTopics({
    topics: [
      { topic: "order.created", numPartitions: 3, replicationFactor: 1 },
      { topic: "order.confirm", numPartitions: 3, replicationFactor: 1 },
      { topic: "order.cancel", numPartitions: 3, replicationFactor: 1 },
      { topic: "order.handshake", numPartitions: 1, replicationFactor: 1 },
    ],
    waitForLeaders: true,
  });

  await admin.disconnect();
};

export const connectKafka = async () => {
  await createTopics();

  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({
    topic: "order.confirm",
    fromBeginning: false,
  });

  await consumer.subscribe({
    topic: "order.cancel",
    fromBeginning: false,
  });

  await consumer.subscribe({
    topic: "order.handshake",
    fromBeginning: false,
  });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const value = message.value?.toString();

        switch (topic) {
          case "order.confirm":
            console.log("Order Confirmed:", value);
            break;

          case "order.cancel":
            console.log("Order Cancelled:", value);
            break;

          case "order.handshake":
            console.log("Handshake:", value);
            break;
        }

        // Commit offset after successful processing
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
