import { newGame, get, set, isSolved, save, load } from './sudoku.js';

// Texts from LanguagePack(PL).properties plus the alert strings from GamingArena.
const TEXT = {
  en: {
    b2: 'Easy', b3: 'Medium', b4: 'Hard', b5: 'Polish', b6: 'English', b7: 'Run Saved Game',
    verifyButton: 'Check', saveGame: 'Save', homeButton: 'Back', languages: 'Languages', difficulty: 'Difficulty',
    right: 'Well Done', wrong: 'Wrong!', tryAgain: 'Try Again!', ok: 'I understand!', saved: 'Saved ✓',
  },
  pl: {
    b2: 'Łatwy', b3: 'Średni', b4: 'Trudny', b5: 'Polski', b6: 'English', b7: 'Wczytaj Zapis',
    verifyButton: 'Sprawdz', saveGame: 'Zapisz', homeButton: 'Powrót', languages: 'Jezyki', difficulty: 'Poziom',
    right: 'Brawo', wrong: 'ŹLE!', tryAgain: 'SPRÓBUJ PONOWNIE', ok: 'Zrozumiałem!', saved: 'Zapisano ✓',
  },
};
let lang = 'en';
const t = (key) => TEXT[lang][key];
const $ = (id) => document.getElementById(id);

function translate() {
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll('[data-t]')) el.textContent = t(el.dataset.t);
}

function show(screen) {
  $('menu').hidden = screen !== 'menu';
  $('game').hidden = screen !== 'game';
}

// Board: 81 inputs (kept in row-major order) placed into nine 3x3 boxes, given digits are read-only.
const boxes = Array.from({ length: 9 }, () => document.createElement('div'));
$('board').append(...boxes);
const cells = [];
let givens = '';
for (let i = 0; i < 81; i++) {
  const row = Math.floor(i / 9), col = i % 9;
  const cell = document.createElement('input');
  cell.inputMode = 'numeric';
  cell.autocomplete = 'off';
  cell.ariaLabel = `row ${row + 1}, column ${col + 1}`;
  cell.addEventListener('input', () => {
    cell.value = cell.value.replace(/[^1-9]/g, '').slice(-1);
    set(row, col, Number(cell.value));
  });
  cell.addEventListener('keydown', (e) => {
    const step = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (step) {
      e.preventDefault();
      cells[(i + step + 81) % 81].focus();
    }
  });
  cells.push(cell);
  boxes[Math.floor(row / 3) * 3 + Math.floor(col / 3)].append(cell);
}

function startGame() {
  cells.forEach((cell, i) => {
    cell.value = get(Math.floor(i / 9), i % 9) || '';
    cell.readOnly = givens[i] === '1';
  });
  show('game');
  cells.find((cell) => !cell.readOnly)?.focus();
}

for (const button of document.querySelectorAll('[data-level]')) {
  button.onclick = () => {
    newGame(Number(button.dataset.level));
    givens = cells.map((_, i) => (get(Math.floor(i / 9), i % 9) ? '1' : '0')).join('');
    startGame();
  };
}

for (const button of document.querySelectorAll('[data-lang]')) {
  button.onclick = () => {
    lang = button.dataset.lang;
    translate();
  };
}

const savedGame = () => JSON.parse(localStorage.getItem('sudoku') || 'null');
$('load').disabled = !savedGame();
$('load').onclick = () => {
  const saved = savedGame();
  load(saved.state);
  givens = saved.givens;
  startGame();
};

$('save').onclick = () => {
  localStorage.setItem('sudoku', JSON.stringify({ state: save(), givens }));
  $('load').disabled = false;
  $('save').textContent = t('saved');
  setTimeout(() => ($('save').textContent = t('saveGame')), 1200);
};

$('check').onclick = () => {
  const solved = isSolved();
  $('msg').querySelector('h3').textContent = t(solved ? 'right' : 'wrong');
  $('msg').querySelector('p').textContent = solved ? '' : t('tryAgain');
  $('msg').showModal();
};

$('back').onclick = () => show('menu');

// The JavaFX version looped audio.mp3 from the start; browsers block autoplay, so it's a toggle.
// The 6 MB file is only downloaded on the first click.
let music;
$('music').onclick = () => {
  music ??= Object.assign(new Audio('audio.mp3'), { loop: true });
  if (music.paused) music.play();
  else music.pause();
  $('music').classList.toggle('on', !music.paused);
};
