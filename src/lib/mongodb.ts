import mongoose, { Mongoose } from 'mongoose';

// export async function dbConnect(): Promise<typeof mongoose> {
//   try {
//     const conn = await mongoose.connect(
//       process.env.DATABASE_URL as string,
//       {
//         // Use your specific connection options here
//       }
//     );
//     console.log('MongoDB connected');
//     return conn;
//   } catch (e) {
//     if (e instanceof Error) {
//       throw new Error(e.message);
//     } else {
//       throw new Error('An unknown error occurred');
//     }
//   }
// }


declare global {
  // Extending the NodeJS global interface to add caching for mongoose
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

const MONGODB_URI = process.env.DATABASE_URL as string;

if (!MONGODB_URI) {
  throw new Error('Please define the DATABASE_URL environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        // Connection options can be added here, if necessary
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      })
      .then((mongooseInstance) => {
        console.log('MongoDB connected');
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset promise cache on failure
    throw error; // Re-throw to handle elsewhere if needed
  }

  return cached.conn;
}
