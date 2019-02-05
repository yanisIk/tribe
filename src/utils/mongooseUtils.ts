import * as mongoose from "mongoose";
// @ts-ignore
mongoose.Promise = global.Promise;

let db = null;

export const checkAndConnectMongoose = async (): Promise<any> => {
    if (!db) {
      await mongoose.connect(process.env.MONGO_URI, {
        // Buffering means mongoose will queue up operations if it gets
        // disconnected from MongoDB and send them when it reconnects.
        // With serverless, better to fail fast if not connected.
        bufferCommands: false, // Disable mongoose buffering
        bufferMaxEntries: 0, // and MongoDB driver buffering
        useNewUrlParser: true,
      });
      // console.log('CONNECTED TO MONGODB');
      db = mongoose.connection;
      db.on('error', function (error) {
        console.log('Error while connecting to mongodb database:', error);
      });
      db.once('open', function () {
        console.log('Successfully connected to mongodb database');
      });
    }
    return Promise.resolve(db);
} 