import { connectDB } from "./db";
import { connectKafka, producer } from "./kafka";
import orderRouter from "./routes";
import express from "express";

const app = express();
app.use(express.json());
app.use("/api", orderRouter);

const startServer = async () => {
  try {
    await connectDB();
    await connectKafka();

    console.log("Order Service Started");

    // Test message

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  } catch (error) {
    console.error("Startup error:", error);
  }
};

startServer();
