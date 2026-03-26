"use strict";

const mongoose = require("mongoose");

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://fikigai_db:J40DJV868RCBOYwk@cluster0.fr03sp5.mongodb.net/todo_app?retryWrites=true&w=majority";

/**
 * Підключення до бази даних
 */
const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ База підключена!");
    return mongoose.connection;
  } catch (err) {
    console.error("❌ Помилка бази:", err.message);
    process.exit(1);
  }
};

/**
 * Відключення від бази даних
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("✅ Відключено від бази");
  } catch (err) {
    console.error("❌ Помилка при відключенні:", err.message);
    process.exit(1);
  }
};

/**
 * Перевірити валідність MongoDB ID
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Отримати статистику бази
 */
const getDBStats = async () => {
  try {
    const db = mongoose.connection;
    const stats = await db.db.stats();
    return stats;
  } catch (err) {
    console.error("Помилка при отриманні статистики:", err.message);
    return null;
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  isValidObjectId,
  getDBStats,
  mongoose,
};
