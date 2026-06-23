import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      await mongoose.connect(uri);
      console.log('MongoDB connected');
      return;
    } catch (err) {
      console.error('MongoDB connection failed', err.message);
    }
  } else {
    console.warn('MONGO_URI is not defined. API requests will use the in-memory fallback store.');
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('Falling back to in-memory MongoDB for development...');
      mongodInstance = await MongoMemoryServer.create();
      const memUri = mongodInstance.getUri();
      await mongoose.connect(memUri);
      console.log('Connected to in-memory MongoDB');
      return;
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB', memErr.message);
      console.error('Continuing without a database. API requests will use the in-memory fallback store.');
      return;
    }
  }

  console.error('No MongoDB available. Continuing without a database.');
  return;
};

export default connectDB;
