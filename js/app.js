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
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'
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
const BOT = 'baytalmagrifa_bot';

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
/* Обложка-заглушка (у книг без картинки): всё внизу, как на книжной обложке: название, тонкая черта, автор.
   Размер названия подбирается ступенями (COVER_STEPS) так, чтобы ни одно слово не обрезалось и текст влез: меряем один раз
   на образцовой обложке шириной 200 px (всё на обложке в долях её ширины, поэтому на любом размере выходит так же) и запоминаем. */
const COVER_STEPS = [.14, .125, .11, .1, .09, .08, .072];
const COVER_FIT = {}; // номер книги → { k: ступень, soft: слова с мягкими переносами, any: слово режется где угодно }
let coverRef = null;
const softHyph = t => { for (let n = 0; n < 2; n++) HYPHEN_RULES.forEach(r => { t = t.replace(r, '$1\u00AD$2'); }); return t; };
function fitCover(b) {
  if (COVER_FIT[b.id]) return COVER_FIT[b.id];
  if (!(document.fonts && document.fonts.check('700 16px Alegreya') && document.fonts.check('500 12px Onest'))) return null; // шрифты ещё не приехали: меряем позже
  if (!coverRef) { coverRef = document.createElement('div'); coverRef.style.cssText = 'position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none'; document.body.appendChild(coverRef); }
  coverRef.innerHTML = coverHTML(b, .1, false);
  const c = coverRef.firstChild, t = c.querySelector('.cv-t'), a = c.querySelector('.cv-a'), W = 200;
  c.style.setProperty('--cw', W + 'px');
  const cs = getComputedStyle(c), room = c.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - a.offsetHeight - parseFloat(getComputedStyle(a).marginTop);
  const bad = () => t.scrollWidth > t.clientWidth + .5 || t.offsetHeight > room;
  const run = from => { for (const k of COVER_STEPS) if (k <= from) { t.style.fontSize = W * k + 'px'; if (!bad()) return k; } return 0; };
  let k = run(.14), soft = false, any = false;
  if (!k) { t.innerHTML = softHyph(b.title); soft = true; k = run(.115); }
  if (!k) { any = true; k = COVER_STEPS[COVER_STEPS.length - 1]; }
  return (COVER_FIT[b.id] = { k, soft, any });
}
const coverHTML = (b, k, soft, any) => `<div class="cover drawn${k === null ? ' unfit' : ''}"${any ? ' data-any="1"' : ''} data-id="${b.id}" style="--c:${b.color};--tk:${k === null ? .1 : k}"><div class="cv-t" lang="ru">${soft ? softHyph(b.title) : b.title}</div><div class="cv-a">${b.author || ''}</div></div>`;
function cover(b) {
  // пока картинка грузится, видна плашка нужного размера; загрузилась: плавно проявляется
  if (b.cover) return `<div class="cover"><img src="${b.cover}" alt="" loading="lazy" onload="this.classList.add('on')"></div>`;
  const f = fitCover(b);
  return f ? coverHTML(b, f.k, f.soft, f.any) : coverHTML(b, null);
}
// шрифты приехали: обложки, нарисованные до этого с запасным размером, подгоняем заново
function refitCovers() {
  document.querySelectorAll('.cover.unfit').forEach(c => {
    const b = bookById(c.dataset.id), f = b && fitCover(b); if (!f) return;
    const t = c.querySelector('.cv-t'); t.innerHTML = f.soft ? softHyph(b.title) : b.title;
    c.style.setProperty('--tk', f.k); if (f.any) c.dataset.any = '1'; c.classList.remove('unfit');
  });
}
if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('700 16px Alegreya', 'Аа'), document.fonts.load('500 12px Onest', 'Аа')]).then(() => { refitCovers(); }).catch(() => {});
// Подпись под названием: автор, а если он не указан, то категория
const byline = b => b.author || b.category;
// Куда ведёт «Читать»: настоящий текст книги, если он есть, иначе экран «Полная книга появится здесь»
const readHref = b => b.text ? `#/text/${b.id}` : `#/read/${b.id}`;
const bookCard = b => `<a class="bcard" href="#/book/${b.id}">${cover(b)}<div class="t">${b.title}</div><div class="a">${byline(b)}</div></a>`;
// Строка книги; sub: подпись под названием (по умолчанию автор)
const rowWith = (b, sub, tag = '') => `<a class="row" href="#/book/${b.id}">${cover(b)}<div class="tx"><div class="t">${b.title}</div><div class="a">${sub}</div>${tag}</div></a>`;
// в списках у книг с параллельным переводом маленькая пометка (иначе две «Разъяснения условий молитвы» одного автора не отличить)
const bookRow = b => rowWith(b, byline(b), b.parallel ? '<span class="par-tag">параллельный перевод</span>' : '');

// Заглушка для пустой подборки
const SOON = 'Здесь, ин ша Аллах, появятся книги.';
const soon = (text = SOON) => `<p class="soon">${text}</p>`;

/* ---------- Тема оформления ----------
   look: 'auto' (как в Telegram) / 'light' / 'dark'.
   Пока мы в обычном браузере, 'auto' повторяет тему устройства.
   На Этапе 3 здесь будем спрашивать тему у Telegram. */
let look = store.get('look', 'light'); // по умолчанию светлая; «как в Telegram» человек выбирает сам
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

/* ---------- «Читаю»: книги, которые человек начал ----------
   Книга попадает в список, когда прочитано хотя бы 2% или книга открыта около минуты (случайное открытие не считается).
   Порядок: свежие сверху, пока человек сам ничего не переставлял (readingManual); после ручной перестановки порядок его.
   Дочитал до самого конца: книга уходит из «Читаю» в «Прочитано». */
const READ_MIN_PCT = 2, READ_MIN_MS = 60000;
function getReading() {
  let list = store.get('reading', null);
  if (!Array.isArray(list)) { // первый запуск после обновления: берём книги, где уже накопилось 2% и больше
    const pr = store.get('progress', {});
    list = Object.keys(pr).filter(k => pr[k] >= READ_MIN_PCT).map(Number);
    store.set('reading', list);
  }
  return [...new Set(list.map(Number))].filter(id => bookById(id)); // номера всегда числами, без повторов
}
function noteReading(id, pct, since, atEnd) {
  id = Number(id); // из адреса номер приходит текстом
  if (atEnd) { // дочитал до последней страницы
    store.set('reading', getReading().filter(x => x !== id));
    if (!onShelf('done', id)) toggleShelf('done', id);
    const tp = store.get('textPos', {}); delete tp[id]; store.set('textPos', tp); // в следующий раз откроется с начала
    const pr = store.get('progress', {}); delete pr[id]; store.set('progress', pr);
    return;
  }
  if (pct < READ_MIN_PCT && Date.now() - since < READ_MIN_MS) return;
  const list = getReading(), at = list.indexOf(id);
  if (at === 0 || (at > 0 && store.get('readingManual', false))) return;
  if (at > 0) list.splice(at, 1);
  list.unshift(id);
  store.set('reading', list);
}
function unread(id) { // «Убрать из списка»
  store.set('reading', getReading().filter(x => x !== id));
  const pr = store.get('progress', {}); delete pr[id]; store.set('progress', pr);
}
function restartBook(id) { // «Читать с начала»
  unread(id);
  const tp = store.get('textPos', {}); delete tp[id]; store.set('textPos', tp);
}
function reorderReading(visibleIds) { // человек переставил книги: показанные встают впереди в его порядке
  store.set('reading', [...visibleIds, ...getReading().filter(x => !visibleIds.includes(x))]);
  store.set('readingManual', true);
}
function openReadingMenu(id) {
  const b = bookById(id);
  openSheet(`
    <div class="sheet-h">${b.title}</div>
    <div class="shelf-opts"><button class="shelf-opt" data-action="unread" data-id="${id}">${icon('close')}<span>Убрать из списка «Читаю»</span></button></div>`);
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
function toast(text, ms = 2200) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.append(el); }
  el.textContent = text;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), ms);
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

// «Поделиться приложением» (вкладка «Ещё»): то же, но ссылка ведёт на само приложение
async function shareApp() {
  const url = `https://t.me/${BOT}?startapp=app`, text = 'Библиотека исламских книг на русском языке';
  if (inTG) {
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
    return;
  }
  if (navigator.share) {
    try { await navigator.share({ title: text, text, url }); } catch (e) {}
    return;
  }
  try { await navigator.clipboard.writeText(url); toast('Ссылка скопирована'); }
  catch (e) { toast('Не получилось скопировать ссылку'); }
}

// «Назад»: если человек пришёл в приложение сразу на эту страницу (по ссылке), ведём на главную
function goBack() {
  if (closeScan()) return; // открыто окно приближения скана: «Назад» закрывает его
  if (history.state && history.state.first) location.hash = '#/';
  else history.back();
}

/* ---------- Перестановка зажатием ----------
   Зажал книгу (~0,4 с): она «поднимается» и едет за пальцем, остальные плавно расступаются.
   Отпустил: книга встаёт на новое место (onMove получает новый порядок номеров).
   Зажал и не двигал: onMenu (меню «Убрать из списка»). Обычное касание работает как раньше (ссылка).
   Элементы списка: прямые дети box с классом .ro и data-id. Вернуть функцию «отключить». */
function mountReorder(box, onMove, onMenu) {
  let st = null, lastY = 0, raf = 0, eatClick = 0;
  const items = () => [...box.children].filter(e => e.classList.contains('ro'));
  const clean = () => { clearTimeout(st && st.timer); cancelAnimationFrame(raf); raf = 0; box.classList.remove('ro-on'); box.querySelectorAll('.ro').forEach(e => { e.classList.remove('ro-drag'); e.style.transform = ''; e.style.transition = ''; }); st = null; };
  function frame() {
    raf = 0;
    if (!st || !st.active) return;
    if (lastY < 90) scrollBy(0, -9); else if (lastY > innerHeight - 110) scrollBy(0, 9);
    const dy = lastY + scrollY - st.pageY0;
    const { list, hs, tops, from } = st, gap = list.length > 1 ? tops[1] - tops[0] - hs[0] : 0, slot = hs[from] + gap;
    st.el.style.transform = `translateY(${dy}px) scale(1.025)`;
    const mid = tops[from] + hs[from] / 2 + dy;
    let to = 0;
    list.forEach((e, i) => { if (i !== from && tops[i] + hs[i] / 2 < mid) to += 1; });
    st.to = to;
    list.forEach((e, i) => {
      if (i === from) return;
      const s = from < to && i > from && i <= to ? -slot : from > to && i < from && i >= to ? slot : 0;
      e.style.transform = s ? `translateY(${s}px)` : '';
    });
    raf = requestAnimationFrame(frame);
  }
  function lift() {
    if (!st) return;
    st.active = true;
    const list = items();
    Object.assign(st, { list, from: list.indexOf(st.el), tops: list.map(e => e.offsetTop), hs: list.map(e => e.offsetHeight) });
    st.to = st.from; st.pageY0 = st.y0 + scrollY;
    box.classList.add('ro-on'); st.el.classList.add('ro-drag');
    list.forEach(e => { if (e !== st.el) e.style.transition = 'transform .22s cubic-bezier(.2,.8,.2,1)'; });
    haptic('medium');
    raf = requestAnimationFrame(frame);
  }
  const down = e => {
    const el = e.target.closest('.ro');
    if (!el || (e.pointerType === 'mouse' && e.button !== 0)) return;
    st = { el, y0: e.clientY, x0: e.clientX, active: false };
    lastY = e.clientY;
    st.timer = setTimeout(lift, 380);
  };
  const move = e => {
    if (!st) return;
    lastY = e.clientY;
    if (!st.active && Math.hypot(e.clientX - st.x0, e.clientY - st.y0) > 9) clean(); // человек листает, а не зажимает
  };
  const up = () => {
    if (!st) return;
    if (!st.active) return clean();
    eatClick = Date.now(); // после зажатия «щелчок» по ссылке не должен открывать книгу
    const { list, from, to, tops, hs, el } = st, moved = Math.abs(lastY + scrollY - st.pageY0) > 12 || from !== to;
    cancelAnimationFrame(raf);
    const id = Number(el.dataset.id);
    if (!moved) { clean(); return onMenu && onMenu(id); }
    const gap = list.length > 1 ? tops[1] - tops[0] - hs[0] : 0;
    let target = 0; // на сколько сместиться, чтобы встать в слот
    if (to > from) for (let i = from + 1; i <= to; i++) target += hs[i] + gap; else for (let i = to; i < from; i++) target -= hs[i] + gap;
    el.style.transition = 'transform .2s cubic-bezier(.2,.8,.2,1)';
    el.style.transform = `translateY(${target}px)`;
    const ids = list.map(x => Number(x.dataset.id)); ids.splice(to, 0, ids.splice(from, 1)[0]);
    const s = st; st = null;
    setTimeout(() => { clearTimeout(s.timer); box.classList.remove('ro-on'); onMove(ids); }, 210);
  };
  const stopTouch = e => { if (st && st.active) e.preventDefault(); }; // пока книга «в руке», страница не листается
  const noClick = e => { if (Date.now() - eatClick < 500) { e.preventDefault(); e.stopPropagation(); } };
  const noMenu = e => e.preventDefault();
  box.addEventListener('pointerdown', down);
  addEventListener('pointermove', move);
  addEventListener('pointerup', up);
  addEventListener('pointercancel', clean);
  box.addEventListener('touchmove', stopTouch, { passive: false });
  box.addEventListener('click', noClick, true);
  box.addEventListener('contextmenu', noMenu);
  box.addEventListener('dragstart', noMenu);
  return () => {
    clean();
    removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', clean);
  };
}

