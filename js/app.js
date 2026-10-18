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
  sunMoon: '<path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>',
  bookOpen: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  type: '<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>'
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

/* ---------- Telegram ----------
   Когда приложение открыто внутри Telegram, пользуемся его возможностями.
   В обычном браузере tg есть, но initData пустой: тогда всё работает как сайт. */
const tg = window.Telegram && window.Telegram.WebApp;
const inTG = !!(tg && tg.initData);
const tgCan = version => inTG && tg.isVersionAtLeast(version); // поддерживает ли Telegram у человека эту функцию
const BOT = 'islam_books_demo_bot';

if (inTG) {
  document.body.classList.add('tg');
  tg.ready();
  tg.expand();
}

// Лёгкая вибрация при нажатии (только в Telegram на телефоне)
function haptic(kind = 'light') {
  if (!tgCan('6.1')) return;
  if (kind === 'success') tg.HapticFeedback.notificationOccurred('success');
  else tg.HapticFeedback.impactOccurred(kind);
}

// Красим шапку и низ Telegram в цвет нашего фона, чтобы окно выглядело цельным
function paintTelegramBars() {
  if (!tgCan('6.9')) return;
  const css = getComputedStyle(document.body);
  const color = (document.body.dataset.rt ? css.getPropertyValue('--rb') : css.getPropertyValue('--bg')).trim();
  if (!color) return;
  tg.setHeaderColor(color);
  tg.setBackgroundColor(color);
  if (tgCan('7.10')) tg.setBottomBarColor(color);
}

// Облако Telegram: полка видна на всех устройствах человека
function cloudSave(key, value) {
  if (tgCan('6.9')) tg.CloudStorage.setItem(key, JSON.stringify(value));
}

/* ---------- Книги ---------- */
const BOOKS = window.BOOKS;
const bookById = id => BOOKS.find(b => b.id === Number(id));

// Обложка: настоящая картинка, если есть, иначе обложка-образец
function cover(b) {
  // пока картинка грузится, видна плашка нужного размера; загрузилась: плавно проявляется
  if (b.cover) return `<div class="cover"><img src="${b.cover}" alt="" loading="lazy" onload="this.classList.add('on')"></div>`;
  // длинные названия на обложке-образце делаем мельче, чтобы влезали
  const tf = b.title.length > 75 ? .082 : b.title.length > 55 ? .098 : .12;
  const af = (b.titleAr || '').length > 30 ? .09 : .125;
  return `<div class="cover drawn" style="--c:${b.color};--tf:${tf};--af:${af}">
    <div class="cv-ar">${b.titleAr || ''}</div>
    <div class="cv-t">${b.title}<span class="cv-a">${b.author}</span></div>
  </div>`;
}
// Подпись под названием: автор, а если он не указан, то категория
const byline = b => b.author || b.category;
// Куда ведёт «Читать»: настоящий текст книги, если он есть, иначе экран «Полная книга появится здесь»
const readHref = b => b.text ? `#/text/${b.id}` : `#/read/${b.id}`;
const bookCard = b => `<a class="bcard" href="#/book/${b.id}">${cover(b)}<div class="t">${b.title}</div><div class="a">${byline(b)}</div></a>`;
// Строка книги; sub: подпись под названием (по умолчанию автор)
const rowWith = (b, sub) => `<a class="row" href="#/book/${b.id}">${cover(b)}<div class="tx"><div class="t">${b.title}</div><div class="a">${sub}</div></div></a>`;
const bookRow = b => rowWith(b, byline(b));

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
  const autoDark = inTG ? tg.colorScheme === 'dark' : deviceDark.matches;
  const dark = look === 'dark' || (look === 'auto' && autoDark);
  document.body.dataset.theme = dark ? 'dark' : 'light';
  document.querySelectorAll('[data-look]').forEach(b => b.setAttribute('aria-pressed', b.dataset.look === look));
  paintTelegramBars();
}
deviceDark.addEventListener('change', applyTheme);
if (inTG) tg.onEvent('themeChanged', applyTheme); // человек поменял тему в Telegram

// Выезжающая панель снизу. Одна на всё приложение: в неё кладём то «Оформление», то «На полку»
function openSheet(html) {
  document.getElementById('sheet').innerHTML = html;
  document.body.classList.add('sheet-open');
}
const closeSheet = () => document.body.classList.remove('sheet-open');

