import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "order-service",
  brokers: ["localhost:9092"],
});

//Producer

export const producer = kafka.producer({
  allowAutoTopicCreation: true,
});

//Consumer

export const consumer = kafka.consumer({
  groupId: "order-service-group",
});

export const connectKafka = async () => {
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
    eachMessage: async ({ topic, message }) => {
      try {
        if (topic == "order.handshake") {
          console.log(message.value?.toString());
        }

        if (topic == "order.confirm") {
          console.log("Order confirmed");
        }

        if (topic == "order.cancel") {
          console.log("Order Canceled");
        }
      } catch (errr) {
        console.error("Kafka Error", errr);
      }
    },
  });
};
