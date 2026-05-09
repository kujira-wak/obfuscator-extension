'use strict';
// popup.js — Obfuscator

// ── 言語検出 ────────────────────────────────────────────────
const isJa = navigator.language.startsWith('ja');
document.documentElement.lang = isJa ? 'ja' : 'en';

const MAX_WORDS = 30;

// ── i18n ────────────────────────────────────────────────────
const T = {
  toggleLabel:  isJa ? 'ON / OFF'                        : 'ON / OFF',
  wordsLabel:   isJa ? 'キーワード'                       : 'Keywords',
  maskOn:       isJa ? '🙈 隠す'                          : '🙈 Hide',
  maskOff:      isJa ? '👁 表示'                          : '👁 Show',
  addBtn:       isJa ? '＋ 追加'                          : '＋ Add word',
  applyBtn:     isJa ? 'ページに適用'                      : 'Apply to page',
  applied:      isJa ? '適用しました'                      : 'Applied',
  reloadMsg:    isJa ? 'ページを再読み込みしてください'    : 'Please reload the page',
  saveErr:      isJa ? '保存できませんでした'              : 'Failed to save',
  tooMany:      isJa ? `最大 ${MAX_WORDS} 件まで`         : `Up to ${MAX_WORDS} words`,
  dupRemoved:   isJa ? '重複を除いて適用しました'          : 'Duplicates removed',
  placeholder:  isJa ? '隠したい文字・単語を入力'             : 'text you want to hide …',
  footer:       isJa ? '設定はこのデバイスにのみ保存されます（暗号化）'
                     : 'Settings are encrypted and stored locally only',
};

// ── プライバシー記念日イースターエッグ ──────────────────────
const HOLIDAYS = {
  ja: [
    { month:1,  day:28, before:3, pre:'もうすぐデータプライバシーデー (1/28)',     on:'今日はデータプライバシーデー。'       },
    { month:2,  day:11, before:3, pre:'もうすぐセーファーインターネットデー (2/11)', on:'今日はセーファーインターネットデー。' },
    { month:11, day:30, before:3, pre:'もうすぐコンピュータセキュリティの日 (11/30)', on:'今日はコンピュータセキュリティの日。' },
  ],
  en: [
    { month:1,  day:28, before:3, pre:'Data Privacy Day is coming (Jan 28)',     on:"Today is Data Privacy Day."       },
    { month:2,  day:11, before:3, pre:'Safer Internet Day is coming (Feb 11)',   on:"Today is Safer Internet Day."     },
    { month:11, day:30, before:3, pre:'Computer Security Day is coming (Nov 30)',on:"Today is Computer Security Day."  },
  ],
};

function worldPasswordDay(year) {
  const d = new Date(year, 4, 1);
  d.setDate(1 + ((4 - d.getDay() + 7) % 7));
  return d;
}

function getSplash() {
  const today = new Date(); today.setHours(0,0,0,0);
  const m = today.getMonth(), d = today.getDate(), year = today.getFullYear();
  const lang = isJa ? 'ja' : 'en';

  // ── イースターエッグ日 ──────────────────────────────────
  // エイプリルフール (4/1)
  if (m === 3 && d === 1)
    return isJa ? '本日限り、全文字が自動で隠れます（嘘）'
               : 'All text hides itself today. Auto-mode. (jk)';

  // 円周率の日 (3/14)
  if (m === 2 && d === 14)
    return isJa ? '今日は円周率の日 — 3.14159265…'
               : 'Happy π Day — 3.14159265…';

  // プログラマーの日 (256日目 = 9/13 平年 / 9/12 うるう年)
  const start = new Date(year, 0, 1);
  const dayOfYear = Math.floor((today - start) / 86_400_000) + 1;
  if (dayOfYear === 256)
    return isJa ? '今日はプログラマーの日 (256日目)'
               : "Happy Programmer's Day (day 256)";

  // ── プライバシー記念日 ───────────────────────────────────
  if (m === 9) return isJa ? '今月はサイバーセキュリティ啓発月間。' : "It's Cybersecurity Awareness Month.";
  if (m === 8) {
    const left = Math.ceil((new Date(year, 9, 1) - today) / 86_400_000);
    if (left <= 5) return isJa ? `サイバーセキュリティ啓発月間まであと${left}日`
                               : `Cybersecurity Awareness Month starts in ${left} days`;
  }
  for (const h of HOLIDAYS[lang]) {
    const t = new Date(year, h.month - 1, h.day); t.setHours(0,0,0,0);
    const diff = Math.round((t - today) / 86_400_000);
    if (diff === 0)                return h.on;
    if (diff > 0 && diff <= h.before) return h.pre;
  }
  const wpd = worldPasswordDay(year);
  const wd  = Math.round((wpd - today) / 86_400_000);
  const wl  = isJa ? `${wpd.getMonth()+1}/${wpd.getDate()}` : `May ${wpd.getDate()}`;
  if (wd === 0)           return isJa ? '今日はワールドパスワードデー。'         : 'Today is World Password Day.';
  if (wd > 0 && wd <= 5) return isJa ? `もうすぐワールドパスワードデー (${wl})` : `World Password Day is coming (${wl})`;
  return null;
}

// ── プレビュー文字セット ────────────────────────────────────
const PREVIEW_CHARS =
  '∀∂∃∅∆∇∈∉∋∏∑∞∟∠∡∣∥∧∨∩∪∫∬∭∮∴∵∶∷∼∽ℬℭℯℰℱℳℴℵℶℷℸℙℚℛℜℝℤℨ' +
  'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ' +
  'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω' +
  'ДЖЗИЙЛФЦЧШЩЪЫЬЭЮЯджзийлфцчшщъыьэюя' +
  '░▒▓█▄▀■□▲△▶◆◇○●◐◑♠♡♢♣★☆♪♫0123456789';
