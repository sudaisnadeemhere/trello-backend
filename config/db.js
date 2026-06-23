const mongoose = require('mongoose');
let mongodInstance = null;

const connectDB = async () => {
 const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('MONGO_URI is not defined');
}

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
    return;
  } catch (err) {
    console.error('MongoDB connection failed', err.message);
  }

  // If connection failed and we're not in production, start an in-memory MongoDB
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('Falling back to in-memory MongoDB for development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memUri = mongodInstance.getUri();
      await mongoose.connect(memUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to in-memory MongoDB');
      return;
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB', memErr.message);
      console.error('Continuing without a database. API requests will return errors.');
      return;
    }
  }

  console.error('No MongoDB available. Continuing without a database.');
  return;
};

module.exports = connectDB;
