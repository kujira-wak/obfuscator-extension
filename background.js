'use strict';

importScripts('crypto-utils.js');

const MAX_WORDS = 30;
const PROFILE_IDS = ['default', 'slack', 'gmail', 'docs'];

const RECOMMENDED_KEYWORDS = {
  ja: {
    work: [
      '名前', '社員ID', 'パスワード', '給与', 'SSN', '口座番号', '顧客名', 'プロジェクト名'
    ],
    sns: [
      '本名', '住所', 'メールアドレス', '電話番号', 'SNS ID', 'アカウント番号', '誕生日'
    ]
  },
  en: {
    work: [
      'Name', 'Employee ID', 'Password', 'Salary', 'SSN', 'Account Number', 'Customer Name', 'Project Name'
    ],
    sns: [
      'Real Name', 'Address', 'Email', 'Phone', 'Social Media ID', 'Account Number', 'Birthday'
    ]
  }
};

function createEmptyProfile() {
  return { targets: [], enabled: true, ignoreCase: false };
}

function normalizeProfile(profile) {
  if (!profile || typeof profile !== 'object') return createEmptyProfile();
  return {
    targets: Array.isArray(profile.targets)
      ? profile.targets.map(t => (typeof t === 'string' ? t.trim() : '')).filter(Boolean).slice(0, MAX_WORDS)
      : [],
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

  profiles.default = normalizeProfile(raw);
  return { profiles };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getProfileIdFromHost(host) {
  if (!host) return 'default';
  if (host === 'mail.google.com') return 'gmail';
  if (host === 'docs.google.com') return 'docs';
  if (host === 'slack.com' || host.endsWith('.slack.com')) return 'slack';
  return 'default';
}

function getActiveTab() {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => resolve(tabs[0] ?? null));
  });
}

function ensureApplied(tabId, settings) {
  const send = () => chrome.tabs.sendMessage(tabId, { type: 'UPDATE_SETTINGS', settings });

  return send().catch(() =>
    chrome.scripting.executeScript({ target: { tabId }, files: ['crypto-utils.js', 'content.js'] })
      .then(send)
  );
}

async function loadActiveProfile() {
  const tab = await getActiveTab();
  if (!tab?.id) return null;

  const data = normalizeSettings(await CryptoUtils.loadSettings());
  let host = '';
  try {
    host = tab.url ? new URL(tab.url).hostname : '';
  } catch {
    host = '';
  }
  const profileId = getProfileIdFromHost(host);
  return { tab, data, profileId, profile: data.profiles[profileId] };
}

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'onboarding.html' });
  }
});

chrome.commands.onCommand.addListener(async command => {
  const ctx = await loadActiveProfile();
  if (!ctx) return;

  if (command === 'toggle-obfuscation') {
    const profiles = clone(ctx.data.profiles);
    const profile = normalizeProfile(profiles[ctx.profileId]);
    profile.enabled = !profile.enabled;
    profiles[ctx.profileId] = profile;
    await CryptoUtils.saveSettings({ profiles });
    await ensureApplied(ctx.tab.id, profile);
    return;
  }

  if (command === 'apply-obfuscation') {
    await ensureApplied(ctx.tab.id, ctx.profile);
  }
});

chrome.tabs.onActivated.addListener(async info => {
  const tabId = info.tabId;
  const tab = await new Promise(resolve => {
    chrome.tabs.get(tabId, tab => resolve(tab ?? null));
  });

  if (!tab || !tab.url) return;

  let host = '';
  try {
    host = new URL(tab.url).hostname;
  } catch {
    return;
  }

  const profileId = getProfileIdFromHost(host);
  const data = normalizeSettings(await CryptoUtils.loadSettings());
  const profile = data.profiles[profileId];

  if (profile && profile.enabled && profile.targets.length > 0) {
    await ensureApplied(tabId, profile);
  }
});
