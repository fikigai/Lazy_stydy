export class TaskService {
  constructor() {
    this.tasks = [];
    this.MAX_IN_PROGRESS = 3;
  }

  /**
   * Створює нове завдання з валідацією бізнес-правил.
   */
  createTask(userId, { title, status = 'Backlog', priority = 'Medium' } = {}) {
    this._validateInput(userId, title);
    
    const userTasks = this._getUserTasks(userId);

    this._checkTitleUniqueness(userTasks, title);
    
    if (status === 'In Progress') {
      this._checkInProgressLimit(userTasks);
    }

    const newTask = {
      id: crypto.randomUUID(), // Сучасний спосіб генерації ID
      title: title.trim(),
      status,
      priority,
      ownerId: userId,
      createdAt: new Date().toISOString()
    };

    this.tasks.push(newTask);
    return newTask;
  }

  // Внутрішні методи (Private-like) для чистоти основного методу
  
  _getUserTasks(userId) {
    return this.tasks.filter(task => task.ownerId === userId);
  }

  _validateInput(userId, title) {
    if (!userId) throw new Error("User ID is required");
    if (!title || title.trim().length < 3) {
      throw new Error("Title must be at least 3 characters long");
    }
  }

  _checkTitleUniqueness(userTasks, title) {
    const isDuplicate = userTasks.some(task => task.title.toLowerCase() === title.toLowerCase());
    if (isDuplicate) {
      throw new Error(`Task with title "${title}" already exists for this user`);
    }
  }

  _checkInProgressLimit(userTasks) {
    const inProgressCount = userTasks.filter(t => t.status === 'In Progress').length;
    if (inProgressCount >= this.MAX_IN_PROGRESS) {
      throw new Error(`Maximum ${this.MAX_IN_PROGRESS} active tasks allowed`);
    }
  }

  deleteTask(taskId, userId, isAdmin = false) {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return false;

    const task = this.tasks[index];
    const isOwner = task.ownerId === userId;

    if (!isOwner && !isAdmin) {
      throw new Error("Forbidden: You don't have permission to delete this task");
    }

    this.tasks.splice(index, 1);
    return true;
  }
}

export const taskService = new TaskService();