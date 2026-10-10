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
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
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
// Подпись под названием: автор, а если он не указан, то категория
const byline = b => b.author || b.category;
const bookCard = b => `<a class="bcard" href="#/book/${b.id}">${cover(b)}<div class="t">${b.title}</div><div class="a">${byline(b)}</div></a>`;
const bookRow = b => `<a class="row" href="#/book/${b.id}">${cover(b)}<div class="tx"><div class="t">${b.title}</div><div class="a">${byline(b)}</div></div></a>`;

// Заглушка для пустой подборки
const SOON = 'Здесь, ин ша Аллах, появятся книги.';
const soon = (text = SOON) => `<p class="soon">${text}</p>`;

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
  // «Новинки»: только книги с датой, самые свежие первыми
  const newest = BOOKS.filter(b => b.added).sort((a, b) => b.added.localeCompare(a.added)).slice(0, 10);
  const popular = BOOKS.filter(b => b.popular);
  const starter = BOOKS.filter(b => b.starter);

  // «Продолжить»: книги, которые человек начал читать (появится вместе с читалкой)
  const progress = store.get('progress', {});
  const reading = Object.keys(progress).map(bookById).filter(Boolean);
  const continueBlock = reading.length ? `
    <div class="sec-h"><h2>Продолжить</h2></div>
    ${reading.map(b => `<a class="cont" href="#/read/${b.id}">${cover(b)}<div class="tx">
      <div class="t">${b.title}</div><div class="a">${byline(b)}</div>
      <div class="bar"><i style="width:${progress[b.id]}%"></i></div>
      <div class="p">Прочитано ${progress[b.id]}%</div></div></a>`).join('')}` : '';

  return `
    <div class="home-head">
      <div><div class="hello">Ассаляму алейкум</div><h1 class="title">Библиотека</h1></div>
      <button class="btn btn-icon" data-action="open-look" aria-label="Оформление">${icon('sunMoon')}</button>
    </div>
    <a class="search" href="#/search">${icon('search')}Название или автор</a>
    <div class="demo-note">
      ${icon('info')}
      <div><b>Демо-версия</b>
      <p>Это пробная версия приложения. Подборки, категории и описания пока заполнены не полностью и могут быть неточными. Ин ша Аллах, скоро здесь будет вся библиотека канала.</p></div>
    </div>
    ${continueBlock}
    <div class="sec-h"><h2>Категории</h2></div>
    <div class="chips">${window.CATEGORIES.map(c => `<a class="chip" href="#/search/cat/${encodeURIComponent(c)}">${c}</a>`).join('')}</div>
    <div class="sec-h"><h2>С чего начать</h2></div>
    ${starter.length ? starter.map(bookRow).join('') : soon()}
    <div class="sec-h"><h2>Новинки</h2></div>
    ${newest.length ? `<div class="shelf-row">${newest.map(bookCard).join('')}</div>` : soon()}
    <div class="sec-h"><h2>Популярное</h2></div>
    ${popular.length ? `<div class="shelf-row">${popular.map(bookCard).join('')}</div>` : soon()}
    <div class="sec-h"><h2>Все книги</h2><a href="#/search">Смотреть${icon('next')}</a></div>
    <div class="shelf-row">${BOOKS.map(bookCard).join('')}</div>
  `;
}

