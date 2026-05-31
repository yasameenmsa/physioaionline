import mongoose from 'mongoose';
import '../models/User';
import '../models/Article';
import '../models/Category';
import '../models/Question';
import '../models/UserProgress';
import '../models/Voucher';
import '../models/WaitlistEntry';
import '../models/ReadingHistory';
import '../models/SavedArticle';
import '../models/PaymentVerification';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = (globalThis as any).mongoose || { conn: null, promise: null };

if (!(globalThis as any).mongoose) {
  (globalThis as any).mongoose = cached;
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function disconnectDB() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
