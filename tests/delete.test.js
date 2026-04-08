/**
 * @jest-environment jsdom
 */

// Імітуємо глобальні змінні, які використовує твій скрипт
global.API_URL = "http://localhost:3000/api/todos";
let allTasks = [{ _id: "123", title: "Test Task" }];

// Функція deleteTask (копіюємо твою логіку для тесту)
const deleteTask = async (id, taskItem) => {
  const removeElement = () => {
    taskItem.remove(); // Спрощуємо для тесту (без setTimeout)
  };

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (res.ok) {
      allTasks = allTasks.filter((task) => task._id !== id);
      removeElement();
    }
  } catch (err) {
    console.error("Помилка видалення:", err);
  }
};

describe("Тестування видалення завдання (Лабораторна №9)", () => {
  let taskItem;

  beforeEach(() => {
    // Створюємо фейковий DOM-елемент перед кожним тестом
    document.body.innerHTML = `
      <div id="task-list">
        <div class="tasks__item" data-id="123">
          <span class="task__title">Тестове завдання</span>
          <button class="delete-btn">Видалити</button>
        </div>
      </div>
    `;
    taskItem = document.querySelector('.tasks__item');
    
    // Мокаємо (підробляємо) fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Завдання успішно видалено" }),
      })
    );
  });

  test('має видалити елемент з DOM та відправити DELETE запит', async () => {
    const id = "123";

    // Викликаємо функцію видалення
    await deleteTask(id, taskItem);

    // 1. ПЕРЕВІРКА: Чи був викликаний fetch з правильним методом та URL?
    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    // 2. ПЕРЕВІРКА: Чи видалено елемент з документа?
    const deletedElement = document.querySelector('.tasks__item');
    expect(deletedElement).toBeNull();

    // 3. ПЕРЕВІРКА: Чи оновився масив (бізнес-логіка)?
    expect(allTasks.length).toBe(0);
  });
});