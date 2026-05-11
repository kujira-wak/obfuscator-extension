'use strict';
// popup.js — Obfuscator

const isJa = navigator.language.startsWith('ja');
document.documentElement.lang = isJa ? 'ja' : 'en';

const MAX_WORDS = 30;
const PROFILE_META = {
  default: { label: isJa ? 'デフォルト' : 'Default', host: isJa ? 'all sites' : 'all sites' },
  slack: { label: 'Slack', host: 'slack.com' },
  gmail: { label: 'Gmail', host: 'mail.google.com' },
  docs: { label: 'Docs', host: 'docs.google.com' },
};
const PROFILE_IDS = Object.keys(PROFILE_META);

const T = {
  toggleLabel:  isJa ? 'ON / OFF' : 'ON / OFF',
  wordsLabel:   isJa ? 'キーワード' : 'Keywords',
  maskOn:       isJa ? '🙈 隠す' : '🙈 Hide',
  maskOff:      isJa ? '👁 表示' : '👁 Show',
  addBtn:       isJa ? '＋ 追加' : '＋ Add word',
  suggestBtn:   isJa ? '＋ ページから候補' : '＋ Suggest from page',
  applyBtn:     isJa ? 'ページに適用' : 'Apply to page',
  ignoreCase:   isJa ? '大文字小文字を無視' : 'Ignore case',
  applied:      isJa ? '適用しました' : 'Applied',
  reloadMsg:    isJa ? 'ページを再読み込みしてください' : 'Please reload the page',
  saveErr:      isJa ? '保存できませんでした' : 'Failed to save',
  tooMany:      isJa ? `最大 ${MAX_WORDS} 件まで` : `Up to ${MAX_WORDS} words`,
  dupRemoved:   isJa ? '重複を除いて適用しました' : 'Duplicates removed',
  noSuggestions:isJa ? '候補が見つかりませんでした' : 'No suggestions found',
  addedSuggest: isJa ? '候補を追加しました' : 'Suggestions added',
  placeholder:  isJa ? '隠したい文字・単語を入力' : 'text you want to hide …',
  footer:       isJa ? '設定はこのデバイスにのみ保存されます（暗号化）'
                     : 'Settings are encrypted and stored locally only',
  settingsTitle: isJa ? '設定' : 'Settings',
  hotkeyLabel:  isJa ? 'ホットキー' : 'Hotkey',
  screenshotLabel: isJa ? 'スクリーンショット警告' : 'Screenshot Warning',
  screenshotCheckBtn: isJa ? 'チェック' : 'Check',
  screenshotWarning: isJa ? '⚠ 隠されていないキーワード:' : '⚠ Unmasked keywords:',
  nothingFound: isJa ? '大丈夫です！' : 'All good!',
};

