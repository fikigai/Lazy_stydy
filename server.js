"use strict";

require("dotenv").config({ path: "./.env.server" });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 1. СХЕМА ТА МОДЕЛЬ (МАЄ БУТИ ПЕРШОЮ!)
// ============================================
// Описуємо структуру завдання ПЕРЕД тим, як підключати роути
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, default: "" },
  priority: { type: String, default: "Medium" },
  date: { type: String, default: "" },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Реєструємо модель "Task" у глобальному реєстрі Mongoose
mongoose.model("Task", taskSchema);

// ============================================
// 2. IMPORT ROUTES (ТІЛЬКИ ПІСЛЯ РЕЄСТРАЦІЇ МОДЕЛІ)
// ============================================
const taskRoutes = require("./src/routes/taskRoutes");

// ============================================
// Middleware
// ============================================
app.use(express.json());
app.use(cors());

// ============================================
// Database Connection
// ============================================
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI не знайдено в .env файлі!");
    return; 
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ База підключена!");
  } catch (err) {
    console.error("❌ Помилка бази:", err.message);
    if (process.env.NODE_ENV !== 'production') {
       process.exit(1);
    }
  }
};

// ============================================
// Routes
// ============================================
app.use("/api/todos", taskRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// ============================================
// Start Server
// ============================================
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущений на http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;