function openLookSheet() {
  openSheet(`
    <div class="sheet-h">Оформление</div>
    <div class="looks">
      <button class="look" data-look="auto"><div class="pv pv-auto"></div>Как в Telegram</button>
      <button class="look" data-look="light"><div class="pv pv-light">${icon('sun')}</div>Светлая</button>
      <button class="look" data-look="dark"><div class="pv pv-dark">${icon('moon')}</div>Тёмная</button>
    </div>`);
  applyTheme(); // отметить выбранный вариант
}

/* ---------- Моя полка ----------
   Три списка номеров книг. «Хочу прочитать» и «Прочитано» не бывают вместе. */
const SHELVES = [
  { key: 'fav',  name: 'Избранное',      icon: 'heart' },
  { key: 'want', name: 'Хочу прочитать', icon: 'clock' },
  { key: 'done', name: 'Прочитано',      icon: 'check' }
];
const getShelf = () => ({ fav: [], want: [], done: [], ...store.get('shelf', {}) });
const onShelf = (key, id) => getShelf()[key].includes(id);
const onAnyShelf = id => SHELVES.some(s => onShelf(s.key, id));

// Возвращает true, если книгу добавили (false, если убрали)
function toggleShelf(key, id) {
  const shelf = getShelf();
  const added = !shelf[key].includes(id);
  if (!added) {
    shelf[key] = shelf[key].filter(x => x !== id);
  } else {
    shelf[key].unshift(id); // новые сверху
    const other = { want: 'done', done: 'want' }[key];
    if (other) shelf[other] = shelf[other].filter(x => x !== id);
  }
  store.set('shelf', shelf);
  cloudSave('shelf', shelf);
  return added;
}

// При запуске в Telegram берём полку из облака (вдруг человек добавлял книги на другом устройстве)
function loadShelfFromCloud() {
  if (!tgCan('6.9')) return;
  tg.CloudStorage.getItem('shelf', (err, value) => {
    if (err) return;
    const local = store.get('shelf', null);
    if (!value) { if (local) cloudSave('shelf', local); return; } // в облаке пусто: отправляем туда то, что есть
    if (value === JSON.stringify(local)) return;
    try { store.set('shelf', JSON.parse(value)); } catch (e) { return; }
    // если сейчас открыта полка или книга, перерисуем, чтобы показать свежие отметки
    if (/^#\/(shelf|book)/.test(location.hash)) router();
  });
}

const shelfBtnHTML = id => onAnyShelf(id) ? `${icon('check')}На полке` : `${icon('bookmark')}На полку`;

function openShelfSheet(id) {
  openSheet(`
    <div class="sheet-h">Добавить на полку</div>
    <div class="shelf-opts">${SHELVES.map(s => `
      <button class="shelf-opt" data-shelf="${s.key}" data-id="${id}" aria-pressed="${onShelf(s.key, id)}">
        ${icon(s.icon)}<span>${s.name}</span>${icon('check')}
      </button>`).join('')}
    </div>`);
}

/* ---------- Короткое сообщение внизу («Ссылка скопирована») ---------- */
let toastTimer;
function toast(text) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.append(el); }
  el.textContent = text;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), 2200);
}

