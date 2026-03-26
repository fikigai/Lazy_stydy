"use strict";

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// ============================================
// Import Routes
// ============================================
const taskRoutes = require("./src/routes/taskRoutes");

// ============================================
// Configuration
// ============================================
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// ============================================
// Middleware
// ============================================
app.use(express.json());
app.use(cors());

// ============================================
// Database Connection
// ============================================
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ База підключена!");
  } catch (err) {
    console.error("❌ Помилка бази:", err.message);
    process.exit(1);
  }
};

// ============================================
// Routes
// ============================================
app.use("/api/todos", taskRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res
    .status(500)
    .json({ error: "Internal Server Error", message: err.message });
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
