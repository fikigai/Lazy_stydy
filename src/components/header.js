'use strict';

const headerTemplate = ` <header class="page__header header">
      <nav class="header__nav nav">
        <a class="header__logo-link" href="index.html">
          <div class="header__logo">
            <div class="hero__icon">🦥</div>
          </div>
        </a>

        <ul class="nav__links">
          <li class="nav__dropdown dropdown">
            <a class="dropdown__item">Навчання ▾</a>

            <ul class="submenu">
              <li class="submenu__item">
                <a href="#submenu" class="submenu__link">Семестр 1 ▸</a>
                <ul class="submenu-nested">
                  <li>
                    <a href="#" class="submenu-nested__link">Архів предметів</a>
                  </li>
                </ul>
              </li>
              <li class="submenu__item">
                <a href="#" class="submenu__link">Семестр 2 ▸</a>
                <ul class="submenu-nested">
                  <li>
                    <a href="#" class="submenu-nested__link">Архів предметів</a>
                  </li>
                </ul>
              </li>
              <li class="submenu__item">
                <a href="#" class="submenu__link">Семестр 3 ▸</a>
                <ul class="submenu-nested">
                  <li>
                    <a href="#" class="submenu-nested__link">Архів предметів</a>
                  </li>
                </ul>
              </li>
              <li class="submenu__item">
                <a href="#" class="submenu__link">Семестр 4 ▸</a>
                <ul class="submenu-nested">
                  <li>
                    <a href="#" class="submenu-nested__link">Архів предметів</a>
                  </li>
                </ul>
              </li>
              <li class="submenu__item">
                <a href="#" class="submenu__link">Семестр 5 ▸</a>
                <ul class="submenu-nested">
                  <li>
                    <a href="#" class="submenu-nested__link">Архів предметів</a>
                  </li>
                </ul>
              </li>

              <li class="submenu__item dropdown-inner">
                <a href="#" class="submenu__link">Семестр 6 ▸</a>
                <ul class="submenu-nested">
                  <li>
                    <a href="qa.html" class="submenu-nested__link"
                      >Якість ПЗ та тестування</a
                    >
                  </li>
                  <li>
                    <a href="#modeling" class="submenu-nested__link"
                      >Моделювання та аналіз ПЗ</a
                    >
                  </li>
                  <li>
                    <a href="#os" class="submenu-nested__link"
                      >Операційні системи</a
                    >
                  </li>
                  <li>
                    <a href="web-programming.html" class="submenu-nested__link"
                      >Програмування для інтернет</a
                    >
                  </li>
                  <li>
                    <a href="#social-movements" class="submenu-nested__link"
                      >Громадські рухи</a
                    >
                  </li>
                  <li>
                    <a href="#evi-prep" class="submenu-nested__link"
                      >Підготовка до ЄВІ</a
                    >
                  </li>
                  <li>
                    <a href="#practice" class="submenu-nested__link"
                      >Технологічна практика</a
                    >
                  </li>
                </ul>
              </li>

              <li class="submenu__item">
                <a href="#" class="submenu__link">Семестр 7 ▸</a>
                <ul class="submenu-nested">
                  <li>
                    <a href="#" class="submenu-nested__link">План навчання</a>
                  </li>
                </ul>
              </li>
              <li class="submenu__item">
                <a href="#" class="submenu__link">Семестр 8 ▸</a>
                <ul class="submenu-nested">
                  <li>
                    <a href="#" class="submenu-nested__link"
                      >Дипломне проектування</a
                    >
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>`;

function injectHeader() {
  const headerContainer = document.getElementById("header-container");
  if (!headerContainer) return;

  headerContainer.innerHTML = headerTemplate;

  // --- 1. Логіка головного дропдауну (Навчання) ---
  const mainDropdownTrigger = headerContainer.querySelector('.dropdown__item');
  const mainSubmenu = headerContainer.querySelector('.submenu');

  if (mainDropdownTrigger && mainSubmenu) {
    mainDropdownTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      mainSubmenu.classList.toggle('submenu--active');
    });
  }

  // --- 2. Логіка вкладених семестрів (Семестр 1, 2...) ---
  const semesterTriggers = headerContainer.querySelectorAll('.submenu__link');

  semesterTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      // Якщо посилання веде на реальну сторінку, даємо перейти. 
      // Якщо це просто "відкривачка" (href="#" або "#submenu"), блокуємо перехід.
      const href = trigger.getAttribute('href');
      if (href === '#' || href.startsWith('#sub')) {
        e.preventDefault();
      }
      
      e.stopPropagation();
      
      const nestedMenu = trigger.nextElementSibling;
      if (nestedMenu && nestedMenu.classList.contains('submenu-nested')) {
        nestedMenu.classList.toggle('submenu-nested--active');
      }
    });
  });

  // --- 3. Закриття меню при кліку будь-де на сторінці ---
  document.addEventListener('click', () => {
    mainSubmenu?.classList.remove('submenu--active');
    headerContainer.querySelectorAll('.submenu-nested--active').forEach(menu => {
      menu.classList.remove('submenu-nested--active');
    });
  });

  // --- 4. Автоматичне підсвічування активного пункту ---
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const allLinks = headerContainer.querySelectorAll('a');

  allLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('nav__link--active'); // Додай стилі для цього класу в SCSS
      
      // Якщо посилання глибоко в меню, автоматично відкриваємо батьківські списки
      let parent = link.closest('.submenu-nested');
      if (parent) parent.classList.add('submenu-nested--active');
      
      let mainParent = link.closest('.submenu');
      if (mainParent) mainParent.classList.add('submenu--active');
    }
  });
}

document.addEventListener("DOMContentLoaded", injectHeader);