const HOLIDAYS = {
  ja: [
    { month: 1, day: 28, before: 3, pre: 'もうすぐデータプライバシーデー (1/28)', on: '今日はデータプライバシーデー。' },
    { month: 2, day: 11, before: 3, pre: 'もうすぐセーファーインターネットデー (2/11)', on: '今日はセーファーインターネットデー。' },
    { month: 11, day: 30, before: 3, pre: 'もうすぐコンピュータセキュリティの日 (11/30)', on: '今日はコンピュータセキュリティの日。' },
  ],
  en: [
    { month: 1, day: 28, before: 3, pre: 'Data Privacy Day is coming (Jan 28)', on: 'Today is Data Privacy Day.' },
    { month: 2, day: 11, before: 3, pre: 'Safer Internet Day is coming (Feb 11)', on: 'Today is Safer Internet Day.' },
    { month: 11, day: 30, before: 3, pre: 'Computer Security Day is coming (Nov 30)', on: 'Today is Computer Security Day.' },
  ],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createEmptyProfile() {
  return { targets: [], enabled: true, ignoreCase: false };
}

function normalizeProfile(profile) {
  const base = createEmptyProfile();
  if (!profile || typeof profile !== 'object') return base;

  const targets = Array.isArray(profile.targets)
    ? profile.targets.map(t => (typeof t === 'string' ? t.trim() : '')).filter(Boolean).slice(0, MAX_WORDS)
    : [];

  return {
    targets,
    enabled: profile.enabled !== false,
    ignoreCase: profile.ignoreCase === true,
  };
}

function normalizeSettings(raw) {
  const profiles = {
    default: createEmptyProfile(),
    slack: createEmptyProfile(),
    gmail: createEmptyProfile(),
    docs: createEmptyProfile(),
  };

  if (raw && raw.profiles && typeof raw.profiles === 'object') {
    for (const id of PROFILE_IDS) profiles[id] = normalizeProfile(raw.profiles[id]);
    return { profiles };
  }

  const legacy = normalizeProfile(raw);
  profiles.default = legacy;
  return { profiles };
}

function worldPasswordDay(year) {
  const d = new Date(year, 4, 1);
  d.setDate(1 + ((4 - d.getDay() + 7) % 7));
  return d;
}

function getSplash() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const m = today.getMonth(), d = today.getDate(), year = today.getFullYear();
  const lang = isJa ? 'ja' : 'en';

  if (m === 3 && d === 1) {
    return isJa ? '本日限り、全文字が自動で隠れます（嘘）' : 'All text hides itself today. Auto-mode. (jk)';
  }
  if (m === 2 && d === 14) {
    return isJa ? '今日は円周率の日 — 3.14159265…' : 'Happy π Day — 3.14159265…';
  }

  const start = new Date(year, 0, 1);
  const dayOfYear = Math.floor((today - start) / 86_400_000) + 1;
  if (dayOfYear === 256) {
    return isJa ? '今日はプログラマーの日 (256日目)' : "Happy Programmer's Day (day 256)";
  }

  if (m === 9) return isJa ? '今月はサイバーセキュリティ啓発月間。' : "It's Cybersecurity Awareness Month.";
  if (m === 8) {
    const left = Math.ceil((new Date(year, 9, 1) - today) / 86_400_000);
    if (left <= 5) {
      return isJa ? `サイバーセキュリティ啓発月間まであと${left}日` : `Cybersecurity Awareness Month starts in ${left} days`;
    }
  }
  for (const h of HOLIDAYS[lang]) {
    const t = new Date(year, h.month - 1, h.day);
    t.setHours(0, 0, 0, 0);
    const diff = Math.round((t - today) / 86_400_000);
    if (diff === 0) return h.on;
    if (diff > 0 && diff <= h.before) return h.pre;
  }

  const wpd = worldPasswordDay(year);
  const wd = Math.round((wpd - today) / 86_400_000);
  const wl = isJa ? `${wpd.getMonth() + 1}/${wpd.getDate()}` : `May ${wpd.getDate()}`;
  if (wd === 0) return isJa ? '今日はワールドパスワードデー。' : 'Today is World Password Day.';
  if (wd > 0 && wd <= 5) return isJa ? `もうすぐワールドパスワードデー (${wl})` : `World Password Day is coming (${wl})`;
  return null;
}

const PREVIEW_CHARS =
  '∀∂∃∅∆∇∈∉∋∏∑∞∟∠∡∣∥∧∨∩∪∫∬∭∮∴∵∶∷∼∽ℬℭℯℰℱℳℴℵℶℷℸℙℚℛℜℝℤℨ' +
  'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ' +
  'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω' +
  'ДЖЗИЙЛФЦЧШЩЪЫЬЭЮЯджзийлфцчшщъыьэюя' +
  '░▒▓█▄▀■□▲△▶◆◇○●◐◑♠♡♢♣★☆♪♫0123456789';
const PLEN = PREVIEW_CHARS.length;

const $ = id => document.getElementById(id);
const wordsList = $('wordsList');
const addBtn = $('addBtn');
const applyBtn = $('applyBtn');
const enableToggle = $('enableToggle');
const ignoreCaseToggle = $('ignoreCaseToggle');
const profileSelect = $('profileSelect');
const maskBtn = $('maskBtn');
const statusEl = $('status');
const previewEl = $('preview');
const siteNote = $('siteNote');

