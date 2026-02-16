import { Kafka } from "kafkajs";
import { handleMessage } from "./handlers";
const kafka = new Kafka({
  clientId: "saga-orchestrator",
  brokers: ["localhost:9092"],
});

const admin = kafka.admin();

const createTopics = async () => {
  try {
    await admin.connect();

    await admin.createTopics({
      topics: [
        // order service
        { topic: "order.created", numPartitions: 3, replicationFactor: 1 },
        { topic: "order.cancel", numPartitions: 3, replicationFactor: 1 },
        {topic: "order.confirm",numPartitions: 3, replicationFactor: 1}
        { topic: "order.confirmed", numPartitions: 3, replicationFactor: 1 },
        { topic: "order.cancelled", numPartitions: 3, replicationFactor: 1 },
        { topic: "order.handshake", numPartitions: 1, replicationFactor: 1 },

        //inventory service
        { topic: "inventory.reserve", numPartitions: 3, replicationFactor: 1 },
        { topic: "inventory.release", numPartitions: 3, replicationFactor: 1 },
        { topic: "inventory.complete", numPartitions: 3, replicationFactor: 1 },
        { topic: "inventory.reserved", numPartitions: 3, replicationFactor: 1 },
        { topic: "inventory.released", numPartitions: 3, replicationFactor: 1 },
        { topic: "inventory.completed", numPartitions: 3, replicationFactor: 1 },
        { topic: "inventory.failed", numPartitions: 3, replicationFactor: 1 },
        {
          topic: "inventory.handshake",
          numPartitions: 1,
          replicationFactor: 1,
        },

        //payment service
        { topic: "payment.request", numPartitions: 3, replicationFactor: 1 },
        { topic: "payment.success", numPartitions: 3, replicationFactor: 1 },
        { topic: "payment.failed", numPartitions: 3, replicationFactor: 1 },
        { topic: "payment.handshake", numPartitions: 3, replicationFactor: 1 },
      ],
      waitForLeaders: true,
    });
  } catch (error) {
    console.log("Errror generating topics");
    console.error(error);
  }
  await admin.disconnect();
};

export const producer = kafka.producer({
  allowAutoTopicCreation: false,
});

export const consumer = kafka.consumer({
  groupId: "saga-orchestrator-group",
});

export const connectKafka = async () => {
  await createTopics();

  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({
    topics: [
      "order.created",
      "order.confirmed",
      "order.cancelled",
      "inventory.reserved",
      "inventory.released",
      "inventory.completed",
      "inventory.failed",
      "payment.success",
      "payment.failed",
    ],
    fromBeginning: false,
  });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      try {
        await handleMessage(topic, message);
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
