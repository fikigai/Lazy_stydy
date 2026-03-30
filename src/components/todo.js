"use strict";

/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║     TODO App - Consolidated Logic Module                       ║
 * ║     All frontend logic for todo management in one file          ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

// ============================================
// API Configuration
// ============================================
const API_URL = "http://localhost:3000/api/todos";

const LIMITS = {
  MAX_TITLE_LENGTH: 100,
  MAX_IN_PROGRESS: 17,
};

// ============================================
// DOM Elements
// ============================================
const form = document.querySelector(".form__body");
const tasksList = document.querySelector(".tasks__list");
const filtersContainer = document.querySelector(".filters__buttons");
const sortContainer = document.querySelector(".sort-controls");

if (!tasksList) {
  console.error("❌ Error: '.tasks__list' element not found in HTML");
}
if (!form) {
  console.warn("⚠️ Warning: '.form__body' element not found in HTML");
}

// ============================================
// State Management
// ============================================
let allTasks = [];
let currentSort = "-createdAt";
let currentFilter = "Всі";

// ============================================
// Utility Functions
// ============================================

/**
 * Escape HTML to prevent XSS attacks
 */
const escapeHTML = (str) => {
  if (!str) return "";
  return str
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Priority display mapping
 */
const priorityMap = {
  Low: "Низький",
  Medium: "Середній",
  High: "Високий",
};

const getPriorityDisplay = (priority) => {
  return priorityMap[priority] || priority;
};

/**
 * Task classes helper
 */
const getTaskClasses = (isCompleted) => {
  const base = "tasks__item task";
  return isCompleted ? `${base} task--completed` : base;
};

/**
 * Check if can add more tasks (in-progress limit)
 */
const checkInProgressLimit = () => {
  const activeTasks = document.querySelectorAll(
    ".tasks__item:not(.task--completed)",
  );
  return activeTasks.length < LIMITS.MAX_IN_PROGRESS;
};

// ============================================
// Filter & Sort Definitions
// ============================================

const FILTER_RULES = {
  Всі: () => true,
  Активні: (isCompleted) => !isCompleted,
  Виконані: (isCompleted) => isCompleted,
};

const SORT_OPTIONS = {
  "Нові першими": "-createdAt",
  "Старі першими": "createdAt",
  "А-Я": "title",
  "Я-А": "-title",
  "Пріоритет: Висока": "-priority",
};

// ============================================
// Rendering Functions
// ============================================

/**
 * Generate HTML for a single task
 */
const createTaskHTML = (task) => {
  const { _id, title, desc, priority, date, completed } = task;
  const isCompleted = !!completed;

  return `
    <li class="${getTaskClasses(isCompleted)}" data-id="${_id}">
      <input class="task__checkbox" type="checkbox" ${isCompleted ? "checked" : ""}>
      <div class="task__content">
        <h3 class="task__title">${escapeHTML(title || "Без назви")}</h3>
        <p class="task__description">${escapeHTML(desc || "")}</p>
        <span class="task__meta">${getPriorityDisplay(priority)} | ${escapeHTML(date)}</span>
      </div>
      <div class="task__actions">
        <button class="task__button task__edit">Редагувати</button>
        <button class="task__button task__button--danger">Видалити</button>
      </div>
    </li>`;
};

const renderTasks = (tasks) => {
  if (!tasksList) return;
  tasksList.innerHTML = tasks.map((task) => createTaskHTML(task)).join("");
};

/**
 * Show error message
 */
const showError = (message) => {
  if (!tasksList) return;
  tasksList.innerHTML = `
    <div class="error-msg">
      <p>${escapeHTML(message)}</p>
    </div>`;
};

// ============================================
// View Update
// ============================================

/**
 * Update view with current filter
 */
const updateView = () => {
  try {
    if (!Array.isArray(allTasks)) {
      throw new Error("allTasks не є масивом");
    }

    const check = FILTER_RULES[currentFilter];

    if (typeof check !== "function") {
      throw new Error(`Фільтр "${currentFilter}" не знайдено`);
    }

    const filteredTasks = allTasks.filter((task) => {
      if (typeof task !== "object" || task === null) {
        console.warn("Некоректне завдання:", task);
        return false;
      }

      return check(task.completed);
    });

    renderTasks(filteredTasks);
  } catch (err) {
    console.error("❌ Помилка в updateView:", err);
    showError("Помилка відображення задач. Спробуйте оновити сторінку.");
  }
};

// ============================================
// API Communication
// ============================================

/**
 *
 * Load all tasks from server
 */
async function loadTasks() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const sortParam = currentSort ? `?sort=${currentSort}` : "";
    const res = await fetch(`${API_URL}${sortParam}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const tasks = await res.json();

    if (!Array.isArray(tasks)) {
      throw new Error("Сервер повернув не масив");
    }

    allTasks = tasks;
    updateView();
  } catch (err) {
    clearTimeout(timeoutId);

    let message = "Невідома помилка";

    if (err.name === "AbortError") {
      message = "Сервер довго відповідає (timeout)";
    } else if (err.name === "TypeError") {
      message = "Немає з'єднання з сервером";
    } else {
      message = err.message;
    }

    console.error("❌", message);
    showError(message);
  }
}

/**
 * Extract task data from form
 */
const getTaskDataFromForm = (form) => ({
  title: form.elements["task"].value.trim(),
  desc: form.elements["desc"].value.trim(),
  priority: form.elements["priority"].value || "Medium",
  date: form.elements["date"].value,
  completed: false,
});

/**
 * Validate task data
 */
const validateTask = (taskData) => {
  const rules = [
    {
      condition: !taskData.title,
      error: "Назва завдання обов'язкова!",
    },
    {
      condition: taskData.title?.length > LIMITS.MAX_TITLE_LENGTH,
      error: `Назва занадто довга (макс. ${LIMITS.MAX_TITLE_LENGTH} симв.)`,
    },
    {
      condition: !checkInProgressLimit(),
      error: `Увага! Не можна мати більше ${LIMITS.MAX_IN_PROGRESS} активних завдань одночасно.`,
    },
  ];

  const failedRule = rules.find((rule) => rule.condition);

  return failedRule ? failedRule.error : null;
};

/**
 * Send task data to server
 */
const sendTaskToServer = async (taskData) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Не вдалося зберегти дані на сервері");
  }
  return await res.json();
};

/**
 * Update task UI after new task created
 */
const updateUIWithNewTask = (newTask) => {
  allTasks.push(newTask);
  updateView();
};

// ============================================
// Event Handlers - Form
// ============================================

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const taskData = getTaskDataFromForm(form);

    const validationError = validateTask(taskData);
    if (validationError) {
      return alert(validationError);
    }

    try {
      const newTask = await sendTaskToServer(taskData);
      updateUIWithNewTask(newTask);
      form.reset();
    } catch (err) {
      alert("Помилка: " + err.message);
    }
  });
}

// ============================================
// Event Handlers - Tasks
// ============================================

/**
 * Delete task
 */
const deleteTask = async (id, target, taskItem) => {
  const removeElement = () => {
    taskItem.style.cssText =
      "transform: translateX(20px); opacity: 0; transition: 0.3s;";
    setTimeout(() => taskItem.remove(), 300);
  };

  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" }).catch(
    (err) => console.error("Помилка видалення:", err),
  );

  if (res?.ok) {
    allTasks = allTasks.filter((task) => task._id !== id);
    removeElement();
  }
};

/**
 * Update task visuals after update
 */
const updateTaskVisuals = (res, id, isCompleted) => {
  if (res?.ok) {
    const task = allTasks.find((t) => t._id === id);
    if (task) task.completed = isCompleted;
    updateView();
  }
};

/**
 * Toggle task completion status
 */
const toggleTaskStatus = async (id, target, taskItem) => {
  const isNowCompleted = target.checked;

  if (!isNowCompleted && !checkInProgressLimit()) {
    target.checked = true;
    return alert("Спочатку завершіть існуючі завдання!");
  }

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: isNowCompleted }),
  }).catch(() => (target.checked = !isNowCompleted));

  updateTaskVisuals(res, id, isNowCompleted);
};

/**
 * Update task title UI
 *
 *
 */
tasksList.addEventListener("click", (e) => {
  const taskItem = e.target.closest(".tasks__item");
  if (!taskItem) return;

  const id = taskItem.dataset.id;

  if (e.target.classList.contains("task__button")) {
    editTask(id, taskItem);
  }
});
const editTask = async (id, taskItem) => {
  const titleEl = taskItem.querySelector(".task__title");
  const currentTitle = titleEl.textContent;

  const newTitle = prompt("Нова назва:", currentTitle)?.trim();

  if (!newTitle || newTitle === currentTitle) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    if (res.ok) {
      const data = await res.json();
      titleEl.textContent = data.title; // миттєве оновлення
    }
  } catch (err) {
    console.error("Помилка:", err);
  }
};

// ============================================
// Event Listener - Tasks List
// ============================================

const CLASS_TO_ACTION = {
  "task__button--danger": deleteTask,
  task__checkbox: toggleTaskStatus,
  task__edit: editTask,
};

if (tasksList) {
  tasksList.addEventListener("click", (e) => {
    const target = e.target;
    const taskItem = target.closest(".tasks__item");

    const actionClass = Object.keys(CLASS_TO_ACTION).find((cls) =>
      target.classList.contains(cls),
    );

    taskItem &&
      actionClass &&
      CLASS_TO_ACTION[actionClass](taskItem.dataset.id, target, taskItem);
  });
}

// ============================================
// Event Handlers - Filtering
// ============================================

if (filtersContainer) {
  filtersContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".filters__button");
    if (!btn) return;

    // Remove active class from previous button
    document
      .querySelector(".filters__button--active")
      ?.classList.remove("filters__button--active");
    btn.classList.add("filters__button--active");

    // Update filter and redraw
    currentFilter = btn.textContent.trim();
    updateView();
  });
}

// ============================================
// Event Handlers - Sorting
// ============================================

/**
 * Initialize sorting buttons
 */
function initSorting() {
  if (!sortContainer) return;

  // Create sort buttons if they don't exist
  if (sortContainer.children.length === 0) {
    Object.entries(SORT_OPTIONS).forEach(([label, value]) => {
      const btn = document.createElement("button");
      btn.className = "sort__button";
      btn.textContent = label;
      btn.dataset.sort = value;

      if (value === currentSort) {
        btn.classList.add("sort__button--active");
      }

      btn.addEventListener("click", async (e) => {
        e.preventDefault();

        // Remove active class from previous button
        document
          .querySelectorAll(".sort__button")
          .forEach((b) => b.classList.remove("sort__button--active"));
        btn.classList.add("sort__button--active");

        // Change sorting and reload
        currentSort = value;
        await loadTasks();
      });

      sortContainer.appendChild(btn);
    });
  }
}

// ============================================
// Initialization
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  initSorting();
});

// Load on page load if DOM already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    initSorting();
  });
} else {
  loadTasks();
  initSorting();
}