const PLEN = PREVIEW_CHARS.length;

// ── DOM ─────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const wordsList    = $('wordsList');
const addBtn       = $('addBtn');
const applyBtn     = $('applyBtn');
const enableToggle = $('enableToggle');
const maskBtn      = $('maskBtn');
const statusEl     = $('status');
const previewEl    = $('preview');

$('toggleLabel').textContent = T.toggleLabel;
$('wordsLabel').textContent  = T.wordsLabel;
addBtn.textContent            = T.addBtn;
applyBtn.textContent          = T.applyBtn;
$('footerText').textContent   = T.footer;

const splash = getSplash();
if (splash) $('splash').textContent = splash;

// ── プレビューアニメーション ────────────────────────────────
let previewText = 'Obfuscator';
setInterval(() => {
  previewEl.textContent = [...previewText].map(ch =>
    (ch === ' ' || ch === '\u3000') ? ch : PREVIEW_CHARS[Math.random() * PLEN | 0]
  ).join('');
}, 50);

// ── マスクトグル ────────────────────────────────────────────
// デフォルト: 隠す（masked = true → type="password"）
let masked = true;

function applyMask() {
  const inputs = wordsList.querySelectorAll('.word-input');
  inputs.forEach(inp => { inp.type = masked ? 'password' : 'text'; });
  maskBtn.textContent = masked ? T.maskOff : T.maskOn;
  maskBtn.setAttribute('aria-pressed', String(!masked)); // pressed = 表示中
  syncPreview();
}

maskBtn.addEventListener('click', () => { masked = !masked; applyMask(); });

// ── 単語行 ──────────────────────────────────────────────────
function addWordRow(value = '') {
  if (wordsList.children.length >= MAX_WORDS) { showStatus(T.tooMany); return; }

  const row = document.createElement('div');
  row.className = 'word-row';
  row.setAttribute('role', 'listitem');

  const input = document.createElement('input');
  input.type        = masked ? 'password' : 'text';
  input.className   = 'word-input';
  input.placeholder = T.placeholder;
  input.value       = value;
  input.maxLength   = 100;
  input.setAttribute('aria-label', isJa ? '文字化けさせる単語' : 'Word to obfuscate');
  input.addEventListener('input', syncPreview);

  const rm = document.createElement('button');
  rm.className   = 'rm';
  rm.textContent = '×';
  rm.setAttribute('aria-label', isJa ? '削除' : 'Remove');
  rm.addEventListener('click', () => { row.remove(); syncPreview(); });

  row.append(input, rm);
  wordsList.appendChild(row);
  input.focus();
  syncPreview();
}

function getWords() {
  return [...wordsList.querySelectorAll('.word-input')]
    .map(i => i.value.trim())
    .filter(s => s.length > 0 && s.length <= 100);
}

function syncPreview() {
  const w = getWords();
  // マスク中はプレビューにキーワードを流さない
  previewText = (w.length && !masked) ? w.join('  ') : 'Obfuscator';
}

addBtn.addEventListener('click', () => addWordRow());

// ── 適用（暗号化して保存）──────────────────────────────────
applyBtn.addEventListener('click', async () => {
  const raw     = getWords();
  const targets = [...new Set(raw)].slice(0, MAX_WORDS);
  const hadDup  = targets.length < raw.length;
  const settings = { targets, enabled: enableToggle.checked };

  // AES-GCM 暗号化して storage.local に保存
  try {
    await CryptoUtils.saveSettings(settings);
  } catch {
    showStatus(T.saveErr); return;
  }

  // 現在のタブに平文で送信（拡張機能内部通信のみ）
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  const send = () =>
    chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_SETTINGS', settings });

  try {
    await send();
    showStatus(hadDup ? T.dupRemoved : T.applied);
  } catch {
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['crypto-utils.js', 'content.js'] });
      await send();
      showStatus(hadDup ? T.dupRemoved : T.applied);
    } catch {
      showStatus(T.reloadMsg);
    }
  }
});

let statusTimer = null;
function showStatus(msg) {
  statusEl.textContent = msg;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { statusEl.textContent = ''; }, 3000);
}

// ── 起動時に暗号化ストレージから復元 ───────────────────────
CryptoUtils.loadSettings().then(data => {
  enableToggle.checked = data?.enabled !== false;
  const list = Array.isArray(data?.targets) && data.targets.length
    ? data.targets : [''];
  list.forEach(t => addWordRow(typeof t === 'string' ? t : ''));
  applyMask(); // 復元後に一括でマスク適用
});

// ── イースターエッグ ─────────────────────────────────────────

// コナミコマンド: ↑↑↓↓←→←→BA
// ステータスにひとこと表示するだけ（作業の邪魔なし）
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
                'b','a'];
let konamiPos = 0;
document.addEventListener('keydown', e => {
  if (e.key === KONAMI[konamiPos]) {
    konamiPos++;
    if (konamiPos === KONAMI.length) {
      konamiPos = 0;
      showStatus(isJa ? '✓ あなたは見つけた' : '✓ you found it');
    }
  } else {
    konamiPos = e.key === KONAMI[0] ? 1 : 0;
  }
});

// タイトル5回クリック: プレビューが一瞬だけ別のテキストに
const titleEl = document.querySelector('.title');
let titleClicks = 0, titleTimer = null;
titleEl.addEventListener('click', () => {
  titleClicks++;
  clearTimeout(titleTimer);
  titleTimer = setTimeout(() => { titleClicks = 0; }, 1000);
  if (titleClicks >= 5) {
    titleClicks = 0;
    const prev = previewText;
    previewText = isJa ? 'みてるよ' : 'watching';
    setTimeout(() => { previewText = prev; }, 1800);
  }
});