// «Поделиться»: ссылка на бота с меткой книги (startapp=book_5). Друг нажмёт и сразу попадёт на эту книгу.
// В Telegram открываем выбор чата, в браузере системное меню или копирование.
async function shareBook(id) {
  const b = bookById(id);
  const url = `https://t.me/${BOT}?startapp=book_${id}`;
  if (inTG) {
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(b.title)}`);
    return;
  }
  if (navigator.share) {
    try { await navigator.share({ title: b.title, text: b.title, url }); } catch (e) {}
    return;
  }
  try { await navigator.clipboard.writeText(url); toast('Ссылка скопирована'); }
  catch (e) { toast('Не получилось скопировать ссылку'); }
}

// «Назад»: если человек пришёл в приложение сразу на эту страницу (по ссылке), ведём на главную
function goBack() {
  if (history.state && history.state.first) location.hash = '#/';
  else history.back();
}

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
    ${reading.map(b => `<a class="cont" href="${readHref(b)}">${cover(b)}<div class="tx">
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
    <div id="home-screen"></div>
  `;
}

// «На экран Домой»: показываем предложение, только если телефон это умеет и значка ещё нет
function mountHome() {
  if (!tgCan('8.0')) return;
  tg.checkHomeScreenStatus(status => {
    const box = document.getElementById('home-screen');
    if (!box || (status !== 'missed' && status !== 'unknown')) return;
    box.innerHTML = `<div class="demo-note home-add">
      ${icon('smartphone')}
      <div><b>Значок на экране телефона</b>
      <p>Библиотека будет открываться в одно касание, как обычное приложение.</p>
      <button class="btn btn-second" data-action="home-screen">Добавить</button></div>
    </div>`;
  });
}
if (inTG) tg.onEvent('homeScreenAdded', () => {
  const box = document.getElementById('home-screen');
  if (box) box.innerHTML = '';
});

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

// Верхняя полоска с кнопкой «Назад» (и, если нужно, кнопкой справа)
const topbar = (right = '') =>
  `<div class="topbar"><button class="btn btn-icon" data-action="back" aria-label="Назад">${icon('back')}</button>${right}</div>`;

// Страница «не нашлось» (например, открыли старую ссылку на книгу, которой нет)
const notFound = (title, text) => `${topbar()}
  <div class="empty"><p class="empty-t">${title}</p><p class="empty-s">${text}</p>
  <a class="btn btn-second empty-btn" href="#/">На главную</a></div>`;

const authorLink = name => `#/author/${encodeURIComponent(name)}`;

// Страница книги
function bookScreen(id) {
  const b = bookById(id);
  if (!b) return notFound('Книга не найдена', 'Возможно, ссылка устарела. Посмотрите другие книги на главной.');

  const similar = BOOKS.filter(x => x.category === b.category && x.id !== b.id);
  return `
    ${topbar(`<button class="btn btn-icon" data-action="share" data-id="${b.id}" aria-label="Поделиться">${icon('share')}</button>`)}
    <div class="bk-cover">${cover(b)}</div>
    <div class="bk-meta">
      <a class="bk-cat" href="#/search/cat/${encodeURIComponent(b.category)}">${b.category}</a>
      ${b.titleAr ? `<span class="bk-ar" lang="ar">${b.titleAr}</span>` : ''}
    </div>
    <h1 class="bk-title">${b.title}</h1>
    ${b.author ? `<a class="bk-author" href="${authorLink(b.author)}">${b.author}</a>` : ''}
    ${b.facts ? `<p class="bk-facts">${b.facts}</p>` : ''}
    <div class="bk-actions">
      <a class="btn btn-main btn-wide" href="${readHref(b)}">${icon('bookOpen')}Читать</a>
      <button class="btn btn-second" data-action="shelf" data-id="${b.id}">${shelfBtnHTML(b.id)}</button>
    </div>
    ${versionNote(b)}
    ${b.description ? `<p class="bk-desc">${b.description}</p>` : `<p class="bk-desc bk-desc-none">Описание появится позже.</p>`}
    ${similar.length ? `
      <div class="sec-h"><h2>Похожие</h2></div>
      <div class="shelf-row">${similar.map(bookCard).join('')}</div>` : ''}
  `;
}

// Плашка «Чистовик / Черновик» (как «Демо-версия» на главной): PDF вычитан, Word может быть с опечатками
function versionNote(b) {
  const from = b.publisher ? ` от <span class="nowrap">${b.publisher}</span>` : '';
  if (b.version === 'clean') return `<div class="demo-note bk-note">${icon('check')}
    <div><b>Чистовик</b><p>Окончательная версия книги${from}.</p></div></div>`;
  if (b.version === 'draft') return `<div class="demo-note bk-note">${icon('info')}
    <div><b>Черновик</b><p>Рабочая версия книги${from}, возможны опечатки.</p></div></div>`;
  return '';
}

// «1 книга / 2 книги / 5 книг»
function booksCount(n) {
  const d = n % 10, dd = n % 100;
  const word = d === 1 && dd !== 11 ? 'книга' : d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? 'книги' : 'книг';
  return `${n} ${word}`;
}

// Страница автора
function authorScreen(name) {
  const books = BOOKS.filter(b => b.author === name);
  if (!books.length) return notFound('Автор не найден', 'Возможно, ссылка устарела. Попробуйте найти книгу через поиск.');
  return `
    ${topbar()}
    <p class="au-label">Автор</p>
    <h1 class="title au-name">${name}</h1>
    <p class="au-count">${booksCount(books.length)} в библиотеке</p>
    <div class="au-list">${books.map(b => rowWith(b, b.category)).join('')}</div>
  `;
}

// Моя полка: вкладки-сегменты и список книг выбранной вкладки
const SHELF_EMPTY = {
  fav:  ['Здесь будут любимые книги', 'Откройте книгу, нажмите «На полку» и выберите «Избранное».'],
  want: ['Здесь будут книги на потом', 'Откройте книгу, нажмите «На полку» и выберите «Хочу прочитать».'],
  done: ['Здесь будут прочитанные книги', 'Откройте книгу, нажмите «На полку» и выберите «Прочитано».']
};

function shelfList(key) {
  const books = getShelf()[key].map(bookById).filter(Boolean);
  if (!books.length) {
    const [t, s] = SHELF_EMPTY[key];
    return `<div class="empty"><p class="empty-t">${t}</p><p class="empty-s">${s}</p>
      <a class="btn btn-second empty-btn" href="#/search">${icon('search')}Найти книгу</a></div>`;
  }
  return `<p class="found">${booksCount(books.length)}</p>${books.map(bookRow).join('')}`;
}

function shelfScreen(tab) {
  const key = tab || store.get('shelfTab', 'fav');
  return `
    <h1 class="title">Моя полка</h1>
    <div class="seg" role="tablist">${SHELVES.map(s =>
      `<button role="tab" data-seg="${s.key}" aria-selected="${s.key === key}">${s.name}</button>`).join('')}
    </div>
    <div id="shelf-list">${shelfList(key)}</div>`;
}

function mountShelf() {
  document.querySelector('.seg').addEventListener('click', e => {
    const b = e.target.closest('[data-seg]');
    if (!b) return;
    const key = b.dataset.seg;
    store.set('shelfTab', key); // в следующий раз откроем ту же вкладку
    document.querySelectorAll('.seg [data-seg]').forEach(x => x.setAttribute('aria-selected', x === b));
    document.getElementById('shelf-list').innerHTML = shelfList(key);
    history.replaceState(history.state, '', `#/shelf/${key}`);
  });
}

/* ---------- Читалка ---------- */

// «Читать» у любой книги: полной книги пока нет, предлагаем посмотреть пробную главу
function readIntroScreen(id) {
  const b = bookById(id);
  if (!b) return notFound('Книга не найдена', 'Возможно, ссылка устарела. Посмотрите другие книги на главной.');
  const S = window.SAMPLE;
  const example = b.id === S.bookId
    ? 'на примере первого хадиса этой книги'
    : `на примере первого хадиса из книги «${S.bookTitle}» имама ан-Навави`;
  return `
    ${topbar()}
    <div class="ri-book">${cover(b)}<div class="tx"><div class="t">${b.title}</div><div class="a">${byline(b)}</div></div></div>
    <h1 class="ri-h">Полная книга появится здесь в будущем, ин ша Аллах</h1>
    <p class="ri-p">Мы готовим удобное чтение прямо в приложении: книжный шрифт, спокойные темы и место, где вы остановились. А пока можно посмотреть, как это будет выглядеть, ${example}.</p>
    <a class="btn btn-main ri-btn" href="#/sample">${icon('bookOpen')}Посмотреть, как будет выглядеть чтение</a>`;
}

// Темы читалки (свои, не зависят от темы приложения) и размер шрифта
const READER_THEMES = [
  { key: 'paper', name: 'Бумага' },
  { key: 'matn',  name: 'Матн' },
  { key: 'white', name: 'Белая' }
];
const FS_MIN = 14, FS_MAX = 26;
let reader = { theme: 'paper', fs: 18, ...store.get('reader', {}) };
// У книг в оригинальном оформлении (например 'bm', Bayt al-Magrifa) свои цвета вместо темы читалки
let readerStyle = null;

function applyReader() {
  document.body.dataset.rt = readerStyle || reader.theme;
  document.body.style.setProperty('--fs', reader.fs + 'px');
  document.querySelectorAll('[data-rtheme]').forEach(b => b.setAttribute('aria-pressed', b.dataset.rtheme === reader.theme));
  const v = document.getElementById('fs-val');
  if (v) v.textContent = reader.fs;
  paintTelegramBars();
}

function sampleScreen() {
  const S = window.SAMPLE;
  return `
    <div class="topbar rd-top">
      <button class="btn btn-icon" data-action="back" aria-label="Назад">${icon('back')}</button>
      <span class="rd-book">${S.bookTitle}</span>
      <button class="btn btn-icon" data-action="rd-panel" aria-label="Шрифт и тема">${icon('type')}</button>
    </div>
    <article class="rd">
      <p class="rd-label">${S.label}</p>
      <div lang="ar" dir="rtl">
        <h1 class="rd-ar-h">${S.arTitle}</h1>
        <p class="rd-ar">${S.arIntro}</p>
        <p class="rd-ar rd-ar-hadith">${S.arHadith}</p>
        <p class="rd-ar rd-src">${S.arSource}</p>
      </div>
      <h2 class="rd-h">${S.ruTitle}</h2>
      <p class="rd-p">${S.ruText}</p>
      <p class="rd-p rd-src">${S.ruSource}</p>
      <p class="rd-foot">${S.source}</p>
      <p class="rd-note">${S.demoNote}</p>
    </article>
    <div class="rd-prog"><span>${S.place}</span><div class="bar"><i id="rd-bar"></i></div><span id="rd-pct">0%</span></div>
    <div class="rd-panel" id="rd-panel">
      <div class="themes">${READER_THEMES.map(t =>
        `<button class="th th-${t.key}" data-rtheme="${t.key}"><i>Аа</i>${t.name}</button>`).join('')}</div>
      <div class="sizes">
        <button data-fs="-1" aria-label="Шрифт меньше" class="fs-s">А</button>
        <span id="fs-val"></span>
        <button data-fs="1" aria-label="Шрифт больше" class="fs-l">А</button>
      </div>
    </div>`;
}

// Прогресс: сколько процентов главы человек пролистал. Запоминаем, чтобы вернуть на то же место
function mountSample() {
  const id = window.SAMPLE.bookId;
  const bar = document.getElementById('rd-bar');
  const pct = document.getElementById('rd-pct');
  const scrollable = () => document.documentElement.scrollHeight - innerHeight;

  function show(p) { bar.style.width = p + '%'; pct.textContent = p + '%'; }
  const current = () => scrollable() > 0 ? Math.min(100, Math.round(scrollY / scrollable() * 100)) : 0;

  let timer;
  function onScroll() {
    const max = scrollable();
    if (max <= 0) return;
    const p = current();
    show(p);
    clearTimeout(timer); // сохраняем, когда человек перестал листать
    timer = setTimeout(() => {
      store.set('progress', { ...store.get('progress', {}), [id]: Math.max(p, 1) });
      store.set('readPos', scrollY / max);
    }, 300);
  }

  let alive = true;
  applyReader();
  // Возвращаем на место, где человек остановился (после загрузки шрифтов, иначе высота текста другая)
  document.fonts.ready.then(() => {
    if (!alive) return; // человек уже ушёл с экрана
    const pos = store.get('readPos', 0);
    if (pos > 0) scrollTo(0, pos * scrollable());
    show(current());
    addEventListener('scroll', onScroll, { passive: true });
  });

  // уборка при уходе с экрана
  return () => {
    alive = false;
    removeEventListener('scroll', onScroll);
    delete document.body.dataset.rt;
    document.body.classList.remove('rd-panel-open');
    paintTelegramBars(); // шапку Telegram снова в цвет приложения
  };
}

/* ---------- Читалка настоящих книг ----------
   Текст книги лежит в отдельном файле (b.text) и грузится, только когда книгу открыли.
   Оформление повторяет оригинал: страницы, шапка с названием и номером, сноски внизу страницы. */
function loadText(b) {
  if (window.TEXTS && window.TEXTS[b.id]) return Promise.resolve(window.TEXTS[b.id]);
  return new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = b.text;
    s.onload = () => ok(window.TEXTS[b.id]);
    s.onerror = fail;
    document.head.appendChild(s);
  });
}

