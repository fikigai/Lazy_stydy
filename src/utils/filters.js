"use strict";

/**
 * Filter and Sorting Logic
 * Manages filter and sort state
 */

export const FILTER_RULES = {
  Всі: () => true,
  Активні: (isCompleted) => !isCompleted,
  Виконані: (isCompleted) => isCompleted,
};

export const SORT_OPTIONS = {
  "Нові першими": "-createdAt",
  "Старі першими": "createdAt",
  "А-Я": "title",
  "Я-А": "-title",
  "Пріоритет: Висока": "-priority",
};

/**
 * Apply frontend filter to tasks
 */
export const applyFilter = (tasks, filterName) => {
  if (!FILTER_RULES[filterName]) {
    console.warn(`Unknown filter: ${filterName}`);
    return tasks;
  }

  const check = FILTER_RULES[filterName];
  return tasks.filter((task) => {
    if (typeof task !== "object" || task === null) {
      return false;
    }
    return check(task.completed);
  });
};

/**
 * Get sort value for API request
 */
export const getSortParam = (sortButtonText) => {
  return SORT_OPTIONS[sortButtonText] || "-createdAt";
};
