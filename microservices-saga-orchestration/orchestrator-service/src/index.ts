import { connectDB } from "./db";

const startServer = async () => {
  await connectDB();
};