// Поиск
// Приводим текст к простому виду, чтобы «Ё», «е», дефисы и регистр не мешали искать
const normalize = s => (s || '').toLowerCase().replace(/ё/g, 'е')
  .replace(/[-‐–—«»"'.,:;!?()]/g, ' ').replace(/\s+/g, ' ').trim();

// Защита: текст, который ввёл человек, показываем как текст, а не как код
const escapeHTML = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Для каждой книги заранее готовим строку «где искать»
const SEARCH_INDEX = BOOKS.map(b => ({ book: b, text: normalize([b.title, b.author, b.category, b.titleAr].join(' ')) }));

function findBooks(query, category) {
  const words = normalize(query).split(' ').filter(Boolean);
  return SEARCH_INDEX
    .filter(x => !category || x.book.category === category)
    .filter(x => words.every(w => x.text.includes(w))) // каждое слово запроса должно найтись
    .map(x => x.book)
    .sort((a, b) => a.title.localeCompare(b.title, 'ru'));
}

const RECENT_MAX = 6;
function saveRecent(query) {
  const q = query.trim();
  if (q.length < 2) return;
  const list = store.get('recent', []).filter(x => normalize(x) !== normalize(q));
  store.set('recent', [q, ...list].slice(0, RECENT_MAX));
}

function searchScreen(category) {
  const chips = ['', ...window.CATEGORIES].map(c =>
    `<button class="chip ${c === (category || '') ? 'on' : ''}" data-cat="${c}">${c || 'Все'}</button>`).join('');
  return `
    <h1 class="title">Поиск</h1>
    <label class="search search-field">
      ${icon('search')}
      <input id="q" type="search" placeholder="Название или автор" autocomplete="off" enterkeyhint="search">
      <button class="clear" id="clear" aria-label="Очистить" hidden>${icon('close')}</button>
    </label>
    <div class="chips sr-chips">${chips}</div>
    <div id="results"></div>`;
}

function mountSearch(category) {
  let cat = category || '';
  const input = document.getElementById('q');
  const clearBtn = document.getElementById('clear');
  const results = document.getElementById('results');

  function show() {
    const q = input.value;
    clearBtn.hidden = !q;
    const found = findBooks(q, cat);

    // Ничего не введено и категория не выбрана: недавние запросы + все книги
    if (!q.trim() && !cat) {
      const recent = store.get('recent', []);
      results.innerHTML = `
        ${recent.length ? `<div class="sec-h"><h2>Недавние</h2><button class="link" data-action="clear-recent">Очистить</button></div>
          <div class="recent">${recent.map(r => `<button class="chip" data-recent="${escapeHTML(r)}">${escapeHTML(r)}</button>`).join('')}</div>` : ''}
        <div class="sec-h"><h2>Все книги</h2></div>
        ${found.map(bookRow).join('')}`;
      return;
    }
    // Выбрана категория, в которой пока нет книг
    if (!q.trim() && cat && !found.length) {
      results.innerHTML = `<div class="empty"><p class="empty-t">Пока пусто</p><p class="empty-s">В этой категории, ин ша Аллах, скоро появятся книги.</p></div>`;
      return;
    }
    if (!found.length) {
      results.innerHTML = `<div class="empty">
        <p class="empty-t">Ничего не нашлось</p>
        <p class="empty-s">Проверьте написание или поищите по автору${cat ? ', или уберите категорию' : ''}.</p></div>`;
      return;
    }
    results.innerHTML = `<p class="found">Найдено: ${found.length}</p>${found.map(bookRow).join('')}`;
  }

  input.addEventListener('input', show);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { saveRecent(input.value); input.blur(); } });
  clearBtn.addEventListener('click', e => { e.preventDefault(); input.value = ''; show(); input.focus(); });

  document.querySelector('.sr-chips').addEventListener('click', e => {
    const chip = e.target.closest('[data-cat]');
    if (!chip) return;
    cat = chip.dataset.cat;
    document.querySelectorAll('.sr-chips .chip').forEach(c => c.classList.toggle('on', c === chip));
    // меняем адрес без перерисовки экрана, чтобы «Назад» и ссылка вели в ту же категорию
    history.replaceState(null, '', cat ? `#/search/cat/${encodeURIComponent(cat)}` : '#/search');
    show();
  });

  results.addEventListener('click', e => {
    const r = e.target.closest('[data-recent]');
    if (r) { input.value = r.dataset.recent; show(); return; }
    if (e.target.closest('[data-action="clear-recent"]')) { store.set('recent', []); show(); return; }
    if (e.target.closest('.row')) saveRecent(input.value); // открыл книгу из результатов: запомним запрос
  });

  show();
  if (!cat) input.focus();
}

// Временная заглушка для экранов, которые соберём на следующих шагах
const stub = title => `<h1 class="title">${title}</h1><p class="stub">Этот экран соберём на следующем шаге.</p>`;

/* ---------- Маршруты ----------
   Адрес после # говорит, какой экран открыть:
   mount (если есть) запускается после показа экрана.
   #/            главная
   #/search      поиск (#/search/cat/Хадисы: сразу с категорией)
   #/book/1      страница книги №1
   #/author/...  страница автора
   #/shelf       моя полка
   #/read/1      читалка */
const ROUTES = [
  { re: /^#?\/?$/,                 tab: 'home',   view: homeScreen },
  { re: /^#\/search(?:\/cat\/(.+))?$/, tab: 'search', view: searchScreen, mount: mountSearch },
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
  if (route.mount) route.mount(...params); // «после показа»: оживляем поля ввода и т.п.
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
