/**
 * @jest-environment jsdom
 */

const { deleteTask } = require("../src/components/todo");
global.fetch = jest.fn();

describe("Блочні тести функції deleteTask", () => {
  let taskItem;

  const createMockTaskItem = () => {
    const li = document.createElement("li");
    li.classList.add("tasks__item");
    li.dataset.id = "1";
    li.remove = jest.fn();
    return li;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    global.API_URL = "http://localhost:3000/api/todos";

    global.allTasks = [
      { _id: "1", title: "Task 1" },
      { _id: "2", title: "Task 2" },
    ];

    taskItem = createMockTaskItem();
  });

  test("1. Викликає fetch з DELETE і правильним URL", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    await deleteTask("1", null, taskItem);

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/1`, {
      method: "DELETE",
    });
  });

  test("2. Видаляє задачу з allTasks при успіху", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    await deleteTask("1", null, taskItem);

    expect(global.allTasks.length).toBe(1);
    expect(global.allTasks.find((t) => t._id === "1")).toBeUndefined();
  });

  test("3. Додає анімацію перед видаленням", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    await deleteTask("1", null, taskItem);

    expect(taskItem.style.opacity).toBe("0");
    expect(taskItem.style.transform).toContain("translateX");
  });

  test("4. Не видаляє DOM одразу", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    await deleteTask("1", null, taskItem);

    expect(taskItem.remove).not.toHaveBeenCalled();
  });

  test("5. Видаляє DOM через 300мс", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    await deleteTask("1", null, taskItem);

    jest.advanceTimersByTime(300);

    expect(taskItem.remove).toHaveBeenCalled();
  });

  test("6. Не змінює allTasks якщо 500", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    await deleteTask("1", null, taskItem);

    expect(global.allTasks.length).toBe(2);
  });

  test("7. Логує помилку при network error", async () => {
    console.error = jest.fn();
    fetch.mockRejectedValueOnce(new Error("Network error"));

    await deleteTask("1", null, taskItem);

    expect(console.error).toHaveBeenCalled();
  });

  test("8. Ігнорує якщо ID не знайдено", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    await deleteTask("999", null, taskItem);

    expect(global.allTasks.length).toBe(2);
  });

  test("9. Інші задачі залишаються", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    await deleteTask("1", null, taskItem);

    expect(global.allTasks[0]._id).toBe("2");
  });

  test("10. Працює якщо fetch повернув undefined", async () => {
    fetch.mockResolvedValueOnce(undefined);

    await deleteTask("1", null, taskItem);

    expect(taskItem.remove).not.toHaveBeenCalled();
    expect(global.allTasks.length).toBe(2);
  });
});
