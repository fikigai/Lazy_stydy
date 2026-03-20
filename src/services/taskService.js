const Task = require('../models/task');

class TaskService {
  async createTask(userId, taskData) {
    // Бізнес-логіка для Лаби №3 та №8 (тестування)
    const inProgressCount = await Task.countDocuments({ 
      ownerId: userId, 
      status: 'In Progress' 
    });

    if (inProgressCount >= 3 && taskData.status === 'In Progress') {
      throw new Error('Limit reached: Maximum 3 tasks In Progress allowed.');
    }

    const newTask = new Task({ ...taskData, ownerId: userId });
    return await newTask.save();
  }
}

module.exports = new TaskService();