// Переносы слов по правилам русского языка (алгоритм Хмелёва): браузеры на телефонах переносят не всегда,
// а текст по ширине без переносов идёт «дырками». В слово ставим невидимые места для переноса (­)
const HYPHEN_RULES = (() => {
  const a = '[а-яё]', g = '[аеёиоуыэюя]', s = '[бвгджзклмнпрстфхцчшщ]', x = '[йъь]';
  return [`(${x})(${a}${a})`, `(${g})(${g}${a})`, `(${g}${s})(${s}${g})`, `(${s}${g})(${s}${g})`,
    `(${g}${s})(${s}${s}${g})`, `(${g}${s}${s})(${s}${s}${g})`].map(r => new RegExp(r, 'gi'));
})();
function hyphenate(root) {
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = walk.nextNode());) {
    let t = n.nodeValue;
    for (let k = 0; k < 2; k++) HYPHEN_RULES.forEach(r => { t = t.replace(r, '$1­$2'); }); // дважды: соседние слоги
    n.nodeValue = t;
  }
}

// Шапка страницы как в книгах Bayt al-Magrifa: фонарь, название, номер и стрелка
const bmPage = (T, p, n) => `
  <section class="bm-page" data-page="${n}" data-wave="${(n - 1) % 3}">
    <header class="bm-band"><img class="bm-lamp" src="img/bm-lantern.png" alt="">
      <span class="bm-run">${T.running}</span>
      <span class="bm-num">${n}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></span>
    </header>
    <div class="bm-body">
      ${p.blocks.map(([t, html]) => t === 'h' ? `<h2 class="bm-h">${html}</h2>` : `<p class="bm-p${t === 'c' ? ' bm-cont' : ''}">${html}</p>`).join('')}
      ${p.notes.length ? `<ol class="bm-notes">${p.notes.map(([k, html]) => `<li><span>${k}.</span>${html}</li>`).join('')}</ol>` : ''}
    </div>
  </section>`;

