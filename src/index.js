"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const mainTrigger = document.querySelector(".dropdown__item");
  const mainMenu = document.querySelector(".submenu");
  const semesterTriggers = document.querySelectorAll(".submenu__link");

  // 1. Клік по "Навчання" (відкрити/закрити список семестрів)
  mainTrigger?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    mainMenu.classList.toggle("submenu--active");
  });

  // 2. Клік по "Семестр 6" (відкрити/закрити список предметів)
  semesterTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      // Знаходимо наступний елемент (це наше вкладене меню)
      const nested = trigger.nextElementSibling;

      if (nested && nested.classList.contains("submenu-nested")) {
        e.preventDefault();
        e.stopPropagation();
        nested.classList.toggle("submenu-nested--active");
      }
    });
  });

  // 3. Закриття всього при кліку "повз" меню
  document.addEventListener("click", () => {
    mainMenu?.classList.remove("submenu--active");
    document.querySelectorAll(".submenu-nested--active").forEach((el) => {
      el.classList.remove("submenu-nested--active");
    });
  });
});
