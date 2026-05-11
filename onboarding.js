'use strict';

const isJa = navigator.language.startsWith('ja');

const RECOMMENDED_KEYWORDS = {
  ja: [
    '名前', '住所', 'メール', '電話', '社員ID', 'パスワード',
    '給与', 'SSN', '口座番号', '顧客名', 'プロジェクト名'
  ],
  en: [
    'Name', 'Address', 'Email', 'Phone', 'Employee ID', 'Password',
    'Salary', 'SSN', 'Account Number', 'Customer Name', 'Project Name'
  ]
};

const TEXT = {
  ja: {
    'step-1': { title: 'ようこそ！', desc: '画面共有やスクリーンレコーディング時に、個人情報を自動で隠せます。' },
    'li-1-1': 'キーワードを登録すると、ページ上で自動的に隠されます',
    'li-1-2': 'サイトごとにプロファイルを分けて管理',
    'li-1-3': 'すべての設定はこのデバイスに暗号化して保存',
    'note-1': '公的機関が推奨する個人情報保護のガイドラインに基づいた設定をお勧めします。',

    'step-2': { title: '推奨キーワード', desc: '個人情報保護委員会などが推奨する隠すべき情報です。必要に応じて選択してください。' },
    'note-2': '選択したキーワードはデフォルトプロファイルに登録されます。後から追加・変更できます。',

    'step-3': { title: '使い方', desc: 'Obfuscator の基本的な使い方をご説明します。' },
    'li-3-1': 'ポップアップからキーワードを追加・削除できます',
    'li-3-2': 'トグルスイッチで有効・無効をコントロール',
    'li-3-3': 'ホットキー（Ctrl+Shift+O）で素早くON/OFF',
    'li-3-4': '画面共有前に忘れず有効化してください',
    'note-3': 'より詳しい情報は README.md をご覧ください。',
  },
  en: {
    'step-1': { title: 'Welcome!', desc: 'Automatically hide sensitive information during screen sharing or recording.' },
    'li-1-1': 'Register keywords and they will be automatically hidden on pages',
    'li-1-2': 'Manage separate profiles for different sites',
    'li-1-3': 'All settings are encrypted and stored locally',
    'note-1': 'Settings are based on official privacy protection guidelines.',

    'step-2': { title: 'Recommended Keywords', desc: 'Information recommended by privacy authorities. Select as needed.' },
    'note-2': 'Selected keywords will be added to your default profile. You can modify them later.',

    'step-3': { title: 'How to Use', desc: 'Learn the basics of using Obfuscator.' },
    'li-3-1': 'Add/remove keywords from the popup',
    'li-3-2': 'Use the toggle switch to enable/disable',
    'li-3-3': 'Use hotkey (Ctrl+Shift+O) for quick toggle',
    'li-3-4': 'Remember to enable before screen sharing',
    'note-3': 'See README.md for more detailed information.',
  }
};

const t = TEXT[isJa ? 'ja' : 'en'];
const keywords = RECOMMENDED_KEYWORDS[isJa ? 'ja' : 'en'];
let currentStep = 1;
let selectedKeywords = new Set();

function updateUI() {
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;
  document.getElementById('progressBar').style.width = progress + '%';
  document.getElementById('stepIndicator').textContent = `Step ${currentStep} of ${totalSteps}`;

  for (let i = 1; i <= totalSteps; i++) {
    document.getElementById(`step-${i}`).classList.remove('active');
  }
  document.getElementById(`step-${currentStep}`).classList.add('active');
}

function renderStep1() {
  document.getElementById('title-1').textContent = t['step-1'].title;
  document.getElementById('desc-1').textContent = t['step-1'].desc;
  document.getElementById('li-1-1').textContent = t['li-1-1'];
  document.getElementById('li-1-2').textContent = t['li-1-2'];
  document.getElementById('li-1-3').textContent = t['li-1-3'];
  document.getElementById('note-1').textContent = t['note-1'];
}

function renderStep2() {
  document.getElementById('title-2').textContent = t['step-2'].title;
  document.getElementById('desc-2').textContent = t['step-2'].desc;
  document.getElementById('note-2').textContent = t['note-2'];

  const grid = document.getElementById('keywordGrid');
  grid.innerHTML = '';
  keywords.forEach(keyword => {
    const chip = document.createElement('div');
    chip.className = 'keyword-chip';
    if (selectedKeywords.has(keyword)) chip.classList.add('selected');
    chip.textContent = keyword;
    chip.onclick = () => {
      if (selectedKeywords.has(keyword)) {
        selectedKeywords.delete(keyword);
        chip.classList.remove('selected');
      } else {
        selectedKeywords.add(keyword);
        chip.classList.add('selected');
      }
    };
    grid.appendChild(chip);
  });
}

function renderStep3() {
  document.getElementById('title-3').textContent = t['step-3'].title;
  document.getElementById('desc-3').textContent = t['step-3'].desc;
  document.getElementById('li-3-1').textContent = t['li-3-1'];
  document.getElementById('li-3-2').textContent = t['li-3-2'];
  document.getElementById('li-3-3').textContent = t['li-3-3'];
  document.getElementById('li-3-4').textContent = t['li-3-4'];
  document.getElementById('note-3').textContent = t['note-3'];
}

function nextStep() {
  if (currentStep === 2) {
    localStorage.setItem('obfuscator_onboarding_keywords', JSON.stringify([...selectedKeywords]));
  }
  if (currentStep < 3) {
    currentStep++;
    updateUI();
    if (currentStep === 1) renderStep1();
    else if (currentStep === 2) renderStep2();
    else if (currentStep === 3) renderStep3();
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateUI();
    if (currentStep === 1) renderStep1();
    else if (currentStep === 2) renderStep2();
    else if (currentStep === 3) renderStep3();
  }
}

async function finish() {
  const defaultProfile = {
    targets: [...selectedKeywords],
    enabled: true,
    ignoreCase: false
  };

  const settings = {
    profiles: {
      default: defaultProfile,
      slack: { targets: [], enabled: true, ignoreCase: false },
      gmail: { targets: [], enabled: true, ignoreCase: false },
      docs: { targets: [], enabled: true, ignoreCase: false }
    }
  };

  await CryptoUtils.saveSettings(settings);
  localStorage.setItem('obfuscator_onboarding_complete', 'true');
  window.close();
}

// Initialize
renderStep1();
renderStep2();
renderStep3();
updateUI();