/* ---------- Экраны ---------- */

// «С чего начать»: книги с номером starter (1, 2, 3…), по порядку; на главной первые START_HOME, остальные на экране #/start
const START_HOME = 6;
const startList = () => BOOKS.filter(b => b.starter).sort((a, b) => a.starter - b.starter);
function startScreen() {
  const list = startList();
  return `
    ${topbar()}
    <h1 class="title">С чего начать</h1>
    <p class="found">${booksCount(list.length)} по порядку: от самого простого к следующим шагам</p>
    ${list.map(bookRow).join('')}`;
}

// Главная
function homeScreen() {
  const starter = startList();

  // «Продолжить»: две последние начатые книги (список «Читаю»); если их больше, ссылка на всю вкладку на полке
  const progress = store.get('progress', {});
  const reading = getReading().map(bookById).filter(Boolean);
  const continueBlock = reading.length ? `
    <div class="sec-h"><h2>Продолжить</h2>${reading.length > 2 ? `<a href="#/shelf/reading">Все, что я читаю (${reading.length})${icon('next')}</a>` : ''}</div>
    <div class="ro-list" id="ro-home">${reading.slice(0, 2).map(b => `<a class="cont ro" data-id="${b.id}" href="${readHref(b)}">${cover(b)}<div class="tx">
      <div class="t">${b.title}</div><div class="a">${byline(b)}</div>
      <div class="bar"><i style="width:${progress[b.id] || 0}%"></i></div>
      <div class="p">Прочитано ${progress[b.id] || 0}%</div></div></a>`).join('')}</div>` : '';

  return `
    <div class="home-head">
      <div><div class="hello">Ассаляму алейкум</div><h1 class="title title-logo">Библиотека<span class="emblem" aria-hidden="true"></span></h1></div>
      <div class="head-btns">
        ${canAddToHome() ? `<button class="btn btn-icon" data-action="add-home" aria-label="Добавить на экран «Домой»">${icon('smartphone')}</button>` : ''}
        <button class="btn btn-icon" data-action="open-look" aria-label="Оформление">${icon('sunMoon')}</button>
      </div>
    </div>
    <a class="search" href="#/search">${icon('search')}Название или автор</a>
    ${continueBlock}
    <div class="sec-h"><h2>Категории</h2></div>
    <div class="chips">${window.CATEGORIES.map(c => `<a class="chip" href="#/search/cat/${encodeURIComponent(c)}">${c}</a>`).join('')}</div>
    ${starter.length ? `<div class="sec-h"><h2>С чего начать</h2>${starter.length > START_HOME ? `<a href="#/start">Все ${starter.length}${icon('next')}</a>` : ''}</div>${starter.slice(0, START_HOME).map(bookRow).join('')}` : ''}
    <div class="sec-h"><h2>Все книги</h2></div>
    <div class="book-grid">${BOOKS.slice(0, 9).map(bookCard).join('')}</div>
    <a class="btn btn-second btn-wide all-books" href="#/search">Все книги (${BOOKS.length})${icon('next')}</a>
  `;
}

function mountHome() {
  const ro = document.getElementById('ro-home');
  return ro ? mountReorder(ro, ids => { reorderReading(ids); router(); }, openReadingMenu) : null;
}

/* ---------- Веб-приложение: «На экран Домой» ----------
   Не ярлык Telegram, а настоящее веб-приложение: человек открывает сайт в браузере телефона
   и добавляет его на экран «Домой». Дальше оно открывается само, без Telegram (manifest.webmanifest + значки в img/app). */
const isInstalled = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; // уже запущено с экрана «Домой»
// iPhone или Android: в Telegram по его данным, в обычном браузере по типу устройства; на компьютере null
function phoneOS() {
  const p = inTG ? tg.platform : '';
  if (p === 'ios') return 'ios';
  if (p === 'android' || p === 'android_x') return 'android';
  if (inTG && p !== 'weba' && p !== 'webk' && p !== 'web') return null; // Telegram на компьютере
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return null;
}
const canAddToHome = () => !isInstalled() && phoneOS() !== null;

const HOME_STEPS = {
  ios: ['Внизу экрана нажмите «Поделиться»', 'Выберите «На экран “Домой”»'],
  android: ['Вверху справа нажмите три точки', 'Выберите «Добавить на главный экран»']
};
function openHomeSheet() {
  const os = phoneOS() || 'ios';
  // в Telegram первым шагом «Открыть» (страница откроется в браузере); если мы уже в браузере, этот шаг не нужен
  const steps = inTG ? ['Нажмите «Открыть»: страница откроется в браузере', ...HOME_STEPS[os]] : HOME_STEPS[os];
  openSheet(`
    <div class="sheet-h">Добавить на экран «Домой»</div>
    <div class="sheet-sub">Приложение будет открываться как обычное, без Telegram.</div>
    <ol class="steps">${steps.map(s => `<li>${s}</li>`).join('')}</ol>
    <button class="btn btn-main sheet-go" data-action="${inTG ? 'open-web' : 'close-sheet'}">${inTG ? 'Открыть' : 'Понятно'}</button>`);
}

// Поиск
// Приводим текст к простому виду, чтобы «Ё», «е», дефисы и регистр не мешали искать
const normalize = s => (s || '').toLowerCase().replace(/ё/g, 'е')
  .replace(/[-‐–—«»"'.,:;!?()]/g, ' ').replace(/\s+/g, ' ').trim();

// Защита: текст, который ввёл человек, показываем как текст, а не как код
const escapeHTML = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Для каждой книги заранее готовим строку «где искать»
const SEARCH_INDEX = BOOKS.map(b => ({ book: b, text: normalize([b.title, b.sub, b.author, b.category, b.titleAr].join(' ')) }));

function findBooks(query, category) {
  const words = normalize(query).split(' ').filter(Boolean);
  return SEARCH_INDEX
    .filter(x => !category || x.book.category === category)
    .filter(x => words.every(w => x.text.includes(w))) // каждое слово запроса должно найтись
    .map(x => x.book)
    .sort(store.get('sort', 'title') === 'author'
      ? (a, b) => (a.author ? 0 : 1) - (b.author ? 0 : 1) || (a.author || '').localeCompare(b.author || '', 'ru') || a.title.localeCompare(b.title, 'ru')
      : (a, b) => a.title.localeCompare(b.title, 'ru'));
}
// «122 книги» и выбор порядка (по названию / по автору)
const sortHead = n => `<div class="sr-head"><span class="found">${booksCount(n)}</span>
  <select id="sort" aria-label="Порядок книг"><option value="title">По названию</option><option value="author">По автору</option></select></div>`;

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
        ${sortHead(found.length)}${found.map(bookRow).join('')}`;
      return pickSort();
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
    results.innerHTML = `${sortHead(found.length)}${found.map(bookRow).join('')}`;
    pickSort();
  }
  function pickSort() { const sel = document.getElementById('sort'); if (sel) sel.value = store.get('sort', 'title'); }

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

  results.addEventListener('change', e => { if (e.target.id === 'sort') { store.set('sort', e.target.value); show(); } });
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
  const going = b.text && getReading().includes(b.id), pr = store.get('progress', {})[b.id] || 0;
  return `
    ${topbar(`<button class="btn btn-icon" data-action="share" data-id="${b.id}" aria-label="Поделиться">${icon('share')}</button>`)}
    <div class="bk-cover">${cover(b)}</div>
    <div class="bk-meta">
      <a class="bk-cat" href="#/search/cat/${encodeURIComponent(b.category)}">${b.category}</a>
    </div>
    <h1 class="bk-title">${b.title}</h1>
    ${b.sub ? `<p class="bk-sub">${b.sub}</p>` : ''}
    ${b.author ? `<a class="bk-author" href="${authorLink(b.author)}">${b.author}</a>` : ''}
    ${b.facts ? `<p class="bk-facts">${b.facts}</p>` : ''}
    <div class="bk-actions">
      <a class="btn btn-main btn-wide" href="${readHref(b)}">${icon('bookOpen')}${going ? `Продолжить · ${pr}%` : 'Читать'}</a>
      <button class="btn btn-second" data-action="shelf" data-id="${b.id}">${shelfBtnHTML(b.id)}</button>
    </div>
    ${going ? `<button class="link restart" data-action="restart" data-id="${b.id}">Читать с начала</button>` : ''}
    ${versionNote(b)}
    ${b.description ? `<p class="bk-desc">${b.description}</p>` : ''}
    ${similar.length ? `
      <div class="sec-h"><h2>Похожие</h2></div>
      <div class="shelf-row">${similar.map(bookCard).join('')}</div>` : ''}
  `;
}

// Плашка «Чистовик / Черновик» (как «Демо-версия» на главной): PDF вычитан, Word может быть с опечатками
function versionNote(b) {
  const from = b.publisher ? ` от <span class="nowrap">${b.publisher}</span>` : '';
  let note = '';
  if (b.version === 'clean') note = `<div class="demo-note bk-note">${icon('check')}
    <div><b>Чистовик</b><p>Окончательная версия книги${from}.</p></div></div>`;
  if (b.version === 'draft') note = `<div class="demo-note bk-note">${icon('info')}
    <div><b>Черновик</b><p>Рабочая версия книги${from}, возможны опечатки.</p></div></div>`;
  // параллельный перевод: отдельная плашка под чистовиком/черновиком
  if (b.parallel) note += `<div class="demo-note bk-note bk-par">${icon('bookOpen')}
    <div><b>Параллельный перевод</b><p>${b.parallel === 'app' ? 'Арабский оригинал под каждым предложением: зажмите предложение на секунду.' : 'В оригинале арабский текст идёт рядом с русским. В приложении пока только русский текст.'}</p></div></div>`;
  return note;
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
  reading: ['Здесь будут книги, которые вы читаете', 'Откройте любую книгу и начните читать: она появится здесь сама.'],
  fav:  ['Здесь будут любимые книги', 'Откройте книгу, нажмите «На полку» и выберите «Избранное».'],
  want: ['Здесь будут книги на потом', 'Откройте книгу, нажмите «На полку» и выберите «Хочу прочитать».'],
  done: ['Здесь будут прочитанные книги', 'Откройте книгу, нажмите «На полку» и выберите «Прочитано».']
};

const SHELF_TABS = [{ key: 'reading', name: 'Читаю' }, ...SHELVES];
function shelfList(key) {
  const reading = key === 'reading', progress = store.get('progress', {});
  const books = (reading ? getReading() : getShelf()[key]).map(bookById).filter(Boolean);
  if (!books.length) {
    const [t, s] = SHELF_EMPTY[key];
    return `<div class="empty"><p class="empty-t">${t}</p><p class="empty-s">${s}</p>
      <a class="btn btn-second empty-btn" href="#/search">${icon('search')}Найти книгу</a></div>`;
  }
  if (reading) return `<p class="found">${booksCount(books.length)} · зажмите книгу, чтобы переставить или убрать</p>
    <div class="ro-list" id="ro-shelf">${books.map(b => `<a class="row ro" data-id="${b.id}" href="${readHref(b)}">${cover(b)}<div class="tx"><div class="t">${b.title}</div><div class="a">${byline(b)}</div><div class="bar"><i style="width:${progress[b.id] || 0}%"></i></div></div></a>`).join('')}</div>`;
  return `<p class="found">${booksCount(books.length)}</p>${books.map(bookRow).join('')}`;
}

function shelfScreen(tab) {
  const key = tab || store.get('shelfTab', 'reading');
  return `
    <h1 class="title">Моя полка</h1>
    <div class="seg" role="tablist">${SHELF_TABS.map(s =>
      `<button role="tab" data-seg="${s.key}" aria-selected="${s.key === key}">${s.name}</button>`).join('')}
    </div>
    <div id="shelf-list">${shelfList(key)}</div>`;
}

function mountShelf() {
  let stop = null;
  const hook = () => { // перестановка и «Убрать» работают на вкладке «Читаю»
    if (stop) stop(); stop = null;
    const ro = document.getElementById('ro-shelf');
    if (ro) stop = mountReorder(ro, ids => { reorderReading(ids); document.getElementById('shelf-list').innerHTML = shelfList('reading'); hook(); }, openReadingMenu);
  };
  hook();
  document.querySelector('.seg').addEventListener('click', e => {
    const b = e.target.closest('[data-seg]');
    if (!b) return;
    const key = b.dataset.seg;
    store.set('shelfTab', key); // в следующий раз откроем ту же вкладку
    document.querySelectorAll('.seg [data-seg]').forEach(x => x.setAttribute('aria-selected', x === b));
    document.getElementById('shelf-list').innerHTML = shelfList(key);
    history.replaceState(history.state, '', `#/shelf/${key}`);
    hook();
  });
  return () => { if (stop) stop(); };
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
  { key: 'ivory', name: 'Слоновая кость' },
  { key: 'white', name: 'Белая' }
];
const FS_MIN = 14, FS_MAX = 26;
let reader = { theme: 'ivory', fs: 18, ...store.get('reader', {}) };
reader.fs = Math.min(FS_MAX, Math.max(FS_MIN, Math.round(reader.fs / 2) * 2)); // шаг размера 2 (ползунок)
if (!READER_THEMES.some(t => t.key === reader.theme)) reader.theme = 'ivory'; // прежние «Бумага» и «Матн» стали «Слоновой костью»
// У книг в оригинальном оформлении (например 'bm', Bayt al-Magrifa) свои цвета вместо темы читалки
let readerStyle = null;

