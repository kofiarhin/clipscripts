import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";

const port = Number(process.env.PORT || 5000);

async function start() {
  if (process.env.MONGODB_URI) await mongoose.connect(process.env.MONGODB_URI);
  createApp().listen(port, () => console.log(`ClipScripts API listening on ${port}`));
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
