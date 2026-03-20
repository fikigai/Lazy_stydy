'use strict';

const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Назва завдання обов’язкова"],
      trim: true,
      maxlength: [100, "Назва не може бути довшою за 100 символів"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Backlog", "In Progress", "Done"],
      default: "Backlog",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Завдання не може бути "нічиїм"
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Автоматично додає createdAt та updatedAt
  },
);

// Складений індекс для унікальності назви ТІЛЬКИ для конкретного користувача
TaskSchema.index({ title: 1, ownerId: 1 }, { unique: true });

module.exports = mongoose.model("Task", TaskSchema);