// Место чтения при смене шрифта: запоминаем абзац у верха экрана и после смены возвращаем его на то же место
// (в Chrome это делает сам браузер, в Safari/iPhone нет). У огромных нарезанных книг своя защита (mountChunked).
function placeProbe() {
  const box = document.getElementById('bk') || document.querySelector('article.rd');
  if (!box || box.classList.contains('pg-lazy') || scrollY < 5) return null;
  const y = 96;
  let el = null;
  for (const x of [innerWidth / 2, innerWidth / 3, innerWidth * .7]) { el = document.elementFromPoint(x, y); if (el && box.contains(el)) break; el = null; }
  if (!el) return null;
  el = el.closest('p, li, h1, h2, h3, h4, blockquote, .pg-p, .pg-h, .tr-s') || el;
  if (el.classList.contains('tr-s')) el = el.closest('p, h1, h2') || el;
  const r = el.getBoundingClientRect(), f = r.height ? (y - r.top) / r.height : 0;
  return () => { const r2 = el.getBoundingClientRect(), d = r2.top + f * r2.height - y; if (Math.abs(d) > 1) scrollBy(0, d); };
}

function applyReader(keep) {
  const back = keep ? placeProbe() : null;
  document.body.dataset.rt = readerStyle || reader.theme;
  if (readerStyle === 'pg' && pgCur) pgTheme(pgCur.box, pgCur.th); // книга-PDF: перекрасить страницы под выбранную бумагу
  document.body.style.setProperty('--fs', reader.fs + 'px');
  document.querySelectorAll('[data-rtheme]').forEach(b => b.setAttribute('aria-pressed', b.dataset.rtheme === reader.theme));
  const v = document.getElementById('fs-val');
  if (v) v.textContent = reader.fs;
  const rg = document.getElementById('fs-range');
  if (rg) rg.value = reader.fs;
  paintTelegramBars();
  window.dispatchEvent(new Event('readerchange')); // нарезанные книги (mountChunked) пересчитывают высоты страниц
  if (back) back();
}

/* Читалка: шапка, ползунок страниц, панель «Оформление».
   Шапка прячется, когда листаешь вниз, и возвращается при движении вверх или касании текста.
   Ползунок внизу: тянешь — над ним номер страницы; после большого прыжка 7 секунд виден «Вернуться». */
let seeking = false;
function syncSeek(p) { const r = document.getElementById('rd-seek'); if (r && !seeking) r.value = p * 10; }
function mountReaderUI() {
  const bar = document.querySelector('.rd-top'), seek = document.getElementById('rd-seek');
  const bub = document.getElementById('rd-bubble'), back = document.getElementById('rd-back');
  if (!bar || !seek) return null;
  let last = scrollY, acc = 0, from = 0, fromTxt = '', backTimer = 0, gy = null;
  const setHide = h => { bar.classList.toggle('hide', h); if (h) document.body.classList.remove('rd-panel-open'); };
  const place = () => { const pl = document.getElementById('rd-place'), pc = document.getElementById('rd-pct'); return (pl && pl.textContent ? pl.textContent + ' · ' : '') + (pc ? pc.textContent : ''); };
  const doc = () => document.documentElement.scrollHeight - innerHeight;
  const onScroll = () => {
    const y = scrollY, d = y - last; last = y;
    if (seeking) { bub.textContent = place(); return; }
    if (document.body.classList.contains('rd-panel-open')) { acc = 0; return; } // панель открыта: подгонка места после смены шрифта не должна её закрывать
    if (y < 80) { acc = 0; return setHide(false); }
    acc = (d > 0) === (acc > 0) ? acc + d : d;
    if (acc > 40) setHide(true); else if (acc < -28) setHide(false);
  };
  const onTap = e => {
    if (!e.target.closest('#bk, article.rd')) return;
    if (e.target.closest('a, button, input, .tr-s, .tr-pop, .rd-sc, .rd-sc-g')) return;
    if (String(getSelection())) return;
    setHide(!bar.classList.contains('hide'));
  };
  const showBack = () => {
    back.firstChild.textContent = 'Вы были на: ' + fromTxt;
    back.classList.add('on');
    clearTimeout(backTimer); backTimer = setTimeout(() => back.classList.remove('on'), 7000);
  };
  const start = () => { seeking = true; from = scrollY; const pl = document.getElementById('rd-place'); fromTxt = pl && pl.textContent ? pl.textContent : document.getElementById('rd-pct').textContent; bub.textContent = place(); bub.classList.add('on'); setHide(false); };
  const end = () => { if (!seeking) return; seeking = false; bub.classList.remove('on'); if (Math.abs(scrollY - from) > innerHeight * 1.5) showBack(); };
  const onInput = () => { if (!seeking) start(); scrollTo(0, seek.value / 1000 * doc()); requestAnimationFrame(() => { bub.textContent = place(); }); };
  const onBack = e => { if (e.target.closest('[data-action="rd-return"]')) { scrollTo(0, from); back.classList.remove('on'); } };
  // потянул ручку панели вниз: закрылась
  const ts = e => { gy = e.target.closest('.rd-grab, .rd-ph') ? e.touches[0].clientY : null; };
  const te = e => { if (gy !== null && e.changedTouches[0].clientY - gy > 50) document.body.classList.remove('rd-panel-open'); gy = null; };
  addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('click', onTap);
  seek.addEventListener('pointerdown', start);
  seek.addEventListener('input', onInput);
  seek.addEventListener('pointerup', end); seek.addEventListener('pointercancel', end); seek.addEventListener('change', end);
  back.addEventListener('click', onBack);
  document.addEventListener('touchstart', ts, { passive: true }); document.addEventListener('touchend', te);
  return () => {
    seeking = false; clearTimeout(backTimer);
    removeEventListener('scroll', onScroll); document.removeEventListener('click', onTap);
    document.removeEventListener('touchstart', ts); document.removeEventListener('touchend', te);
  };
}

// Общие куски читалки: шапка с кнопками, нижняя полоска-ползунок, панель «Оформление», подсказка «Вернуться»
function rdTopHTML(title, extra = '') {
  return `<div class="topbar rd-top">
      <button class="btn btn-icon" data-action="back" aria-label="Назад">${icon('back')}</button>
      <span class="rd-book">${title}</span>
      <span class="rd-right">${extra}<button class="btn btn-icon" data-action="rd-panel" aria-label="Оформление: шрифт и фон">${icon('type')}</button></span>
    </div>`;
}
function rdBottomHTML(placeHTML) {
  return `<div class="rd-prog">${placeHTML}<div class="bar rd-seekbar"><i id="rd-bar"></i><input type="range" id="rd-seek" min="0" max="1000" value="0" aria-label="Перейти по книге"></div><span id="rd-pct">0%</span></div>
    <div class="rd-bubble" id="rd-bubble"></div>
    <div class="rd-back" id="rd-back"><span></span><button data-action="rd-return">Вернуться</button></div>
    <div class="rd-scrim" data-action="rd-close"></div>
    <div class="rd-panel" id="rd-panel">
      <div class="rd-grab"></div>
      <div class="rd-ph"><b>Оформление</b><button class="btn btn-icon" data-action="rd-close" aria-label="Закрыть">${icon('close')}</button></div>
      <div class="themes-box"><div class="rd-sub">Фон</div>
        <div class="themes">${READER_THEMES.map(t => `<button class="th th-${t.key}" data-rtheme="${t.key}"><i>Аа</i>${t.name}</button>`).join('')}</div></div>
      <div class="rd-sub">Шрифт · <span id="fs-val"></span></div>
      <div class="sizes">
        <button data-fs="-2" aria-label="Шрифт меньше" class="fs-s">А</button>
        <input type="range" id="fs-range" min="${FS_MIN}" max="${FS_MAX}" step="2" aria-label="Размер шрифта">
        <button data-fs="2" aria-label="Шрифт больше" class="fs-l">А</button>
      </div>
    </div>`;
}

function sampleScreen() {
  const S = window.SAMPLE;
  return `
    ${rdTopHTML(S.bookTitle)}
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
    ${rdBottomHTML(`<span>${S.place}</span>`)}`;
}

// Прогресс: сколько процентов главы человек пролистал. Запоминаем, чтобы вернуть на то же место
function mountSample() {
  const id = window.SAMPLE.bookId;
  const bar = document.getElementById('rd-bar');
  const pct = document.getElementById('rd-pct');
  const scrollable = () => document.documentElement.scrollHeight - innerHeight;

  function show(p) { bar.style.width = p + '%'; pct.textContent = p + '%'; syncSeek(p); }
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
  const stopUI = mountReaderUI();
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
    if (stopUI) stopUI();
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
// Заголовок, набранный прописными (короткий, почти все буквы заглавные): в нём слова не переносим, а висячий левый отступ PDF
// (узкая колонка справа от номера «I.», «2.») на экране телефона убираем: заголовок идёт во всю ширину
const capsHead = h => {
  const t = String(h).replace(/<[^>]+>/g, '').replace(/&[#\w]+;/g, ''), l = t.replace(/[^\p{L}]/gu, '');
  return t.length < 220 && l.length > 8 && l.replace(/[^\p{Lu}]/gu, '').length / l.length > .7;
};
// Строки титула в PDF умещаются в одну строку, а наш шрифт чуть шире, и строка переносилась «хвостом» («необхо-» / «димости»).
// Подряд идущие строки одного размера с малым отступом — абзац титула: если какой-то строке не хватает до 20 % ширины, уменьшаем
// ВСЮ группу на один и тот же коэффициент (--ff), чтобы строки остались одной высоты и одной строкой, как в PDF.
// Блок, которому не хватает больше (целый абзац в одном блоке), переносится как обычный текст
function fitFront(root, again) {
  const rg = document.createRange();
  const width = p => { // ширина строки в одну линию
    p.style.whiteSpace = 'nowrap'; rg.selectNodeContents(p);
    const rs = [...rg.getClientRects()].filter(r => r.width > 0); p.style.whiteSpace = '';
    return rs.length ? Math.max(...rs.map(r => r.right)) - Math.min(...rs.map(r => r.left)) : 0;
  };
  const gap = p => { const m = /\*\s*(-?[\d.]+)\)/.exec(p.style.marginTop); return m ? +m[1] : 0; }; // отступ сверху в pt PDF
  const fs = [...root.querySelectorAll('.pg-front .pg-f')]; fs.forEach(p => p.style.removeProperty('--ff'));
  const runs = [];
  for (const p of fs) { const last = runs[runs.length - 1]; if (last && last[last.length - 1].nextElementSibling === p && p.style.fontSize === last[0].style.fontSize && gap(p) <= 4) last.push(p); else runs.push([p]); }
  for (const run of runs) {
    const cw = run[0].clientWidth; if (!cw) continue;
    const lo = .8, kOf = p => { const n = width(p); return n ? cw / n : 1; };
    const tight = run.filter(p => { const k = kOf(p); return k < 1 && k >= lo; }); // строки, которым не хватает ширины (остальные — влезают или это целый абзац)
    if (!tight.length) continue;
    let f = 1, k = Math.min(...tight.map(kOf));
    for (let i = 0; i < 5 && k < 1; i++) { // ширина не строго пропорциональна размеру (оптический размер шрифта) — подгоняем несколькими шагами
      f *= k * .997; run.forEach(p => p.style.setProperty('--ff', f.toFixed(3))); k = Math.min(...tight.map(kOf));
    }
  }
  if (!again && fs.length && document.fonts) document.fonts.ready.then(() => fitFront(root, 1)); // шрифты могли догрузиться уже после первого замера
}
function hyphenate(root) {
  if (root.classList && root.classList.contains('pg-hd')) return; // заголовок прописными: без переносов
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = walk.nextNode());) {
    let t = n.nodeValue;
    for (let k = 0; k < 2; k++) HYPHEN_RULES.forEach(r => { t = t.replace(r, '$1­$2'); }); // дважды: соседние слоги
    n.nodeValue = t;
  }
}

// Волна нижнего фона брошюры: в PDF это одна гладкая кривая Безье на весь лист из трёх страниц (T.wave: s2 — лист со страницами 1–3, s1 — страницы 4–5).
// Каждой странице достаётся свой кусок листа. Форма рисуется в масштабе по ширине (без растяжения по высоте — страница на экране выше, чем лист PDF),
// сверху волна стоит на той же доле высоты страницы, что и в PDF; всё под волной закрашено (маска: картинка волны + сплошная заливка ниже неё).
const BM_PW = 841.89 / 3, BM_PH = 595.28; // ширина страницы-панели и высота листа PDF, pt
function bmWave(T, n) {
  if (!T.wave) return '';
  const [key, pn] = n <= 3 ? ['s2', n - 1] : ['s1', (n - 4) % 3], d = T.wave[key], x0 = pn * BM_PW;
  const v = d.match(/-?\d+(?:\.\d+)?/g).map(Number); // M x y, затем C (x1 y1 x2 y2 x y) ×3: точки кривой; ymin = самая высокая точка кривой в пределах панели
  let cx = v[0], cy = v[1], ymin = BM_PH;
  for (let i = 2; i + 5 < v.length; i += 6) {
    for (let k = 0; k <= 60; k++) {
      const t = k / 60, u = 1 - t, b = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
      const x = b[0] * cx + b[1] * v[i] + b[2] * v[i + 2] + b[3] * v[i + 4], y = b[0] * cy + b[1] * v[i + 1] + b[2] * v[i + 3] + b[3] * v[i + 5];
      if (x >= x0 && x <= x0 + BM_PW && y < ymin) ymin = y;
    }
    cx = v[i + 4]; cy = v[i + 5];
  }
  ymin = Math.max(0, Math.floor(ymin) - 1);
  const h = BM_PH - ymin, svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${BM_PW}" height="${h}" viewBox="${x0} ${ymin} ${BM_PW} ${h}"><path d="${d}"/></svg>`;
  return `--bm-wy:${(ymin / BM_PH * 100).toFixed(2)}%;--bm-wr:${(h / BM_PW).toFixed(4)};--bm-wm:url('data:image/svg+xml,${encodeURIComponent(svg)}')`;
}

