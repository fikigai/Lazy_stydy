"use strict";

/**
 * UI Rendering Utilities
 * Handles DOM manipulation and template rendering
 */

const priorityMap = {
  Low: "Низький",
  Medium: "Середній",
  High: "Високий",
};

/**
 * Sanitize HTML to prevent XSS attacks
 */
export const escapeHTML = (str) => {
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
 * Get CSS classes for task item
 */
export const getTaskClasses = (isCompleted) => {
  const base = "tasks__item task";
  return isCompleted ? `${base} task--completed` : base;
};

/**
 * Display priority in Ukrainian
 */
export const getPriorityDisplay = (priority) => {
  return priorityMap[priority] || priority;
};

/**
 * Create HTML string for a single task item
 */
export const createTaskHTML = (task) => {
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

/**
 * Render tasks list to DOM
 */
export const renderTasks = (tasks, containerSelector) => {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error(`Container not found: ${containerSelector}`);
    return;
  }
  container.innerHTML = tasks.map(createTaskHTML).join("");
};

/**
 * Show error message
 */
export const showError = (message, containerSelector) => {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = `
    <div class="error-msg">
      <p>${escapeHTML(message)}</p>
    </div>`;
};