$('toggleLabel').textContent = T.toggleLabel;
$('wordsLabel').textContent = T.wordsLabel;
$('ignoreCaseLabel').textContent = T.ignoreCase;
addBtn.textContent = T.addBtn;
applyBtn.textContent = T.applyBtn;
$('footerText').textContent = T.footer;

const splash = getSplash();
if (splash) $('splash').textContent = splash;

let previewText = 'Obfuscator';
setInterval(() => {
  previewEl.textContent = [...previewText].map(ch => (ch === ' ' || ch === '\u3000') ? ch : PREVIEW_CHARS[Math.random() * PLEN | 0]).join('');
}, 50);

let masked = true;
let settingsData = normalizeSettings(null);
let profileDrafts = clone(settingsData.profiles);
let currentProfileId = 'default';
let currentHost = '';

function getProfileIdFromHost(host) {
  if (!host) return 'default';
  if (host === 'mail.google.com') return 'gmail';
  if (host === 'docs.google.com') return 'docs';
  if (host === 'slack.com' || host.endsWith('.slack.com')) return 'slack';
  return 'default';
}

function getCurrentProfile() {
  return profileDrafts[currentProfileId] ?? createEmptyProfile();
}

function getWords() {
  return [...wordsList.querySelectorAll('.word-input')]
    .map(i => i.value.trim())
    .filter(s => s.length > 0 && s.length <= 100);
}

function syncPreview() {
  const w = getWords();
  previewText = (w.length && !masked) ? w.join('  ') : 'Obfuscator';
}

function applyMask() {
  const inputs = wordsList.querySelectorAll('.word-input');
  inputs.forEach(inp => { inp.type = masked ? 'password' : 'text'; });
  maskBtn.textContent = masked ? T.maskOff : T.maskOn;
  maskBtn.setAttribute('aria-pressed', String(!masked));
  syncPreview();
}

function addWordRow(value = '', focus = true) {
  if (wordsList.children.length >= MAX_WORDS) {
    showStatus(T.tooMany);
    return;
  }

  const row = document.createElement('div');
  row.className = 'word-row';
  row.setAttribute('role', 'listitem');

  const input = document.createElement('input');
  input.type = masked ? 'password' : 'text';
  input.className = 'word-input';
  input.placeholder = T.placeholder;
  input.value = value;
  input.maxLength = 100;
  input.setAttribute('aria-label', isJa ? '文字化けさせる単語' : 'Word to obfuscate');
  input.addEventListener('input', syncPreview);

  const rm = document.createElement('button');
  rm.className = 'rm';
  rm.textContent = '×';
  rm.setAttribute('aria-label', isJa ? '削除' : 'Remove');
  rm.addEventListener('click', () => { row.remove(); syncPreview(); });

  row.append(input, rm);
  wordsList.appendChild(row);
  if (focus) input.focus();
  syncPreview();
}

function renderProfileToUI(profileId) {
  const profile = profileDrafts[profileId] ?? createEmptyProfile();
  wordsList.replaceChildren();
  enableToggle.checked = profile.enabled !== false;
  ignoreCaseToggle.checked = profile.ignoreCase === true;
  if (profile.targets.length) {
    profile.targets.forEach(t => addWordRow(t, false));
  } else {
    addWordRow('', false);
  }
  applyMask();
  updateSiteNote();
}

function stashCurrentProfile() {
  profileDrafts[currentProfileId] = {
    targets: getWords().slice(0, MAX_WORDS),
    enabled: enableToggle.checked,
    ignoreCase: ignoreCaseToggle.checked,
  };
}

function renderProfileOptions() {
  profileSelect.replaceChildren();
  for (const id of PROFILE_IDS) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = PROFILE_META[id].label;
    profileSelect.appendChild(option);
  }
  profileSelect.value = currentProfileId;
}

function updateSiteNote() {
  const label = PROFILE_META[currentProfileId]?.label ?? currentProfileId;
  const host = currentHost ? ` (${currentHost})` : '';
  siteNote.textContent = `${label}${host}`;
}