function textScreen(id) {
  const b = bookById(id);
  if (!b || !b.text) return notFound('Книга не найдена', 'Возможно, ссылка устарела. Посмотрите другие книги на главной.');
  return `
    <div class="topbar rd-top">
      <button class="btn btn-icon" data-action="back" aria-label="Назад">${icon('back')}</button>
      <span class="rd-book">${b.title}</span>
      <button class="btn btn-icon" data-action="rd-panel" aria-label="Размер шрифта">${icon('type')}</button>
    </div>
    <article id="bk" lang="ru"></article>
    <div class="rd-prog"><span id="rd-place"></span><div class="bar"><i id="rd-bar"></i></div><span id="rd-pct">0%</span></div>
    <div class="rd-panel" id="rd-panel">
      <div class="sizes">
        <button data-fs="-1" aria-label="Шрифт меньше" class="fs-s">А</button>
        <span id="fs-val"></span>
        <button data-fs="1" aria-label="Шрифт больше" class="fs-l">А</button>
      </div>
    </div>`;
}

// Книга с переводом: каждое русское предложение помнит свой арабский оригинал (номер в списке ar)
function trRender(T) {
  const ar = [];
  const sents = list => list.map(([ru, a]) => `<span class="tr-s" data-i="${ar.push(a) - 1}">${ru}</span>`).join(' ');
  const html = `<p class="tr-hint">Нажмите на предложение, чтобы увидеть его по-арабски</p>` +
    T.blocks.map(([kind, list]) => kind === 'h' ? `<h1 class="rd-h tr-h">${sents(list)}</h1>`
      : `<p class="rd-p${kind === 'b' ? ' tr-b' : ''}">${sents(list)}</p>`).join('');
  return { html, ar };
}

