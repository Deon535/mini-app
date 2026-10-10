/* =========================================================
   «Мозг» приложения: какой экран показать и что делать при нажатиях.
   Данные книг лежат в data/books.js (window.BOOKS, window.CATEGORIES).
   ========================================================= */

/* ---------- Иконки (набор Lucide, линейные) ---------- */
const ICONS = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  library: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
  next: '<path d="m9 18 6-6-6-6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sunMoon: '<path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/>'
};
const icon = name =>
  `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

/* ---------- Память устройства ----------
   Здесь приложение запоминает выбор человека (тему, полку, прогресс).
   try/catch: в некоторых браузерах память бывает выключена, тогда просто не запоминаем. */
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
};

/* ---------- Книги ---------- */
const BOOKS = window.BOOKS;
const bookById = id => BOOKS.find(b => b.id === Number(id));

// Обложка: настоящая картинка, если есть, иначе обложка-образец
function cover(b) {
  if (b.cover) return `<div class="cover"><img src="${b.cover}" alt="" loading="lazy"></div>`;
  return `<div class="cover drawn" style="--c:${b.color}">
    <div class="cv-ar">${b.titleAr || ''}</div>
    <div class="cv-t">${b.title}<span class="cv-a">${b.author}</span></div>
  </div>`;
}
const bookCard = b => `<a class="bcard" href="#/book/${b.id}">${cover(b)}<div class="t">${b.title}</div><div class="a">${b.author}</div></a>`;
const bookRow = b => `<a class="row" href="#/book/${b.id}">${cover(b)}<div class="tx"><div class="t">${b.title}</div><div class="a">${b.author}</div></div></a>`;

/* ---------- Тема оформления ----------
   look: 'auto' (как в Telegram) / 'light' / 'dark'.
   Пока мы в обычном браузере, 'auto' повторяет тему устройства.
   На Этапе 3 здесь будем спрашивать тему у Telegram. */
let look = store.get('look', 'auto');
const deviceDark = matchMedia('(prefers-color-scheme: dark)');

function applyTheme() {
  const dark = look === 'dark' || (look === 'auto' && deviceDark.matches);
  document.body.dataset.theme = dark ? 'dark' : 'light';
  document.querySelectorAll('[data-look]').forEach(b => b.setAttribute('aria-pressed', b.dataset.look === look));
}
deviceDark.addEventListener('change', applyTheme);

function renderSheet() {
  document.getElementById('sheet').innerHTML = `
    <div class="look-h">Оформление</div>
    <div class="looks">
      <button class="look" data-look="auto"><div class="pv pv-auto"></div>Как в Telegram</button>
      <button class="look" data-look="light"><div class="pv pv-light">${icon('sun')}</div>Светлая</button>
      <button class="look" data-look="dark"><div class="pv pv-dark">${icon('moon')}</div>Тёмная</button>
    </div>`;
}
const openSheet = () => document.body.classList.add('sheet-open');
const closeSheet = () => document.body.classList.remove('sheet-open');

/* ---------- Экраны ---------- */

// Главная
function homeScreen() {
  const newest = [...BOOKS].sort((a, b) => b.added.localeCompare(a.added)).slice(0, 10);
  const popular = BOOKS.filter(b => b.popular);
  const starter = BOOKS.filter(b => b.starter);

  // «Продолжить»: книги, которые человек начал читать (появится вместе с читалкой)
  const progress = store.get('progress', {});
  const reading = Object.keys(progress).map(bookById).filter(Boolean);
  const continueBlock = reading.length ? `
    <div class="sec-h"><h2>Продолжить</h2></div>
    ${reading.map(b => `<a class="cont" href="#/read/${b.id}">${cover(b)}<div class="tx">
      <div class="t">${b.title}</div><div class="a">${b.author}</div>
      <div class="bar"><i style="width:${progress[b.id]}%"></i></div>
      <div class="p">Прочитано ${progress[b.id]}%</div></div></a>`).join('')}` : '';

  return `
    <div class="home-head">
      <div><div class="hello">Ассаляму алейкум</div><h1 class="title">Библиотека</h1></div>
      <button class="btn btn-icon" data-action="open-look" aria-label="Оформление">${icon('sunMoon')}</button>
    </div>
    <a class="search" href="#/search">${icon('search')}Название или автор</a>
    ${continueBlock}
    <div class="sec-h"><h2>Категории</h2></div>
    <div class="chips">${window.CATEGORIES.map(c => `<a class="chip" href="#/search/cat/${encodeURIComponent(c)}">${c}</a>`).join('')}</div>
    <div class="sec-h"><h2>Новинки</h2><a href="#/search">Все${icon('next')}</a></div>
    <div class="shelf-row">${newest.map(bookCard).join('')}</div>
    ${popular.length ? `<div class="sec-h"><h2>Популярное</h2></div><div class="shelf-row">${popular.map(bookCard).join('')}</div>` : ''}
    ${starter.length ? `<div class="sec-h"><h2>С чего начать</h2></div>${starter.map(bookRow).join('')}` : ''}
  `;
}

// Временная заглушка для экранов, которые соберём на следующих шагах
const stub = title => `<h1 class="title">${title}</h1><p class="stub">Этот экран соберём на следующем шаге.</p>`;

/* ---------- Маршруты ----------
   Адрес после # говорит, какой экран открыть:
   #/            главная
   #/search      поиск (#/search/cat/Хадисы: сразу с категорией)
   #/book/1      страница книги №1
   #/author/...  страница автора
   #/shelf       моя полка
   #/read/1      читалка */
const ROUTES = [
  { re: /^#?\/?$/,                 tab: 'home',   view: homeScreen },
  { re: /^#\/search(?:\/cat\/(.+))?$/, tab: 'search', view: () => stub('Поиск') },
  { re: /^#\/book\/(\d+)$/,        tab: 'home',   view: () => stub('Книга') },
  { re: /^#\/author\/(.+)$/,       tab: 'home',   view: () => stub('Автор') },
  { re: /^#\/shelf$/,              tab: 'shelf',  view: () => stub('Моя полка') },
  { re: /^#\/read\/(\d+)$/,        tab: null,     view: () => stub('Читалка') }
];

function renderTabbar(active) {
  const tab = (href, name, label, key) =>
    `<a class="tab ${active === key ? 'on' : ''}" href="${href}">${icon(name)}${label}</a>`;
  document.getElementById('tabbar').innerHTML = `<div class="tabbar-in">
    ${tab('#/', 'home', 'Главная', 'home')}
    ${tab('#/search', 'search', 'Поиск', 'search')}
    ${tab('#/shelf', 'library', 'Моя полка', 'shelf')}</div>`;
}

function router() {
  const hash = location.hash || '#/';
  const route = ROUTES.find(r => r.re.test(hash)) || ROUTES[0];
  const params = hash.match(route.re).slice(1).map(p => p && decodeURIComponent(p));

  const app = document.getElementById('app');
  app.innerHTML = `<div class="screen-in">${route.view(...params)}</div>`;
  document.getElementById('tabbar').hidden = route.tab === null; // в читалке меню прячем
  renderTabbar(route.tab);
  closeSheet();
  window.scrollTo(0, 0);
}

/* ---------- Нажатия ---------- */
document.addEventListener('click', e => {
  if (e.target.closest('[data-action="open-look"]')) return openSheet();
  if (e.target.closest('#scrim')) return closeSheet();
  const l = e.target.closest('[data-look]');
  if (l) { look = l.dataset.look; store.set('look', look); applyTheme(); }
});

/* ---------- Запуск ---------- */
renderSheet();
applyTheme();
window.addEventListener('hashchange', router);
router();
