import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Рядок підключення зазвичай беремо з .env
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};