// Шапка страницы как в книгах Bayt al-Magrifa: фонарь, название, номер и стрелка
const bmPage = (T, p, n) => `
  <section class="bm-page" data-page="${n}" style="${bmWave(T, n)}">
    <header class="bm-band"><span class="bm-lamp" aria-hidden="true"></span>
      <span class="bm-run">${T.running}</span>
      <span class="bm-num">${n}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></span>
    </header>
    <div class="bm-body">
      ${p.blocks.map(([t, html]) => t === 'h' || t === 'g' ? `<h2 class="bm-h${t === 'g' ? ' bm-reg' : ''}">${honHtml(html, T.theme)}</h2>` : `<p class="bm-p${t === 'c' ? ' bm-cont' : t === 'q' ? ' bm-flat' : ''}">${honHtml(html, T.theme)}</p>`).join('')}
      ${p.notes.length ? `<ol class="bm-notes">${p.notes.map(([k, html]) => `<li><span>${k}.</span><div>${honHtml(html, T.theme)}</div></li>`).join('')}</ol>` : ''}
    </div>
  </section>`;

// Цвета и пропорции буклета берём из самого PDF (T.theme); у книги №1 темы нет, там значения по умолчанию из CSS
const BM_VARS = { top: '--bm-top', band: '--bm-band', low: '--bm-low', text: '--bm-text', run: '--bm-run', num: '--bm-num', arrow: '--bm-arrow', lamp: '--bm-lamp',
  k: '--bm-k', lh: '--bm-lh', ind: '--bm-ind', gap: '--bm-gap', nfs: '--bm-nfs', nlh: '--bm-nlh', sup: '--bm-sup' };
function bmTheme(box, th) {
  if (!th) return;
  for (const [k, v] of Object.entries(BM_VARS)) if (th[k] !== undefined) box.style.setProperty(v, th[k]);
  // фон читалки, полоска прогресса и шапка Telegram тоже в цвет страницы
  const b = document.body.style;
  b.setProperty('--rb', th.top); b.setProperty('--rt', th.text); b.setProperty('--rm', th.run); b.setProperty('--rr', th.text);
  paintTelegramBars();
}

// Книги «одна страница PDF = одна страница на экране» (оформление 'pg'): шапка с узором, номер внизу, сноски под текстом
const PG_VARS = { numc: '--pg-num', font: '--pg-font', pw: '--pg-pw', text: '--pg-text', head: '--pg-head', bg: '--pg-bg', k: '--pg-k', lh: '--pg-lh', ind: '--pg-ind', gap: '--pg-gap', nfs: '--pg-nfs', nlh: '--pg-nlh', sup: '--pg-sup', nw: '--pg-nw', ar: '--pg-ar', arwrap: '--pg-arwrap' };
let pgCur = null; // книга-PDF на экране: нужна, чтобы перекрасить страницы, когда человек меняет цвет бумаги
function pgTheme(box, th) {
  pgCur = { box, th };
  for (const [k, v] of Object.entries(PG_VARS)) if (th[k] !== undefined) box.style.setProperty(v, th[k]);
  const bg = reader.theme === 'white' ? '#FFFFFF' : '#FAF6EC'; // цвет бумаги по выбору читателя (th.bg в файле книги — прежний, его не используем)
  box.style.setProperty('--pg-bg', bg);
  const b = document.body.style;
  b.setProperty('--rb', bg); b.setProperty('--rt', th.text); b.setProperty('--rm', th.head); b.setProperty('--rr', th.text);
  paintTelegramBars();
}
// z — размер шрифта блока в долях основного, mt — отступ сверху в долях основного размера (--u = основной размер в пикселях)
const pgStyle = ex => {
  const s = [];
  if (ex.z) s.push(`font-size:${ex.z}em`);
  if (ex.ff) s.push(`font-family:'${ex.ff}',serif`);
  if (ex.mt !== undefined) s.push(`margin-top:calc(${ex.mt} * var(--u))`);
  const pl = ex.pl ? `min(calc(${ex.pl} * var(--u)), calc(100% - 6 * var(--u)))` : ''; // отступ слева не больше «колонка минус 6 размеров шрифта»: на узком экране с крупным шрифтом иначе съедает всю ширину
  if (ex.pl) s.push(`padding-left:${pl}`);
  if (ex.ti !== undefined) s.push(`text-indent:${ex.pl ? `calc(${+(ex.pl + ex.ti).toFixed(3)} * var(--u) - ${pl})` : `calc(${ex.ti} * var(--u))`}`); // висячий отступ пункта списка («I. …»): первая строка левее остальных, но на том же месте, что в PDF
  if (ex.lh) s.push(`line-height:${ex.lh}`);
  if (ex.bar) s.push(`border-left:calc(var(--pt) * 2) solid var(--pg-bar, #2c2e35)`, `padding-left:calc(var(--pt) * ${ex.bar})`, "text-indent:0", "text-align:left"); // тёмная черта слева от подзаголовка («О посте»); bar — отступ текста от черты в pt PDF
  if (ex.qb) s.push(`margin-left:calc(var(--pt) * ${ex.qb[0]})`, `margin-right:calc(var(--pt) * ${ex.qb[2]})`, `border-left:max(1px, var(--pt)) solid var(--pg-text, #000)`, `padding-left:calc(var(--pt) * ${ex.qb[1]})`, "text-indent:0"); // цитата с чёрточкой слева (№83): qb = [отступ чёрточки от поля, зазор до текста, правое поле] в pt PDF
  return s.length ? ` style="${s.join(';')}"` : '';
};
// Плашка у заголовка (№17, №66): рисунок из самого PDF векторный (SVG из контуров фигур, img/pl-N/), текст внутри настоящий.
// Вид — th.pls[ex.pq]: края L/R = [ширина, части [файл, высота, тянется?], сколько оставить при нехватке места (только у тёмной)], m — середина (CSS), sg — знак в строке.
// Размеры в pt страницы PDF × --k (= 1em / размер текста плашки в PDF): плашка растёт вместе с текстом («Аа»), пропорции как в книге.
// ex.pq — вид плашки, ex.fz — размер текста плашки в PDF (pt), ex.w — ширина середины (pt), ex.h — высота (pt), если не как у вида
const pgPlaque = (k, h, ex, pls) => {
  const P = pls[ex.pq], m = P.m, K = v => `calc(var(--k) * ${v})`, keep = s => s[2] || s[0];
  const cap = ([w, parts, mw], side) => `<span class="c ${side}" style="${mw ? `flex-basis:${K(w)};min-width:${K(mw)}` : `width:${K(w)}`}">${parts.map(([f, ph, s]) =>
    `<img src="${pls.dir}${f}.svg" alt=""${s ? ' class="s"' : ''} style="height:${K(ph)}${s ? `;min-height:${K(ph)}` : ''}${mw ? `;width:${K(w)}` : ''}">`).join('')}</span>`;
  const ms = [`min-height:${K(ex.h || m.h)}`, `padding:0 ${K(m.pr || 0)} 0 ${K(m.pl || 0)}`, `max-width:calc(100% - ${K(keep(P.L) + keep(P.R))})`];
  if (ex.w) ms.push(`width:${K(ex.w)}`);
  if (k === 'h') ms.push('font-weight:700'); // заголовок «h» жирный сам (в «g» и «f» жирное задано в тексте тегом <b>)
  if (m.bg) ms.push(`background:${m.bg}`);
  if (m.bi) ms.push(`background:url(${pls.dir}${m.bi}.svg) 0 0 / auto 100% repeat-x`); // плитка, повторяемая по ширине (цепочка вдоль заголовка №69)
  if (m.c) ms.push(`color:${m.c}`);
  if (m.bt) ms.push(`border-block:${K(m.bt)} solid ${m.bc}`);
  if (P.sg) h = h.replace(P.sg[0], P.sg[1].replace('@', `<img class="pg-plh" src="${pls.dir}${P.sg[2]}.svg" alt="">`)); // знак из PDF (рисунок, не буквы)
  const f = k === 'f'; // титульная строка: размеры в pt страницы, а не в долях текста
  const s = [f ? `font-size:calc(var(--pt) * ${ex.z})` : `font-size:${ex.z}em`, f ? '--k:var(--pt)' : `--k:calc(1em / ${ex.fz})`];
  if (ex.ff) s.push(`font-family:'${ex.ff}',sans-serif`);
  const mt = ex.mt !== undefined ? ex.mt : k === 'q' ? 0 : 1.5;
  s.push(`margin-top:${f ? `calc(var(--pt) * ${mt})` : `calc(${mt} * var(--u))`}`);
  return `<div class="pg-pl${P.a === 'c' ? ' pg-pl-c' : ''}" style="${s.join(';')}">${cap(P.L, 'l')}<h2 class="m" style="${ms.join(';')}"><span>${h}</span></h2>${cap(P.R, 'r')}</div>`;
};
// Значок слева от абзаца (рука ☞, ➢, ■, круг «Мухаммад»): рисунок из PDF (img/ic-N/*.svg). th.ics[ex.ic] = {src, w, h, dx, dy} в pt PDF:
// dx — левый край значка от начала первой строки абзаца, dy — низ значка над базовой линией этой строки. В em от размера текста абзаца в PDF — значок растёт вместе с текстом
const pgIcon = (ex, th) => {
  const d = th.ics && th.ics[ex.ic]; if (!d) return '';
  const e = v => `${+(v / ((th.body || 11) * (ex.z || 1))).toFixed(3)}em`;
  return `<span class="pg-ic"><img src="${d.src}" alt="" style="left:${e(d.dx)};bottom:${e(d.dy)};width:${e(d.w)};height:${e(d.h)}"></span>`;
};
// Девиз в рамке («20 советов»): рамка — три куска SVG из самого PDF (верх с завитком, тянущаяся середина, низ), th.mf.dir — папка; текст внутри настоящий.
// Ширина рамки = ширина колонки, куски масштабируются вместе (как в PDF), середина растягивается под любое число строк
const pgMotto = (k, h, ex, th) => {
  const d = th.mf.dir, {mt, ...rest} = ex, st = mt !== undefined ? ` style="margin-top:calc(${mt} * var(--u))"` : '';
  return `<div class="pg-mf"${st}><img src="${d}t.svg" alt=""><div class="b" style="background-image:url(${d}m.svg)">${pgBlock([k, h, { ...rest, mf: 0 }], th)}</div><img src="${d}b.svg" alt=""></div>`;
};
// Плашка-заголовок с завитками на концах («Разъяснение условий молитвы»: «ПРЕДИСЛОВИЕ», «УСЛОВИЯ (ШУРУТЫ) МОЛИТВЫ»…). В PDF она растровая: концы — вырезки из PDF (th.rp.dir: tN-l.webp, tN-r.webp),
// середина — узкая полоска, растянутая по ширине (tN-m.webp), текст настоящий. th.rp.t[N] = {h — высота, c — ширина конца} в pt PDF; ex.rp = N (вид), ex.fz — размер текста (pt)
const pgRPlaque = (k, h, ex, th) => {
  const R = th.rp, T = R.t[ex.rp], P = v => `calc(var(--pt) * ${v})`, d = R.dir, {mt} = ex;
  const m = mt === undefined ? '' : `margin-top:${k === 'f' ? P(mt) : `calc(${mt} * var(--u))`};`;
  return `<div class="pg-rp" style="${m}min-height:${P(T.h)}"><img src="${d}t${ex.rp}-l.webp" alt="" style="width:${P(T.c)}"><div class="m" style="background-image:url(${d}t${ex.rp}-m.webp);font-size:${P(ex.fz)}"><span>${h}</span></div><img src="${d}t${ex.rp}-r.webp" alt="" style="width:${P(T.c)}"></div>`;
};
// Значки почтения (ﷺ, «رضي الله عنه», «رحمه الله», «عليه السلام»…): в оригинале это каллиграфические знаки шрифта книги, поэтому на экране — картинки из PDF
// (img/hon/<набор>-<код>.webp, красятся цветом текста маской, выглядят одинаково на любом телефоне). th.hon = { fam: набор, f: { код: размер знака относительно текста вокруг, если не 1 } }.
// Набор 'kf' — шрифт KFGQPC (книги №17, 66, 95), 'aga' — AGA-Arabesque (№9, 37). Стили знаков (размер и сдвиг от базовой линии, снятые с PDF) — в css: .hk067 и т. п.
const HON_TXT = { 'ﷺ': 'salla', 'صلى الله عليه وسلم': 'salla', 'رضي الله عنه': 'radi', 'رضي الله عنها': 'radiha', 'رضي الله عنهما': 'radihma', 'رضي الله عنهم': 'radihm',
  'رحمه الله': 'rahim', 'عليه السلام': 'alay', 'عليهم السلام': 'alayhm', 'عليهما السلام': 'alayhma' };