// Нажатие на предложение: оно подсвечивается жёлтым, рядом всплывает плашка с арабским.
// Нажатие в любое другое место: плашка уходит, а подсветка гаснет через 2,5 секунды
function mountTranslation(box, ar) {
  const pop = document.createElement('div');
  pop.className = 'tr-pop';
  pop.innerHTML = '<p lang="ar" dir="rtl"></p>';
  document.body.appendChild(pop);
  let open = null;

  function hide() {
    if (!open) return;
    const s = open;
    open = null;
    pop.classList.remove('on');
    s.fade = setTimeout(() => s.classList.remove('on'), 2500);
  }
  function show(s, x) {
    clearTimeout(s.fade);
    s.classList.add('on');
    open = s;
    pop.firstChild.textContent = ar[s.dataset.i];
    const area = box.getBoundingClientRect();
    pop.style.left = area.left + scrollX + 'px';
    pop.style.width = area.width + 'px';
    // Под предложением; если снизу не хватает места (там полоска прогресса), то над ним;
    // если предложение длинное и места нет нигде, плашка встаёт внизу экрана над полоской
    pop.classList.remove('up', 'dock');
    const rects = s.getClientRects(), h = pop.offsetHeight;
    const below = rects[rects.length - 1].bottom + 10, above = rects[0].top - 10 - h;
    const fitsBelow = below + h < innerHeight - 64, fitsAbove = above > 64;
    if (fitsBelow || fitsAbove) {
      pop.style.top = (fitsBelow ? below : above) + scrollY + 'px';
      pop.style.setProperty('--ax', Math.min(Math.max(x - area.left, 24), area.width - 24) + 'px'); // хвостик к месту нажатия
      pop.classList.toggle('up', !fitsBelow);
    } else {
      pop.style.top = '';
      pop.classList.add('dock');
    }
    pop.classList.add('on');
    haptic();
  }
  const onTap = e => {
    const s = e.target.closest('.tr-s');
    const was = open;
    hide();
    if (s && s !== was) show(s, e.clientX);
  };
  document.addEventListener('click', onTap);
  return () => { document.removeEventListener('click', onTap); pop.remove(); };
}

