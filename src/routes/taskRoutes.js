const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Отримуємо модель Task, яку ми зареєстрували в server.js
const Task = mongoose.model("Task");

/**
 * 1. Отримати всі завдання (GET)
 */
router.get("/", async (req, res) => {
  try {
    // Беремо параметр сортування з URL (якщо є) або ставимо за замовчуванням
    const sortParam = req.query.sort || "-createdAt";
    const tasks = await Task.find().sort(sortParam);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Не вдалося завантажити список справ" });
  }
});

/**
 * 2. Додати завдання (POST)
 */
router.post("/", async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: "Помилка при створенні завдання" });
  }
});

/**
 * 3. Оновити завдання (PUT)
 * Відповідає за ЧЕКБОКС (виконано) та РЕДАГУВАННЯ тексту
 */
router.put("/:id", async (req, res) => {
  // ЦЕ ПРИЙДЕ В ТЕРМІНАЛ (NODE.JS)
  console.log("------------------------------------");
  console.log("🔔 Отримано запит PUT на ID:", req.params.id);
  console.log("📦 Тіло запиту (Body):", req.body); 

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    if (!updatedTask) {
      console.log("❌ Завдання не знайдено в базі");
      return res.status(404).json({ error: "Завдання не знайдено" });
    }
    
    console.log("✅ Оновлено в базі:", updatedTask.title);
    res.json(updatedTask);
  } catch (err) {
    console.error("🔥 ПОМИЛКА БАЗИ:", err.message);
    res.status(500).json({ error: "Помилка при оновленні" });
  }
});

/**
 * 4. Видалити завдання (DELETE)
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ error: "Завдання не знайдено" });
    }

    res.json({ message: "Завдання успішно видалено" });
  } catch (err) {
    res.status(500).json({ error: "Помилка при видаленні завдання" });
  }
});

module.exports = router;
