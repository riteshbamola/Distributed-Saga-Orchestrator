import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "payment-service",
  brokers: ["localhost:9092"],
});

const admin = kafka.admin();

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "payment-service-group" });

const createTopics = async () => {
  try {
    await admin.connect();

    await admin.createTopics({
      topics: [
        { topic: "payment.request", numPartitions: 3, replicationFactor: 1 },
        { topic: "payment.success", numPartitions: 3, replicationFactor: 1 },
        { topic: "payment.failure", numPartitions: 3, replicationFactor: 1 },
        { topic: "payment.handshake", numPartitions: 3, replicationFactor: 1 },
      ],
    });

    await admin.disconnect();
  } catch (error) {
    console.error("Error creating topics:", error);
  }
};

export const connectKafka = async () => {
  await createTopics();
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({
    topics: [
      "payment.request",
      "payment.success",
      "payment.failure",
      "payment.handshake",
    ],
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