// Показываем книгу, следим за прокруткой: процент, «Стр. N из M», запоминаем место
function mountText(id) {
  const b = bookById(id);
  if (!b || !b.text) return;
  let alive = true, timer, stopTr = null;
  const box = document.getElementById('bk');
  const bar = document.getElementById('rd-bar');
  const pct = document.getElementById('rd-pct');
  const place = document.getElementById('rd-place');
  const scrollable = () => document.documentElement.scrollHeight - innerHeight;
  const current = () => scrollable() > 0 ? Math.min(100, Math.round(scrollY / scrollable() * 100)) : 0;
  let pages = [];

  function show() {
    const p = current();
    bar.style.width = p + '%'; pct.textContent = p + '%';
    if (!pages.length) return; // у книг без страниц (с переводом) только процент
    const n = pages.filter(s => s.getBoundingClientRect().top < innerHeight / 2).length || 1;
    place.textContent = `Стр. ${n} из ${pages.length}`;
  }
  function onScroll() {
    if (scrollable() <= 0) return;
    show();
    clearTimeout(timer); // сохраняем, когда человек перестал листать
    timer = setTimeout(() => {
      store.set('progress', { ...store.get('progress', {}), [id]: Math.max(current(), 1) });
      store.set('textPos', { ...store.get('textPos', {}), [id]: scrollY / scrollable() });
    }, 300);
  }

  readerStyle = 'paper'; // пока книга грузится, фон «Бумага»
  applyReader();
  loadText(b).then(T => {
    if (!alive) return; // человек уже ушёл с экрана
    if (T.style === 'bm') { // оригинальное оформление Bayt al-Magrifa: страницы с шапкой
      readerStyle = 'bm';
      applyReader();
      box.className = 'bm';
      box.innerHTML = T.pages.map((p, i) => bmPage(T, p, i + 1)).join('');
      box.querySelectorAll('.bm-p').forEach(hyphenate);
      pages = [...box.querySelectorAll('.bm-page')];
    } else { // книга с переводом: цвет «Бумага», по нажатию арабский текст предложения
      box.className = 'rd tr';
      const { html, ar } = trRender(T);
      box.innerHTML = html;
      stopTr = mountTranslation(box, ar);
    }
    // Возвращаем на место, где человек остановился (после загрузки шрифтов, иначе высота текста другая)
    document.fonts.ready.then(() => {
      if (!alive) return;
      const pos = store.get('textPos', {})[id] || 0;
      if (pos > 0) scrollTo(0, pos * scrollable());
      show();
      addEventListener('scroll', onScroll, { passive: true });
    });
  }).catch(() => { if (alive) box.innerHTML = '<p class="soon">Не получилось загрузить книгу. Проверьте интернет и откройте её снова.</p>'; });

  // уборка при уходе с экрана
  return () => {
    alive = false;
    removeEventListener('scroll', onScroll);
    if (stopTr) stopTr();
    readerStyle = null;
    delete document.body.dataset.rt;
    document.body.classList.remove('rd-panel-open');
    paintTelegramBars(); // шапку Telegram снова в цвет приложения
  };
}

/* ---------- Маршруты ----------
   Адрес после # говорит, какой экран открыть:
   mount (если есть) запускается после показа экрана.
   #/            главная
   #/search      поиск (#/search/cat/Хадисы: сразу с категорией)
   #/book/1      страница книги №1
   #/author/...  страница автора
   #/shelf       моя полка
   #/read/1      «Полная книга появится здесь» (у книг без текста)
   #/text/1      читалка с настоящим текстом книги */
