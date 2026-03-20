'use strict';

import Task from '../models/task'; // Імпортуємо модель Mongoose

export class TaskService {
  /**
   * Створення завдання (Clean version)
   */
  async createTask(userId, taskData) {
    const { title, status, priority } = taskData;

    // 1. Захисні умови (Guard Clauses)
    if (!userId) throw new Error("User ID is required");
    if (!title) throw new Error("Title is missing");
    if (title.length <= 3) throw new Error("Title too short");

    // 2. Бізнес-логіка (Limit & Uniqueness)
    // Шукаємо завдання цього користувача в БД
    const userTasks = await Task.find({ ownerId: userId });

    if (userTasks.some(t => t.title === title)) {
      throw new Error("QA Error: Task title must be unique for this user!");
    }

    if (status === "In Progress") {
      const inProgressCount = userTasks.filter(t => t.status === "In Progress").length;
      if (inProgressCount >= 3) {
        throw new Error("QA Error: Max 3 tasks 'In Progress' allowed!");
      }
    }

    // 3. Збереження в базу
    const newTask = new Task({
      title,
      status: status || "Backlog",
      priority: priority || "Medium",
      ownerId: userId
    });

    return await newTask.save();
  }

  /**
   * Видалення (Ownership check)
   */
  async deleteTask(taskId, currentUserId, userRole) {
    const task = await Task.findById(taskId);
    
    if (!task) return false;

    // Тільки автор або Адмін
    const isOwner = task.ownerId.toString() === currentUserId.toString();
    const isAdmin = userRole === 'Admin';

    if (!isOwner && !isAdmin) {
      throw new Error("Access Denied: You are not the owner!");
    }

    return await Task.findByIdAndDelete(taskId);
  }
}

export const taskService = new TaskService();