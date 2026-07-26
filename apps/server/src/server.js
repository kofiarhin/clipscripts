import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";

const port = Number(process.env.PORT || 5000);

async function start() {
  if (process.env.MONGODB_URI) await mongoose.connect(process.env.MONGODB_URI);

  const server = createApp().listen(port, () => {
    console.log(`ClipScripts API listening on ${port}`);
  });

  async function shutdown(signal) {
    console.log(`${signal} received. Shutting down ClipScripts API.`);
    server.close(async () => {
      if (mongoose.connection.readyState) await mongoose.disconnect();
      process.exit(0);
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