function switchProfile(nextProfileId) {
  if (!PROFILE_META[nextProfileId]) return;
  stashCurrentProfile();
  currentProfileId = nextProfileId;
  profileSelect.value = currentProfileId;
  renderProfileToUI(currentProfileId);
}

function mergeCandidates(existing, additions, ignoreCase) {
  const seen = new Set(existing.map(v => ignoreCase ? v.toLowerCase() : v));
  const merged = existing.slice();
  for (const raw of additions) {
    const word = raw.trim();
    if (!word) continue;
    if (merged.length >= MAX_WORDS) break;
    const key = ignoreCase ? word.toLowerCase() : word;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(word);
  }
  return merged;
}

async function applySettingsToTab(settings) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return false;

  const send = () => chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_SETTINGS', settings });

  try {
    await send();
    return true;
  } catch {
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['crypto-utils.js', 'content.js'] });
      await send();
      return true;
    } catch {
      return false;
    }
  }
}

addBtn.addEventListener('click', () => addWordRow('', true));

profileSelect.addEventListener('change', () => switchProfile(profileSelect.value));
maskBtn.addEventListener('click', () => { masked = !masked; applyMask(); });

applyBtn.addEventListener('click', async () => {
  stashCurrentProfile();
  const profile = getCurrentProfile();
  const targets = profile.ignoreCase
    ? [...new Map(profile.targets.map(t => [t.toLowerCase(), t])).values()].slice(0, MAX_WORDS)
    : [...new Set(profile.targets)].slice(0, MAX_WORDS);
  const hadDup = targets.length < profile.targets.length;
  const settings = {
    profiles: {
      ...clone(profileDrafts),
      [currentProfileId]: {
        targets,
        enabled: enableToggle.checked,
        ignoreCase: ignoreCaseToggle.checked,
      },
    },
  };

  try {
    await CryptoUtils.saveSettings(settings);
  } catch {
    showStatus(T.saveErr);
    return;
  }

  const applied = await applySettingsToTab(settings.profiles[currentProfileId]);
  showStatus(applied ? (hadDup ? T.dupRemoved : T.applied) : T.reloadMsg);
});

let statusTimer = null;
function showStatus(msg) {
  statusEl.textContent = msg;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { statusEl.textContent = ''; }, 3000);
}

function loadInitialProfile(tabUrl) {
  currentHost = '';
  try {
    currentHost = tabUrl ? new URL(tabUrl).hostname : '';
  } catch {
    currentHost = '';
  }
  currentProfileId = getProfileIdFromHost(currentHost);
  renderProfileOptions();
  renderProfileToUI(currentProfileId);
}

async function bootstrap() {
  const data = await CryptoUtils.loadSettings();
  settingsData = normalizeSettings(data);
  profileDrafts = clone(settingsData.profiles);

  document.getElementById('settingsTitle').textContent = T.settingsTitle;
  document.getElementById('hotkeyLabel').textContent = T.hotkeyLabel;
  document.getElementById('screenshotLabel').textContent = T.screenshotLabel;
  document.getElementById('screenshotCheckBtn').textContent = T.screenshotCheckBtn;

  document.getElementById('screenshotCheckBtn').addEventListener('click', checkScreenshot);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  loadInitialProfile(tab?.url ?? '');
}

async function checkScreenshot() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    showStatus(isJa ? 'タブが見つかりません' : 'Tab not found');
    return;
  }

  const profile = getCurrentProfile();
  if (!profile.targets.length) {
    showStatus(isJa ? 'キーワードが設定されていません' : 'No keywords set');
    return;
  }

  try {
    const result = await chrome.tabs.sendMessage(tab.id, {
      type: 'CHECK_KEYWORDS',
      keywords: profile.targets,
      ignoreCase: profile.ignoreCase
    });

    if (result.found.length > 0) {
      showStatus(`${T.screenshotWarning}\n${result.found.join(', ')}`);
    } else {
      showStatus(T.nothingFound);
    }
  } catch {
    showStatus(isJa ? 'ページをリロードしてください' : 'Please reload page');
  }
}

bootstrap();

// コナミコマンド: ↑↑↓↓←→←→BA
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
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