const ROUTES = [
  { re: /^#?\/?$/,                 tab: 'home',   view: homeScreen, mount: mountHome },
  { re: /^#\/search(?:\/cat\/(.+))?$/, tab: 'search', view: searchScreen, mount: mountSearch },
  { re: /^#\/book\/(\d+)$/,        tab: 'home',   view: bookScreen,   back: true },
  { re: /^#\/author\/(.+)$/,       tab: 'home',   view: authorScreen, back: true },
  { re: /^#\/shelf(?:\/(fav|want|done))?$/, tab: 'shelf', view: shelfScreen, mount: mountShelf },
  { re: /^#\/read\/(\d+)$/,        tab: 'home',   view: readIntroScreen, back: true },
  { re: /^#\/sample$/,             tab: null,     view: sampleScreen, mount: mountSample, back: true },
  { re: /^#\/text\/(\d+)$/,        tab: null,     view: textScreen,   mount: mountText,   back: true }
];
// back: на этом экране показываем кнопку «Назад» (в Telegram это кнопка в его шапке)

function renderTabbar(active) {
  const tab = (href, name, label, key) =>
    `<a class="tab ${active === key ? 'on' : ''}" href="${href}">${icon(name)}${label}</a>`;
  document.getElementById('tabbar').innerHTML = `<div class="tabbar-in">
    ${tab('#/', 'home', 'Главная', 'home')}
    ${tab('#/search', 'search', 'Поиск', 'search')}
    ${tab('#/shelf', 'library', 'Моя полка', 'shelf')}</div>`;
}

let cleanup = null; // что убрать за прошлым экраном (например, слежение за прокруткой в читалке)

function router() {
  if (cleanup) { cleanup(); cleanup = null; }
  let hash = location.hash || '#/';
  let route = ROUTES.find(r => r.re.test(hash));
  // Незнакомый адрес (например, Telegram при запуске дописывает #tgWebAppData=...): открываем главную
  if (!route) {
    hash = '#/';
    route = ROUTES[0];
    history.replaceState(history.state, '', location.pathname + location.search + hash);
  }
  const params = hash.match(route.re).slice(1).map(p => p && decodeURIComponent(p));

  const app = document.getElementById('app');
  app.innerHTML = `<div class="screen-in">${route.view(...params)}</div>`;
  document.getElementById('tabbar').hidden = route.tab === null; // в читалке меню прячем
  renderTabbar(route.tab);
  closeSheet();
  if (tgCan('6.1')) route.back ? tg.BackButton.show() : tg.BackButton.hide();
  window.scrollTo(0, 0);
  if (route.mount) cleanup = route.mount(...params) || null; // «после показа»: оживляем поля ввода и т.п.
}

/* ---------- Нажатия ---------- */
// На что нажимают «с щелчком» (лёгкая вибрация в Telegram)
const TAPPABLE = '.btn, .chip, .tab, .seg button, .look, .th, .sizes button, .bcard, .row, .cont, .search, .bk-author';

document.addEventListener('click', e => {
  const t = e.target;
  if (t.closest(TAPPABLE)) haptic();
  if (t.closest('[data-action="open-look"]')) return openLookSheet();
  if (t.closest('[data-action="home-screen"]')) return tg.addToHomeScreen();
  if (t.closest('#scrim')) return closeSheet();
  if (t.closest('[data-action="back"]')) return goBack();

  // Читалка: панель «Aa» (тема и размер шрифта)
  if (t.closest('[data-action="rd-panel"]')) return document.body.classList.toggle('rd-panel-open');
  const rt = t.closest('[data-rtheme]');
  if (rt) { reader.theme = rt.dataset.rtheme; store.set('reader', reader); return applyReader(); }
  const fs = t.closest('[data-fs]');
  if (fs) {
    reader.fs = Math.min(FS_MAX, Math.max(FS_MIN, reader.fs + Number(fs.dataset.fs)));
    store.set('reader', reader);
    return applyReader();
  }
  if (t.closest('.rd, .bm')) document.body.classList.remove('rd-panel-open'); // нажал на текст: панель прячем

  const share = t.closest('[data-action="share"]');
  if (share) return shareBook(Number(share.dataset.id));

  const shelfBtn = t.closest('[data-action="shelf"]');
  if (shelfBtn) return openShelfSheet(Number(shelfBtn.dataset.id));

  // Выбрали список в панели «На полку»: обновляем панель и кнопку на странице
  const opt = t.closest('[data-shelf]');
  if (opt) {
    const id = Number(opt.dataset.id);
    haptic(toggleShelf(opt.dataset.shelf, id) ? 'success' : 'light');
    openShelfSheet(id);
    const btn = document.querySelector(`[data-action="shelf"][data-id="${id}"]`);
    if (btn) btn.innerHTML = shelfBtnHTML(id);
    return;
  }

  const l = t.closest('[data-look]');
  if (l) { look = l.dataset.look; store.set('look', look); applyTheme(); }
});

/* ---------- Запуск ---------- */
history.replaceState({ first: true }, ''); // метка «отсюда человек вошёл» (для кнопки «Назад»)

// Открыли по ссылке «Поделиться» (startapp=book_5): сразу показываем эту книгу
const startParam = inTG && tg.initDataUnsafe.start_param;
const startBook = /^book_(\d+)$/.exec(startParam || '');
if (startBook) history.replaceState({ first: true }, '', `#/book/${startBook[1]}`);

if (tgCan('6.1')) tg.BackButton.onClick(goBack);
loadShelfFromCloud();
applyTheme();
window.addEventListener('hashchange', router);
router();
