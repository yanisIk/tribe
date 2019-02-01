import * as mongoose from "mongoose";
import { mongooseContainer } from "../index";

export const checkAndConnectMongoose = async () => {
    if (mongooseContainer.connection == null) {
        mongooseContainer.connection = await mongoose.createConnection(process.env.MONGO_URI, {
          // Buffering means mongoose will queue up operations if it gets
          // disconnected from MongoDB and send them when it reconnects.
          // With serverless, better to fail fast if not connected.
          bufferCommands: false, // Disable mongoose buffering
          bufferMaxEntries: 0 // and MongoDB driver buffering
        });
      }
} 