const HON_FAM = {
  kf: { salla: '067', radi: '068', radiha: '069', radihm: '06a', radihma: '06b', alay: '06e', alayhm: '070', alayhma: '071', rahim: '072' },
  aga: { salla: '072', radi: '074', radihm: '079' },
  bm: { salla: 'arial' } // брошюры: ﷺ — глиф Arial или Times New Roman (в PDF №102 они чередуются): форма указана в data-v у знака
};
const honHtml = (h, th) => {
  const hs = th && (th.hon || (th.theme && th.theme.hon)), fam = hs && HON_FAM[hs.fam]; // th — тема книги (pg, bm) или сама книга (Word: T.hon)
  if (!fam) return h;
  // кроме готовых <span class="hon"> знаками считаются «голый» ﷺ и служебные символы шрифта AGA Arabesque из Word (U+F072 = ﷺ, U+F074 = «رضي الله عنه»), которые без шрифта рисуются квадратом
  return String(h).replace(/(?:([^\s<>]+)((?:<\/(?:i|b|u|em|strong)>)*)(?:\s|&nbsp;| )+)?(<span class="hon"((?: data-[a-z]+="[^"]*")*)>([^<]*)<\/span>|[ﷺ])([,.;:!?)»”…]*|<(i|b|u|em|strong)>[,.;:!?)»”…]+<\/\7>)/g, (m, pw, cl, sg, at, t, pu) => {
    const v = at && (at.match(/data-v="([^"]*)"/) || [])[1], fz = at && (at.match(/data-f="([^"]*)"/) || [])[1]; // data-v — вид знака в брошюрах (arial/tnr), data-f — размер именно этого знака относительно текста (из PDF)
    const tt = t !== undefined ? t.trim() : '', txt = t !== undefined ? (tt === '\uF072' ? 'ﷺ' : tt === '\uF074' ? 'رضي الله عنه' : tt) : sg === '\uF074' ? 'رضي الله عنه' : 'ﷺ', c = (hs.fam === 'bm' && (v || hs.def)) || fam[HON_TXT[txt]];
    if (!c) return m; // такого знака в книге нет в наборе: остаётся текстом
    const f = fz ? +fz : hs.f && hs.f[c];
    const sp = `<span class="hon hi h${hs.fam[0]}${c}"${f && f !== 1 ? ` style="--hf:${f}"` : ''} role="img" aria-label="${HON_TXT[txt] === 'salla' ? 'صلى الله عليه وسلم' : txt}"></span>`;
    if (!(pw || pu)) return sp;
    const op = cl ? cl.match(/<\/[a-z]+>/g).reverse().map(c => '<' + c.slice(2)).join('') : ''; // слово стояло внутри <i>/<b>: закрываем их перед группой и открываем снова внутри неё
    return `${cl || ''}<span class="nw">${pw ? op + pw + (cl || '') + '&nbsp;' : ''}${sp}${pu}</span>`; // слово + значок + знак после него — одной неразрывной группой: значок не остаётся один в начале строки
  });
};
const pgBlock = ([k, h, ex = {}], th) => {
  h = honHtml(h, th);
  if (ex.rp && th && th.rp) return pgRPlaque(k, h, ex, th);
  if (ex.mf && th && th.mf) return pgMotto(k, h, ex, th);
  if (ex.pill) { // заголовок в рамке-«пилюле» («Как начать требовать знания»): тонкая линия, скруглённые края (pill: 1 — на одну строку в PDF, 2 — на две)
    const {mt, ...rest} = ex;
    return `<div class="pg-pill pg-pill${ex.pill}"${mt !== undefined ? ` style="margin-top:calc(${mt} * var(--u))"` : ''}>${pgBlock([k, h, { ...rest, pill: 0 }], th)}</div>`;
  }
  if (ex.pq && th && th.pls) return pgPlaque(k, h, ex, th.pls);
  if (ex.ic && th) h = pgIcon(ex, th) + h;
  const st = pgStyle(ex);
  switch (k) {
    case 'h': return `<h2 class="pg-h"${st}>${h}</h2>`;
    case 'g': return `<h2 class="pg-h pg-reg"${st}>${h}</h2>`;
    case 'd': return `<h2 class="pg-d"${st}>${h}</h2>`; // крупный заголовок особого шрифта (например, №75)
    case 'img': { // арабская картинка; ex.ic — значок слева от неё (по середине высоты картинки, у левого поля)
      const d = ex.ic && th && th.ics && th.ics[ex.ic], e = v => `${+(v / (th.body || 11)).toFixed(3)}em`;
      const ic = d ? `<img class="pg-icb" src="${d.src}" alt="" style="left:${e(d.lx || 0)};width:${e(d.w)};height:${e(d.h)};top:calc(50% - ${e(d.h / 2)})">` : '';
      return `<div class="pg-img${d ? ' pg-img-ic' : ''}"${st}>${ic}<img src="${ex.src}" alt="" style="width:calc(100cqw * ${ex.w} / var(--pg-pw, 411) * 1.25)${ex.h ? `;aspect-ratio:auto ${ex.r ? `1 / ${ex.r}` : `${ex.w} / ${ex.h}`}` : ''}"></div>`;
    }
    case 'art': { // нарисованное из PDF (каллиграфия, узор): векторная картинка img/art-N/*.svg. Размеры — в pt страницы PDF (--pt):
      // w/h — размер, mtp — отступ сверху, mbp — снизу, ox — сдвиг от середины страницы вправо (pt)
      if (ex.tp !== undefined) { // «наложение»: рисунок не занимает места в тексте, лежит на указанной высоте (tu — в долях текста, tp — в pt страницы) от этого места страницы; по бокам заголовка (цветочные углы)
        return `<div class="pg-art pg-art-o"><img src="${ex.src}" alt="" style="width:calc(var(--pt) * ${ex.w});aspect-ratio:${ex.w} / ${ex.h};top:calc(var(--b0) + var(--u) * ${ex.tu || 0} + var(--pt) * ${ex.tp});left:calc(50% + var(--pt) * ${ex.ox || 0})"></div>`;
      }
      const s = [`margin-top:calc(var(--pt) * ${ex.mtp || 0})`];
      if (ex.mbp) s.push(`margin-bottom:calc(var(--pt) * ${ex.mbp})`);
      return `<div class="pg-art" style="${s.join(';')}"><img src="${ex.src}" alt="" style="width:calc(var(--pt) * ${ex.w});aspect-ratio:${ex.w} / ${ex.h}${ex.ox ? `;left:calc(var(--pt) * ${ex.ox})` : ''}"></div>`;
    }
    case 'ar': return `<p class="pg-ar" lang="ar" dir="rtl"${st}>${h.replace(/إ(?=له(?!\p{L}))/gu, 'إ\u200E').replace(/^([٠-٩]+) — /, '$1 <span class="ar-d">—</span> ')}</p>`; // арабская строка поэмы (№61): размер z, межстрочие lh и отступ mt — в данных книги; тире между номером и текстом в PDF набрано другим (тонким) шрифтом; «إله» в конце слова: невидимый LRM (U+200E) между إ и ل — иначе шрифт v2 рисует над ل лишний знак, которого в PDF (старая версия шрифта) нет
    case 'sep': return `<div class="pg-sep"${st}><img src="img/pg-orn-stars.png" alt=""></div>`;
    case 'toc': return `<p class="pg-toc"${st}><span>${h}</span><i></i><span>${ex.pg || ''}</span></p>`;
    case 'f': { // титульная строка: размер и отступ в pt страницы PDF (--pt), чтобы титул выглядел как в книге при любой ширине экрана
      const s = [`font-size:calc(var(--pt) * ${ex.z || 12} * var(--ff, 1))`];
      if (ex.ff) s.push(`font-family:'${ex.ff}',serif`);
      if (ex.mt !== undefined) s.push(`margin-top:calc(var(--pt) * ${ex.mt})`);
      return `<p class="pg-f pg-a-${ex.a || 'l'}" style="${s.join(';')}">${h}</p>`;
    }
    default: {
      if (ex.al === 'r') return `<p class="pg-p pg-hd pg-hr"${pgStyle({ ...ex, pl: undefined, ti: undefined })}>${h}</p>`; // строка по правому краю (подпись в конце послания, №62)
      if (ex.al === 'c') return `<p class="pg-p pg-hd pg-hc"${pgStyle({ ...ex, pl: undefined, ti: undefined })}>${h}</p>`; // абзац по центру с отступом первой строки («Глава: …» в №65): слова не переносятся
      if ((k !== 'c' || capsHead(h)) && (capsHead(h) || (ex.pl >= 5 && String(h).replace(/<[^>]+>/g, '').length < 160))) return `<p class="pg-p pg-hd${k === 'q' ? ' pg-flat' : ''}"${pgStyle({ ...ex, pl: undefined, ti: undefined })}>${h}</p>`; // заголовок прописными: без висячего отступа
      return `<p class="pg-p${k === 'c' ? ' pg-cont' : k === 'q' ? ' pg-flat' : ''}"${st}>${h}</p>`;
    }
  }
};
// Рамка цитаты (группа В: №17, 66, 95): подряд идущие блоки с одним ex.fr — внутри общей рамки p.frames[fr − 1].
// Вид рамки th.frs[вид] — картинка-образец из самого PDF (уголки и полоски сторон; середина — заливка), растягивается под любую высоту (border-image);
// узор по бокам (№66) — отдельные картинки, растянутые по высоте рамки. Размеры — в pt страницы PDF (--pt), отступы по вертикали — в долях основного размера (--u)
const pgFrame = (f, th, html) => {
  const d = th.frs && th.frs[f.s];
  if (!d) return html;
  const [cw, ch] = [].concat(d.c || 0), [sw, sh] = [].concat(d.sl || 0), W = `calc(var(--pt) * ${cw})`, H = `calc(var(--pt) * ${ch !== undefined ? ch : cw})`; // уголок: ширина и высота (pt и пиксели образца)
  const st = [`margin:calc(var(--u) * ${f.mt}) calc(var(--pt) * ${f.mr}) 0 calc(var(--pt) * ${f.ml})`,
    `padding:calc(var(--pt) * ${f.pt || 0}) calc(var(--pt) * ${f.pr}) calc(var(--u) * ${f.pb}) calc(var(--pt) * ${f.pl})`, // f.pt — отступ сверху (pt PDF), если сверху завиток
    // d.m — рамка из трёх кусков SVG (верх с завитком, тянущаяся середина, низ): img/…/t.svg, m.svg, b.svg; ширина кусков = ширина рамки
    ...(d.m ? [`background:url(${d.m}t.svg) top/100% auto no-repeat,url(${d.m}b.svg) bottom/100% auto no-repeat,url(${d.m}m.svg) 0 0/100% 100% no-repeat`] : []),
    // d.mt / d.mb — верхний и нижний узор отдельными адресами (SVG во всю ширину рамки, середина пустая): рамки цитат №69, верх бывает двух видов
    ...(d.mt || d.mb ? [`background:${[d.mt && `url(${d.mt}) top/100% auto no-repeat`, d.mb && `url(${d.mb}) bottom/100% auto no-repeat`].filter(Boolean).join(',')}`] : []),
    ...(d.src ? [`border-image-source:url(${d.src})`,`border-image-slice:${sh !== undefined ? sh : sw} ${sw} ${sh !== undefined ? sh : sw} ${sw} fill`,
      `border-image-width:${f.ot ? '0' : H} ${W} ${f.ob ? '0' : H} ${W}`] : []),
    ...(d.bg ? [`background:${d.bg}`, ...(d.rad ? [`border-radius:calc(var(--pt) * ${d.rad})`] : [])] : [])]; // d.bg — плоская заливка (серые плашки заголовков №9), без картинки-образца; d.rad — скругление углов, pt PDF
  const o = d.o && f.orn ? ['l', 'r'].map(k => `<i class="pg-fo" style="${k === 'l' ? 'left' : 'right'}:calc(var(--pt) * ${d.o[k + 'x']});width:calc(var(--pt) * ${d.o.w});top:${f.orn[0]}%;height:${f.orn[1]}%;background-image:url(${d.o[k]})"></i>`).join('') : '';
  const ic = d.i && f.ic ? `<i class="pg-fo" style="left:calc(var(--pt) * ${f.ic[0]});top:calc(var(--pt) * ${f.ic[1]});width:calc(var(--pt) * ${d.i.w});height:calc(var(--pt) * ${d.i.h});background-image:url(${d.i.src})"></i>` : ''; // значок-книжка (№37)
  return `<div class="pg-fr${d.r ? ' pg-fr-r' : ''}${d.bg ? ' pg-fr-g' : ''}" style="${st.join(';')}">${o}${ic}${html}</div>`;
};
// блоки страницы: подряд идущие с одним ex.fr собираются в рамку
const pgBlocks = (p, th) => {
  let html = '', run = '', cur = 0;
  const flush = () => { if (run) html += pgFrame(p.frames[cur - 1], th, run); run = ''; cur = 0; };
  for (const b of p.blocks) {
    const fr = (b[2] && b[2].fr) || 0;
    if (fr !== cur) flush();
    if (fr) { cur = fr; run += pgBlock(b, th); } else html += pgBlock(b, th);
  }
  flush();
  return html;
};
// Шапка «как в PDF» (th.hdr === 'rule', №69): строка, под ней линия с завитками на концах (th.hr — SVG из PDF), под линией вторая строка (в p.head строки через перенос).
// У страницы без шапки место и высота те же, а линия скрыта — чтобы текст стоял там же, где в книге
const pgHeadRule = (h, th) => { const [x, y] = (h || '').split('\n'); return `<header class="pg-head pg-hr"><span>${honHtml(x || '', th) || '&nbsp;'}</span><img src="${th.hr}" alt=""${h ? '' : ' style="visibility:hidden"'}><span>${honHtml(y || '', th) || '&nbsp;'}</span></header>`; };
const pgPage = (p, i, th) => `
  <section class="pg-page${p.front ? ' pg-front' : ''}" data-page="${i + 1}">
    ${th.num === 'top' && !p.front && p.n !== undefined ? `<div class="pg-topnum pg-${p.side || 'r'}">${p.n}</div>` : ''}
    ${p.front ? '' : th.hdr === 'rule' ? pgHeadRule(p.head, th) : !p.head ? '' : `<header class="pg-head${th.hdr === 'line' ? ' pg-hl' : ''}"><span>${honHtml(p.head || '', th).replace(/ (?=<span class="hon )/g, '\u00A0')}</span>${th.hdr === 'line' ? '' : '<img src="img/pg-orn-head.png" alt="">'}</header>`}
    <div class="pg-body">
      ${pgBlocks(p, th)}
      ${p.notes.length ? `<ol class="pg-notes"${Math.max(...p.notes.map(([k]) => String(k).length)) >= 3 ? ` data-d="${Math.min(4, Math.max(...p.notes.map(([k]) => String(k).length)))}"` : ''}>${p.notes.map(([k, html]) => `<li><span>${k}.</span><div>${honHtml(html, th)}</div></li>`).join('')}</ol>` : ''}
    </div>
    ${p.front || th.num === 'top' ? '' : th.foot === 'oval' ? `<footer class="pg-foot pg-oval"><span style="background-image:url(${th.ov})">${p.n !== undefined ? p.n : ''}</span></footer>` : `<footer class="pg-foot pg-${p.side || 'r'}${th.foot === 'bar' ? ' pg-bar' : ''}"><span>${p.n !== undefined ? p.n : ''}</span>${th.foot === 'plain' || th.foot === 'bar' ? '' : '<i></i>'}</footer>`}
  </section>`;

// Детские книги (оформление 'kid', №116, №117): половина разворота PDF = страница.
// Фон — картинка страницы PDF без текста, текст поверх — настоящий, на тех же местах и с тем же наклоном (SVG в пунктах PDF).
// Строка: [текст, x, y (начало базовой линии), размер, наклон °, цвет, шрифт (номер в T.fonts), длина строки в PDF,
//          выравнивание m|l|r|j, абзац, эффект s (тень) | g (свечение)]
const KID_AR = /[؀-ۿ]/;
const escHTML = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function kidRow(T, [t, x, y, z, a, c, f, len, al = 'm', b = 0, fx = '']) {
  const rtl = KID_AR.test(t), [ff, fw] = T.fonts[f];
  // точка привязки: середина строки, левый или правый край (для арабского «начало» строки справа)
  const X = al === 'm' ? x + len / 2 : al === 'r' ? x + len : x;
  const anchor = al === 'm' ? 'middle' : (al === 'r') !== rtl ? 'end' : 'start';
  return `<text x="${X}" y="${y}" text-anchor="${anchor}"${rtl ? ' direction="rtl" lang="ar"' : ''}${a ? ` transform="rotate(${a} ${x} ${y})"` : ''}` +
    ` fill="${c}" style="font-family:${ff};font-weight:${fw};font-size:${z}px"${fx ? ` class="kid-${fx}"` : ''}` +
    ` data-len="${len}" data-z="${z}" data-al="${al}" data-b="${b}">${escHTML(t)}</text>`;
}
const kidPage = (T, p, i) => `
  <section class="kid-page" data-page="${i + 1}" style="aspect-ratio:${T.w}/${T.h}">
    <img src="${p.bg}" alt="" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async">
    <svg viewBox="0 0 ${T.w} ${T.h}" aria-label="Страница ${i + 1}">${p.rows.map(r => kidRow(T, r)).join('')}</svg>
  </section>`;
// Наш шрифт шире или уже шрифта книги: размер чуть подгоняем, чтобы строка заняла ту же длину, что в PDF (0,8–1,25).
// Строки одного абзаца получают один размер; строки «по ширине» растягиваются пробелами до края, как в книге
function kidFit(svg) {
  const rows = [...svg.querySelectorAll('text')].filter(el => +el.dataset.len >= 20);
  const kOf = el => Math.max(.8, Math.min(1.25, el.dataset.len / el.getComputedTextLength()));
  const blocks = {};
  for (const el of rows) {
    el.k = kOf(el);
    if (+el.dataset.b) (blocks[el.dataset.b] = blocks[el.dataset.b] || []).push(el);
  }
  for (const list of Object.values(blocks)) {
    const ref = list.filter(el => el.dataset.al !== 'j'), ks = (ref.length ? ref : list).map(el => el.k).sort((a, b) => a - b);
    let k = ks[Math.floor((ks.length - 1) / 2)]; // при чётном числе строк — меньшая из средних, чтобы не вылезать
    // строки «по ширине» не должны сжимать пробелы больше чем на 0,05 буквы — иначе слова слипаются
    for (const el of list.filter(el => el.dataset.al === 'j')) {
      const gaps = (el.textContent.match(/ /g) || []).length, w1 = el.getComputedTextLength() / (parseFloat(el.style.fontSize) / el.dataset.z || 1);
      k = Math.min(k, Math.max(.8, el.dataset.len / (w1 - .05 * el.dataset.z * gaps)));
    }
    list.forEach(el => { el.k = k; });
  }
  for (const el of rows) {
    el.style.fontSize = el.dataset.z * el.k + 'px';
    if (el.dataset.al === 'j') {
      const gaps = (el.textContent.match(/ /g) || []).length;
      if (gaps) el.style.wordSpacing = (el.dataset.len - el.getComputedTextLength()) / gaps + 'px';
    }
  }
}

// у книг со своими цветами (Bayt al-Magrifa, детские) выбора цвета бумаги нет
function hideThemes() { const t = document.querySelector('#rd-panel .themes-box'); if (t) t.style.display = 'none'; }

function textScreen(id) {
  const b = bookById(id);
  if (!b || !b.text) return notFound('Книга не найдена', 'Возможно, ссылка устарела. Посмотрите другие книги на главной.');
  return `
    ${rdTopHTML(b.title, `<button class="btn btn-icon" data-action="rd-hint" aria-label="Как смотреть арабский текст" hidden>?</button>`)}
    <article id="bk" lang="ru"></article>
    ${rdBottomHTML('<span id="rd-place"></span>')}`;
}

// Книга с переводом: каждое русское предложение помнит свой арабский оригинал (номер в списке ar)
function trRender(T) {
  const ar = [];
  // [русский текст, арабский]: если арабского нет (null), предложение просто текст без нажатия
  const sents = list => list.map(([ru, a]) => a ? `<span class="tr-s" data-i="${ar.push(a) - 1}">${ru}</span>` : ru).join(' ');
  const html = `<p class="tr-hint">Зажмите предложение на секунду, чтобы увидеть его по-арабски</p>` +
    T.blocks.map(([kind, list]) => {
      if (kind === 'h') return `<h1 class="rd-h tr-h">${sents(list)}</h1>`;
      if (kind === 'h2') return `<h2 class="rd-h">${sents(list)}</h2>`;
      if (kind === 'a') return `<p class="rd-ar" lang="ar" dir="rtl">${list}</p>`; // арабский абзац без перевода
      if (kind === 'n') return `<div class="rd-notes">${list.map(([n, t]) => `<p><sup class="fn">${n}</sup> ${t}</p>`).join('')}</div>`;
      return `<p class="rd-p${kind === 'b' ? ' tr-b' : ''}${capsHead(list.map(x => x[0]).join(' ')) ? ' rd-caps' : ''}">${sents(list)}</p>`;
    }).join('');
  return { html: honHtml(html, T), ar };
}

// Обычная книга из Word без перевода: цвет «Бумага», заголовки, абзацы, арабские вставки, сноски под абзацем
// Книга-скан (№122, режим 'g'): страницы-картинки тяжёлые, а встроенная «ленивая» загрузка у разных версий iOS/Chrome срабатывает по-разному (на новом iPhone медленнее),
// поэтому загрузкой управляем сами: у картинки нет src, адрес лежит в data-src, а src выдаётся странице, которая не дальше 3000 px под экраном (≈ 5–6 страниц вперёд)
// или 1500 px над ним. Возвращает функцию «отключить». Без IntersectionObserver — выдаёт адреса всем сразу.
function loadAhead(box) {
  const imgs = [...box.querySelectorAll('img[data-src]')];
  if (!imgs.length) return null;
  const go = i => { if (!i.src) { i.src = i.dataset.src; i.alt = 'Скан страницы оригинала'; } };
  if (!window.IntersectionObserver) { imgs.forEach(go); return null; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { go(e.target); io.unobserve(e.target); } }), { rootMargin: '1500px 0px 3000px 0px' });
  imgs.forEach(i => io.observe(i));
  return () => io.disconnect();
}
function plainRender(T, first = true) { // first: это начало книги (у нарезанных книг страницы идут по кускам, титульная часть только на первой)
  const ar = h => `lang="ar" dir="rtl">${h}`;
  let front = first; // титульная часть: всё до первого абзаца идёт по центру, как титульный лист
  return honHtml(T.blocks.map(([k, a, b, c, d], i) => {
    if (front && (k === 'p' || k === 'li' || k === 'n')) front = false;
    if (front && (k === 'h1' || k === 'h2' || k === 'h3' || k === 'c')) return `<p class="rd-front rd-front-${i === 0 ? 'h1' : k}">${a}</p>`;
    switch (k) {
      case 'hr': return '<hr class="rd-hr">';
      case 'sc': { // скан из Word (.claude/word-img.js): a — файл, b×c — размер, d — режим: 'f' на всю ширину, 'm' цветной титул (без приближения), 'sNN' маленькая, NN% ширины текста, 'g' страница книги-скана до краёв экрана (без приближения, №122)
        const small = d && d[0] === 's';
        return `<figure class="rd-sc rd-sc-${small ? 's' : d}"${small ? ` style="--sc:${d.slice(1)}%"` : ''}${d === 'm' || d === 'g' ? '' : ' data-z'}>${d === 'g' ? `<img data-src="${a}" width="${b}" height="${c}" alt="" decoding="async">` : `<img src="${a}" width="${b}" height="${c}" alt="Скан страницы оригинала" loading="lazy" decoding="async">`}</figure>`;
      }
      case 'sep': return '<p class="rd-sep" aria-hidden="true">* * *</p>';
      case 'h1': return `<h1 class="rd-h rd-h1">${a}</h1>`;
      case 'h2': return `<h2 class="rd-h">${a}</h2>`;
      case 'h3': return `<h3 class="rd-h3">${a}</h3>`;
      case 'c': return `<p class="rd-p rd-c">${a}</p>`;
      case 'arc': return `<p class="rd-ar rd-ar-c" ${ar(a)}</p>`;
      case 'ar': return `<p class="rd-ar" ${ar(a)}</p>`;
      case 'arh': return `<p class="rd-ar-h rd-ar-c" ${ar(a)}</p>`;
      case 'li': return `<p class="rd-p rd-li"><span class="rd-n">${a}</span><span>${b}</span></p>`;
      case 'n': return `<div class="rd-notes">${a.map(([n, t]) => `<p><sup class="fn">${n}</sup> ${t}</p>`).join('')}</div>`;
      default: return `<p class="rd-p${capsHead(a) ? ' rd-caps' : ''}">${a}</p>`;
    }
  }).join(''), T);
}

// Окно приближения скана (Word-книги): нажали на картинку → она на весь экран.
// Одним пальцем двигать, двумя приближать, двойное нажатие — в 2 раза крупнее / обратно, × или «Назад» закрывает
let scanView = null;
function closeScan() { if (!scanView) return false; scanView.remove(); scanView = null; return true; }
function openScan(src) {
  closeScan();
  const lb = scanView = document.createElement('div');
  lb.className = 'sc-view';
  lb.innerHTML = `<img src="${src}" alt="Скан страницы оригинала" draggable="false"><button class="sc-x" aria-label="Закрыть">×</button><div class="sc-hint">Двумя пальцами — приблизить. Двойное нажатие — крупнее.</div>`;
  document.body.appendChild(lb);
  const im = lb.firstChild, hint = lb.lastChild, pts = new Map();
  let S = 1, S0 = 1, X = 0, Y = 0, pinch = null, travel = 0, lastTap = 0;
  const apply = () => { // картинка не уезжает за край; если меньше экрана — по центру
    const w = im.naturalWidth * S, h = im.naturalHeight * S;
    X = w <= innerWidth ? (innerWidth - w) / 2 : Math.min(0, Math.max(innerWidth - w, X));
    Y = h <= innerHeight ? (innerHeight - h) / 2 : Math.min(0, Math.max(innerHeight - h, Y));
    im.style.transform = `translate(${X}px,${Y}px) scale(${S})`;
  };
  const fit = () => { im.style.width = im.naturalWidth + 'px'; S0 = S = Math.min(innerWidth / im.naturalWidth, innerHeight / im.naturalHeight); X = Y = 0; apply(); };
  const zoomAt = (cx, cy, ns) => { ns = Math.min(Math.max(ns, S0), S0 * 6); X = cx - (cx - X) * ns / S; Y = cy - (cy - Y) * ns / S; S = ns; apply(); };
  if (im.complete && im.naturalWidth) fit(); else im.onload = fit;
  setTimeout(() => hint.classList.add('off'), 3500);
  lb.querySelector('.sc-x').addEventListener('click', closeScan);
  lb.addEventListener('pointerdown', e => {
    if (e.target.closest('.sc-x')) return;
    lb.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); travel = 0;
    if (pts.size === 2) { const [p, q] = [...pts.values()]; pinch = { d: Math.hypot(p[0] - q[0], p[1] - q[1]), s: S }; }
  });
  lb.addEventListener('pointermove', e => {
    const o = pts.get(e.pointerId); if (!o) return;
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2 && pinch) { const [p, q] = [...pts.values()]; travel += 9; zoomAt((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, pinch.s * Math.hypot(p[0] - q[0], p[1] - q[1]) / pinch.d); }
    else if (pts.size === 1) { const dx = e.clientX - o[0], dy = e.clientY - o[1]; travel += Math.abs(dx) + Math.abs(dy); X += dx; Y += dy; apply(); }
  });
  const up = e => {
    const was = pts.size; pts.delete(e.pointerId); if (pts.size < 2) pinch = null;
    if (was !== 1 || travel > 8) return;
    const t = Date.now();
    if (t - lastTap < 320) { zoomAt(e.clientX, e.clientY, S > S0 * 1.2 ? S0 : S0 * 2); lastTap = 0; } else lastTap = t;
  };
  lb.addEventListener('pointerup', up); lb.addEventListener('pointercancel', up);
  lb.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, S * (e.deltaY < 0 ? 1.2 : 1 / 1.2)); }, { passive: false }); // колесо мыши (компьютер)
}
document.addEventListener('click', e => { const f = e.target.closest('.rd-sc[data-z]'); if (f) openScan(f.firstChild.currentSrc || f.firstChild.src); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeScan(); });
addEventListener('hashchange', closeScan);

// Зажатие предложения (~0,8 с): оно подсвечивается жёлтым, рядом всплывает плашка с арабским.
// Обычное касание (и листание) ничего не открывает; касание в любое место закрывает плашку, подсветка гаснет через 2,5 секунды
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
  let timer = 0, press = null, shownAt = 0;
  const HOLD = 800;
  const cancel = () => { clearTimeout(timer); timer = 0; press = null; };
  const down = e => {
    const s = e.target.closest('.tr-s');
    if (!s || (e.pointerType === 'mouse' && e.button !== 0)) return;
    press = { s, x: e.clientX, y: e.clientY };
    timer = setTimeout(() => { const pr = press; cancel(); if (pr) { hide(); show(pr.s, pr.x); shownAt = Date.now(); } }, HOLD);
  };
  const move = e => { if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) cancel(); }; // человек листает
  const onTap = () => { if (open && Date.now() - shownAt > 400) hide(); }; // обычное касание закрывает; «отпускание» после зажатия не считается
  const noMenu = e => { if (e.target.closest('.tr-s')) e.preventDefault(); }; // без системного меню «Копировать» при долгом нажатии
  box.addEventListener('pointerdown', down);
  addEventListener('pointermove', move);
  addEventListener('pointerup', cancel);
  addEventListener('pointercancel', cancel);
  addEventListener('scroll', cancel, { passive: true });
  box.addEventListener('contextmenu', noMenu);
  document.addEventListener('click', onTap);
  return () => {
    cancel();
    box.removeEventListener('pointerdown', down); box.removeEventListener('contextmenu', noMenu);
    removeEventListener('pointermove', move); removeEventListener('pointerup', cancel); removeEventListener('pointercancel', cancel); removeEventListener('scroll', cancel);
    document.removeEventListener('click', onTap); pop.remove();
  };
}

// Огромные книги (оформление 'pg', «невидимая нарезка»): для читателя это одна сплошная книга, внутри она разрезана.
// Текст лежит кусками по ~20 страниц (T.parts → data/texts/N/…); все страницы сразу стоят пустыми «заготовками» нужной высоты,
// настоящими (pgPage) становятся только страницы рядом с экраном, далёкие снова превращаются в заготовки той же высоты.
// Пока страница не нарисована, её высота приблизительная (по числу букв T.wt); при подмене страницы выше экрана прокрутку сдвигаем на разницу, текст под глазами не прыгает.
// Место запоминаем как «номер страницы + доля внутри неё»: textPos[id] = {p, f}. Возвращает функцию уборки.
function mountChunked(id, T, box, ui) {
  const N = T.n, th = T.theme, plainBook = T.style === 'plain', C0 = plainBook ? 0 : 200; // C0 — шапка, номер и отступы страницы, в «буквах». plainBook: Word-книга без страниц, «страница» — группа абзацев
  const chunkOf = i => T.parts.findIndex(p => i >= p[1] && i <= p[2]);
  const data = [], loading = [], els = [], hs = new Array(N).fill(0), seen = new Set(); // hs — высота страницы, замеренная при уборке; seen — страницы, нарисованные сейчас
  const openedAt = Date.now();
  let alive = true, ready = false, raf = 0, t = 0, saveTimer = 0, fitK = 0, fitAt = 0, sig = '', anchor = { p: 0, f: 0 }, pct = 0, pinI = 0, pinY = 0; // pinI/pinY — страница у верха экрана и её положение на документе после прошлого кадра
  const docTop = e => e.getBoundingClientRect().top + scrollY;
  const unit = () => plainBook ? reader.fs : parseFloat(getComputedStyle(box).fontSize) || 18;
  const guessK = () => (plainBook ? 0.8 : 0.62) * unit() * unit() / Math.max(120, box.clientWidth - 40); // высота страницы на одну букву: межстрочный × размер × средняя буква / ширина строки
  const est = i => Math.round(fitK * (T.wt[i] + C0));
  const mk = i => { const s = document.createElement('section'); s.className = (plainBook ? 'rd-pg' : 'pg-page') + ' pg-ph'; s.dataset.page = i + 1; s.style.height = (hs[i] || est(i)) + 'px'; return s; };
  const layoutKey = () => box.clientWidth + '|' + reader.fs;
  const calibrate = () => { // уточняем «высоту на букву» по нарисованным страницам
    let h = 0, w = 0;
    for (const i of seen) if (T.wt[i] >= 400) { h += els[i].offsetHeight; w += T.wt[i] + C0; } // титулы и пустые страницы (мало букв, но высота страницы) в образец не берём
    if (w) fitK = h / w;
  };
  const refit = () => { fitAt = fitK; for (let i = 0; i < N; i++) if (!seen.has(i) && !hs[i]) els[i].style.height = est(i) + 'px'; }; // заготовки, которые ещё не замеряли, получают новую оценку
  const render = i => {
    const k = chunkOf(i), tp = document.createElement('template');
    tp.innerHTML = plainBook ? `<section class="rd-pg" data-page="${i + 1}">${plainRender({ blocks: data[k][i - T.parts[k][1]], hon: T.hon }, i === 0)}</section>` : pgPage(data[k][i - T.parts[k][1]], i, th);
    const e = tp.content.firstElementChild;
    els[i].replaceWith(e); els[i] = e; seen.add(i);
    e.querySelectorAll('.pg-p').forEach(hyphenate);
    fitFront(e);
  };
  const unrender = (i, h) => { hs[i] = h; const p = mk(i); els[i].replaceWith(p); els[i] = p; seen.delete(i); };
  const load = k => k < 0 || k >= T.parts.length ? Promise.resolve() : (loading[k] = loading[k] || new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = T.dir + T.parts[k][0];
    s.onload = () => { data[k] = window.TEXTP[id + '.' + k]; ok(); };
    s.onerror = () => { loading[k] = null; s.remove(); no(); };
    document.head.appendChild(s);
  }));
  const save = () => {
    store.set('progress', { ...store.get('progress', {}), [id]: Math.max(pct, 1) });
    store.set('textPos', { ...store.get('textPos', {}), [id]: { p: anchor.p, f: +anchor.f.toFixed(4) } });
    noteReading(id, pct, openedAt, pct >= 100);
  };
  const schedule = () => { if (!raf && alive) raf = requestAnimationFrame(tick); };
  function tick() {
    raf = 0;
    if (!alive) return;
    if (ready) { const d = docTop(els[pinI]) - pinY; if (Math.abs(d) > 0.5) scrollBy(0, d); } // выше экрана что-то изменило высоту без нас (шрифт дозагрузился, картинка): возвращаем текст на место
    const y = scrollY, vh = innerHeight;
    // t — страница у верхнего края экрана, c — страница по центру («Стр. N из M»), a…b — страницы от двух экранов выше до двух экранов ниже видимого
    while (t > 0 && docTop(els[t]) > y + 1) t--;
    while (t < N - 1 && docTop(els[t + 1]) <= y + 1) t++;
    let c = t, a = t, b;
    while (c < N - 1 && docTop(els[c + 1]) < y + vh / 2) c++;
    while (a > 0 && docTop(els[a]) > y - 2 * vh) a--;
    for (b = c; b < N - 1 && docTop(els[b + 1]) < y + 3 * vh;) b++;
    // сначала всё читаем (раскладка чистая), потом меняем страницы, потом один раз читаем снова: так браузер раскладывает книгу один раз за кадр
    const a0 = els[t].getBoundingClientRect().top;
    const gone = [...seen].filter(i => i < a - 3 || i > b + 3).map(i => [i, els[i].offsetHeight]);
    let did = 0, pend = 0;
    const want = [];
    for (let i = a; i <= b; i++) if (!seen.has(i)) { const r = els[i].getBoundingClientRect(); want.push([i, r.bottom > 0 && r.top < vh]); } // второе — страница уже видна на экране
    want.sort((p, q) => Math.abs(p[0] - t) - Math.abs(q[0] - t));
    for (const [i, h] of gone) unrender(i, h);
    for (const [i, vis] of want) {
      const k = chunkOf(i);
      if (!data[k]) { load(k).then(() => alive && schedule(), () => {}); pend++; } else if (vis || !did) { render(i); did++; } else pend++; // заранее рисуем по одной странице за кадр, видимую на экране — сразу
    }
    let shift = els[t].getBoundingClientRect().top - a0;
    if (did) { calibrate(); if (Math.abs(fitK / fitAt - 1) > 0.12) { refit(); shift = els[t].getBoundingClientRect().top - a0; } } // оценку остальных заготовок обновляем, только когда она заметно разошлась
    if (Math.abs(shift) > 0.5) scrollBy(0, shift); // страницы выше экрана изменили высоту — возвращаем текст на то же место
    const k = chunkOf(t); // соседние куски подгружаем заранее
    if (t - T.parts[k][1] <= 6) load(k - 1).catch(() => {});
    if (T.parts[k][2] - t <= 6) load(k + 1).catch(() => {});
    const y2 = scrollY, h = els[t].offsetHeight || 1, f = Math.min(1, Math.max(0, (y2 - docTop(els[t])) / h));
    pct = y2 >= document.documentElement.scrollHeight - vh - 2 ? 100 : Math.min(99, Math.round((t + f) / N * 100));
    anchor = { p: t, f }; pinI = t; pinY = docTop(els[t]);
    ui.bar.style.width = pct + '%'; ui.pct.textContent = pct + '%'; syncSeek(pct); if (!plainBook) ui.place.textContent = `Стр. ${c + 1} из ${N}`; // у Word-книг страниц нет, только процент
    if (ready) { clearTimeout(saveTimer); saveTimer = setTimeout(save, 300); } // сохраняем, когда человек перестал листать
    if (pend) schedule();
  }
  const relayout = () => { // «Аа» или поворот телефона: высоты страниц стали другими
    if (!alive || !ready || layoutKey() === sig) return;
    sig = layoutKey();
    for (let i = 0; i < N; i++) if (!seen.has(i)) hs[i] = 0;
    fitK = 0; calibrate(); if (!fitK) fitK = guessK();
    refit();
    const e = els[anchor.p];
    scrollTo(0, docTop(e) + anchor.f * e.offsetHeight);
    pinI = anchor.p; pinY = docTop(e);
    schedule();
  };
  const ro = new ResizeObserver(() => { relayout(); schedule(); });

  fitK = guessK(); sig = layoutKey();
  const fr = document.createDocumentFragment();
  for (let i = 0; i < N; i++) fr.appendChild(els[i] = mk(i));
  box.replaceChildren(fr);
  (async () => {
    // шрифт книги грузим до первой страницы (все его куски: кириллица, латиница, диакритика): иначе текст перерисуется и сдвинется, когда шрифт приедет
    const ff = (th && th.font) || (plainBook ? 'Literata' : 'Source Serif 4');
    await Promise.race([Promise.all(['400', '700', 'italic 400', 'italic 700'].map(w => document.fonts.load(`${w} 16px "${ff}"`, 'АаБбҐӢAaĀāŠšḤḥ’‘“”′—…№').catch(() => {}))), new Promise(r => setTimeout(r, 4000))]);
    const saved = store.get('textPos', {})[id];
    let p = 0, f = 0;
    if (saved && typeof saved === 'object') { p = Math.min(N - 1, Math.max(0, saved.p | 0)); f = +saved.f || 0; } else if (typeof saved === 'number') p = Math.min(N - 1, Math.floor(saved * N));
    try { await load(chunkOf(p)); } catch (e) { if (alive) box.innerHTML = '<p class="soon">Не получилось загрузить книгу. Проверьте интернет и откройте её снова.</p>'; return; }
    if (!alive) return;
    t = p; render(p);
    calibrate(); refit();
    if (p || f) scrollTo(0, docTop(els[p]) + f * els[p].offsetHeight); // открыли с начала — остаёмся наверху
    pinI = p; pinY = docTop(els[p]);
    ready = true;
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('readerchange', relayout);
    document.fonts.addEventListener('loadingdone', schedule); // дозагрузился ещё один кусок шрифта: следующий кадр вернёт текст на место
    ro.observe(box);
    tick();
  })();
  return () => {
    alive = false;
    if (ready) { clearTimeout(saveTimer); save(); }
    removeEventListener('scroll', schedule); removeEventListener('readerchange', relayout);
    document.fonts.removeEventListener('loadingdone', schedule);
    ro.disconnect(); cancelAnimationFrame(raf);
  };
}

// Показываем книгу, следим за прокруткой: процент, «Стр. N из M», запоминаем место
function mountText(id) {
  const b = bookById(id);
  if (!b || !b.text) return;
  let alive = true, timer, stopTr = null, stopChunks = null;
  const box = document.getElementById('bk');
  const bar = document.getElementById('rd-bar');
  const pct = document.getElementById('rd-pct');
  const place = document.getElementById('rd-place');
  const scrollable = () => document.documentElement.scrollHeight - innerHeight;
  const current = () => scrollable() > 0 ? Math.min(100, Math.round(scrollY / scrollable() * 100)) : 0;
  let pages = [];
  const openedAt = Date.now(); // когда открыли книгу (для «Читаю»: около минуты чтения)

  function show() {
    const p = current();
    bar.style.width = p + '%'; pct.textContent = p + '%'; syncSeek(p);
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
      noteReading(id, current(), openedAt, scrollY >= scrollable() - 2);
    }, 300);
  }

  readerStyle = null; // пока книга грузится и у обычных книг: цвет бумаги по выбору читателя
  applyReader();
  const stopUI = mountReaderUI();
  loadText(b).then(T => {
    if (!alive) return; // человек уже ушёл с экрана
    if (T.parts) { // огромная книга, «невидимая нарезка»: свой показ и своё запоминание места (mountChunked)
      const wordBook = T.style === 'plain'; // Word-книга: цвет бумаги по выбору читателя, без своей темы
      if (!wordBook) { readerStyle = 'pg'; applyReader(); pgTheme(box, T.theme); }
      box.className = wordBook ? 'rd pg-lazy' : 'pg pg-lazy';
      stopChunks = mountChunked(id, T, box, { bar, pct, place });
      return;
    }
    if (T.style === 'bm') { // оригинальное оформление Bayt al-Magrifa: страницы с шапкой
      readerStyle = 'bm';
      applyReader();
      hideThemes(); // у этих книг свои цвета
      box.className = 'bm';
      bmTheme(box, T.theme);
      box.innerHTML = T.pages.map((p, i) => bmPage(T, p, i + 1)).join('');
      box.querySelectorAll('.bm-p').forEach(hyphenate);
      pages = [...box.querySelectorAll('.bm-page')];
    } else if (T.style === 'pg') { // одна страница PDF = одна страница на экране
      readerStyle = 'pg';
      applyReader();
      box.className = 'pg';
      pgTheme(box, T.theme);
      box.innerHTML = T.pages.map((p, i) => pgPage(p, i, T.theme)).join('');
      box.querySelectorAll('.pg-p').forEach(hyphenate);
      fitFront(box);
      pages = [...box.querySelectorAll('.pg-page')];
    } else if (T.style === 'kid') { // детская книга: картинка страницы + настоящий текст поверх
      readerStyle = 'kid';
      applyReader();
      hideThemes();
      box.className = 'kid';
      document.body.style.setProperty('--rb', T.bg);
      paintTelegramBars();
      const aa = document.querySelector('[data-action="rd-panel"]');
      if (aa) aa.classList.add('dim'); // размер задан страницей книги: «Aa» приглушена и не нажимается
      box.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
        <filter id="kid-sh" x="-5%" y="-30%" width="110%" height="160%"><feDropShadow dx=".6" dy=".9" stdDeviation=".9" flood-color="#000" flood-opacity=".37"/></filter>
        <filter id="kid-gl" x="-5%" y="-40%" width="110%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="2.2" flood-color="#fff" flood-opacity=".8"/></filter>
        </defs></svg>` + T.pages.map((p, i) => kidPage(T, p, i)).join('');
      pages = [...box.querySelectorAll('.kid-page')];
      // сначала шрифты книги (русские и арабские буквы), потом подгонка длины строк
      Promise.all(T.fonts.map(([ff, fw]) => document.fonts.load(`${fw} 16px ${ff}`, 'Аа بس 1').catch(() => {})))
        .then(() => { if (alive) box.querySelectorAll('.kid-page svg').forEach(kidFit); });
    } else if (T.style === 'plain') { // обычная книга без перевода: цвет «Бумага»
      box.className = 'rd';
      box.innerHTML = plainRender(T);
    } else { // книга с переводом: цвет «Бумага», по нажатию арабский текст предложения
      box.className = 'rd tr';
      const hb = document.querySelector('[data-action="rd-hint"]');
      if (hb) { hb.hidden = false; document.querySelector('.rd-top').classList.add('has-hint'); }
      const { html, ar } = trRender(T);
      box.innerHTML = html;
      stopTr = mountTranslation(box, ar);
    }
    // Возвращаем на место, где человек остановился (после загрузки шрифтов, иначе высота текста другая)
    document.fonts.ready.then(() => {
      if (!alive) return;
      const pos = store.get('textPos', {})[id] || 0;
      if (pos > 0) scrollTo(0, pos * scrollable());
      if (T.style === 'plain') stopTr = loadAhead(box); // у книги-скана страницы качаются заранее (для остальных plain-книг ничего не делает)
      show();
      addEventListener('scroll', onScroll, { passive: true });
    });
  }).catch(() => { if (alive) box.innerHTML = '<p class="soon">Не получилось загрузить книгу. Проверьте интернет и откройте её снова.</p>'; });

  // уборка при уходе с экрана
  return () => {
    alive = false;
    removeEventListener('scroll', onScroll);
    if (stopUI) stopUI();
    if (stopTr) stopTr();
    if (stopChunks) stopChunks();
    readerStyle = null;
    ['--rb', '--rt', '--rm', '--rr'].forEach(v => document.body.style.removeProperty(v));
    const aa = document.querySelector('[data-action="rd-panel"]');
    if (aa) aa.classList.remove('dim');
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
/* ---------- «Ещё»: О приложении, Поделиться, О разработчике ---------- */
const DEV_TG = 'https://t.me/abusufyan_tech';  // личные сообщения разработчика
const DEV_CH = 'https://t.me/abusufyan_it';    // канал разработчика

// Строка меню без рамок: значок, текст, стрелка
const menuRow = (attrs, ic, title, sub = '') =>
  `<${attrs.startsWith('href') ? 'a' : 'button'} class="mrow" ${attrs}>${icon(ic)}<span class="mr-t"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span>${icon('next')}</${attrs.startsWith('href') ? 'a' : 'button'}>`;

function moreScreen() {
  return `
    <div class="topbar"><a class="btn btn-icon" href="#/" aria-label="Назад">${icon('back')}</a></div>
    <h1 class="title">Ещё</h1>
    ${menuRow('href="#/about"', 'info', 'О приложении')}
    ${menuRow('data-action="share-app"', 'share', 'Поделиться приложением')}
    <div class="sec-h dev-h"><h2>О разработчике</h2></div>
    <p class="dev-t">Ассаляму алейкум! Меня зовут Абу Суфьян, я создал это приложение для канала Bayt al-Magrifa.</p>
    ${menuRow(`href="${DEV_TG}" target="_blank" rel="noopener" data-tglink`, 'send', 'Написать мне', 'Telegram')}
    ${menuRow(`href="${DEV_CH}" target="_blank" rel="noopener" data-tglink`, 'megaphone', 'Мой канал', 'Telegram')}`;
}

function aboutScreen() {
  return `
    ${topbar()}
    <h1 class="title">О приложении</h1>
    <p class="ab-t">Это бесплатная библиотека исламских книг: ${booksCount(BOOKS.length)} в ${window.CATEGORIES.length} категориях. Читайте прямо в Telegram, выбирайте цвет страницы и размер шрифта: приложение запомнит, где вы остановились. В части книг арабский оригинал открывается удержанием предложения.</p>
    <div class="ab-web">${icon('smartphone')}<p>Это приложение можно использовать и как веб-приложение: добавьте его на экран «Домой», и оно будет открываться само, без Telegram.</p></div>
    <p class="ab-wish">Распространяйте это приложение во благо и будьте причиной распространения знаний.</p>`;
}

const ROUTES = [
  { re: /^#?\/?$/,                 tab: 'home',   view: homeScreen, mount: mountHome },
  { re: /^#\/search(?:\/cat\/(.+))?$/, tab: 'search', view: searchScreen, mount: mountSearch },
  { re: /^#\/start$/,             tab: 'home',   view: startScreen,  back: true },
  { re: /^#\/book\/(\d+)$/,        tab: 'home',   view: bookScreen,   back: true },
  { re: /^#\/author\/(.+)$/,       tab: 'home',   view: authorScreen, back: true },
  { re: /^#\/shelf(?:\/(reading|fav|want|done))?$/, tab: 'shelf', view: shelfScreen, mount: mountShelf },
  { re: /^#\/read\/(\d+)$/,        tab: 'home',   view: readIntroScreen, back: true },
  { re: /^#\/more$/,               tab: 'more',   view: moreScreen },
  { re: /^#\/about$/,              tab: 'more',   view: aboutScreen, back: true },
  { re: /^#\/sample$/,             tab: null,    view: sampleScreen, mount: mountSample, back: true },
  { re: /^#\/text\/(\d+)$/,        tab: null,     view: textScreen,   mount: mountText,   back: true }
];
// back: на этом экране показываем кнопку «Назад» (в Telegram это кнопка в его шапке)

function renderTabbar(active) {
  const tab = (href, name, label, key) =>
    `<a class="tab ${active === key ? 'on' : ''}" href="${href}">${icon(name)}${label}</a>`;
  document.getElementById('tabbar').innerHTML = `<div class="tabbar-in">
    ${tab('#/', 'home', 'Главная', 'home')}
    ${tab('#/search', 'search', 'Поиск', 'search')}
    ${tab('#/shelf', 'library', 'Моя полка', 'shelf')}
    ${tab('#/more', 'more', 'Ещё', 'more')}</div>`;
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

document.addEventListener('input', e => { // ползунок размера шрифта
  if (e.target.id !== 'fs-range') return;
  reader.fs = Number(e.target.value); store.set('reader', reader); applyReader(true);
});

document.addEventListener('click', e => {
  const t = e.target;
  if (t.closest(TAPPABLE)) haptic();
  if (t.closest('[data-action="open-look"]')) return openLookSheet();
  if (t.closest('[data-action="add-home"]')) return openHomeSheet();
  if (t.closest('[data-action="open-web"]')) { closeSheet(); return tg.openLink(location.origin + '/'); } // внешний браузер, без хвоста Telegram в адресе
  if (t.closest('[data-action="close-sheet"]')) return closeSheet();
  if (t.closest('#scrim')) return closeSheet();
  if (t.closest('[data-action="back"]')) return goBack();

  // Читалка: панель «Aa» (тема и размер шрифта)
  if (t.closest('[data-action="rd-panel"]')) return document.body.classList.toggle('rd-panel-open');
  if (t.closest('[data-action="rd-close"]')) return document.body.classList.remove('rd-panel-open');
  if (t.closest('[data-action="rd-hint"]')) return toast('Зажмите предложение на секунду: появится арабский текст', 4500);
  const rt = t.closest('[data-rtheme]');
  if (rt) { reader.theme = rt.dataset.rtheme; store.set('reader', reader); return applyReader(true); }
  const fs = t.closest('[data-fs]');
  if (fs) {
    reader.fs = Math.min(FS_MAX, Math.max(FS_MIN, reader.fs + Number(fs.dataset.fs)));
    store.set('reader', reader);
    return applyReader(true);
  }
  if (t.closest('.rd, .bm')) document.body.classList.remove('rd-panel-open'); // нажал на текст: панель прячем

  const unr = t.closest('[data-action="unread"]');
  if (unr) { unread(Number(unr.dataset.id)); closeSheet(); return router(); }
  const rst = t.closest('[data-action="restart"]');
  if (rst) { const id = Number(rst.dataset.id); restartBook(id); location.hash = readHref(bookById(id)); return; }

  const share = t.closest('[data-action="share"]');
  if (share) return shareBook(Number(share.dataset.id));
  if (t.closest('[data-action="share-app"]')) return shareApp();

  // Ссылки на t.me внутри Telegram открываем средствами самого Telegram (в браузере остаётся обычная ссылка)
  const tgl = t.closest('[data-tglink]');
  if (tgl && inTG) { e.preventDefault(); return tg.openTelegramLink(tgl.href); }

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

// «Кладовщик» на телефоне (sw.js): хранит куски огромных книг. Где недоступен (например, в части версий Telegram) — просто не нужен, книги грузятся как обычно.
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
