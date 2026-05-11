'use strict';

const isJa = navigator.language.startsWith('ja');

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

const TEXT = {
  ja: {
    'step-1': { title: 'ようこそ！', desc: '画面共有やスクリーンレコーディング時に、個人情報を自動で隠せます。' },
    'li-1-1': 'キーワードを登録すると、ページ上で自動的に隠されます',
    'li-1-2': 'サイトごとにプロファイルを分けて管理',
    'li-1-3': 'すべての設定はこのデバイスに暗号化して保存',
    'note-1': '公的機関が推奨する個人情報保護のガイドラインに基づいた設定をお勧めします。',

    'step-2': { title: 'どのシーンで使う？', desc: 'あなたの使用シーンに合わせて、推奨キーワードを用意しました。' },
    'scene-work': { name: '仕事・一般向け', desc: '職場の会議やオンライン打ち合わせ' },
    'scene-sns': { name: 'SNS・配信向け', desc: 'ネット友達や動画配信など' },
    'note-2': 'シーンに応じて推奨キーワードが変わります。後から変更できます。',

    'step-3': { title: '隠すキーワードを選択', desc: '選択したキーワードはデフォルトプロファイルに登録されます。' },
    'note-3': '後から追加・削除できます。',

    'step-4': { title: 'オプション設定', desc: '便利な機能を設定できます。' },
    'option-ignorecase': { label: '大文字小文字を区別しない', desc: '「Email」「email」「EMAIL」など、大文字小文字のバリエーションも隠す' },
    'option-screenshot-warning': { label: 'スクリーンショット警告', desc: '隠されていないキーワードが画面に映っている場合、警告を表示' },
    'note-4': 'これらの設定はいつでも変更できます。',

    'step-5': { title: '使い方', desc: 'Obfuscator の基本的な使い方をご説明します。' },
    'li-5-1': 'ポップアップからキーワードを追加・削除できます',
    'li-5-2': 'トグルスイッチで有効・無効をコントロール',
    'li-5-3': 'ホットキー（Ctrl+Shift+O）で素早くON/OFF',
    'li-5-4': '画面共有前に忘れず有効化してください',
    'note-5': 'より詳しい情報は README.md をご覧ください。',
  },
  en: {
    'step-1': { title: 'Welcome!', desc: 'Automatically hide sensitive information during screen sharing or recording.' },
    'li-1-1': 'Register keywords and they will be automatically hidden on pages',
    'li-1-2': 'Manage separate profiles for different sites',
    'li-1-3': 'All settings are encrypted and stored locally',
    'note-1': 'Settings are based on official privacy protection guidelines.',

    'step-2': { title: 'Which scene do you use?', desc: 'We have prepared recommended keywords for your use case.' },
    'scene-work': { name: 'Work / General', desc: 'Office meetings or online calls' },
    'scene-sns': { name: 'SNS / Streaming', desc: 'Online friends or video streaming' },
    'note-2': 'Recommended keywords change by scene. You can modify them later.',

    'step-3': { title: 'Select keywords to hide', desc: 'Selected keywords will be added to your default profile.' },
    'note-3': 'You can add/remove them later.',

    'step-4': { title: 'Optional Features', desc: 'Configure helpful features.' },
    'option-ignorecase': { label: 'Ignore case', desc: 'Hide variations like "Email", "email", "EMAIL"' },
    'option-screenshot-warning': { label: 'Screenshot warning', desc: 'Alert if unmasked keywords appear on screen' },
    'note-4': 'You can change these settings anytime.',

    'step-5': { title: 'How to Use', desc: 'Learn the basics of using Obfuscator.' },
    'li-5-1': 'Add/remove keywords from the popup',
    'li-5-2': 'Use the toggle switch to enable/disable',
    'li-5-3': 'Use hotkey (Ctrl+Shift+O) for quick toggle',
    'li-5-4': 'Remember to enable before screen sharing',
    'note-5': 'See README.md for more detailed information.',
  }
};

const t = TEXT[isJa ? 'ja' : 'en'];
let currentStep = 1;
let selectedScene = 'work';
let selectedKeywords = new Set();
let options = {
  ignoreCase: false,
  screenshotWarning: false
};

function updateUI() {
  const totalSteps = 5;
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

  const container = document.getElementById('sceneOptions');
  container.innerHTML = '';
  
  const scenes = [
    { id: 'work', label: t['scene-work'].name, desc: t['scene-work'].desc },
    { id: 'sns', label: t['scene-sns'].name, desc: t['scene-sns'].desc }
  ];

  scenes.forEach(scene => {
    const card = document.createElement('div');
    card.className = 'scene-card' + (selectedScene === scene.id ? ' selected' : '');
    card.innerHTML = `<h3>${scene.label}</h3><p>${scene.desc}</p>`;
    card.onclick = () => {
      selectedScene = scene.id;
      selectedKeywords.clear();
      renderStep2();
    };
    container.appendChild(card);
  });
}

function renderStep3() {
  document.getElementById('title-3').textContent = t['step-3'].title;
  document.getElementById('desc-3').textContent = t['step-3'].desc;
  document.getElementById('note-3').textContent = t['note-3'];

  const keywords = RECOMMENDED_KEYWORDS[isJa ? 'ja' : 'en'][selectedScene];
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

function renderStep4() {
  document.getElementById('title-4').textContent = t['step-4'].title;
  document.getElementById('desc-4').textContent = t['step-4'].desc;
  document.getElementById('note-4').textContent = t['note-4'];

  const group = document.getElementById('optionsGroup');
  group.innerHTML = '';

  const optionsList = [
    { key: 'ignoreCase', label: t['option-ignorecase'].label, desc: t['option-ignorecase'].desc },
    { key: 'screenshotWarning', label: t['option-screenshot-warning'].label, desc: t['option-screenshot-warning'].desc }
  ];

  optionsList.forEach(opt => {
    const item = document.createElement('label');
    item.className = 'checkbox-item';
    item.innerHTML = `
      <input type="checkbox" ${options[opt.key] ? 'checked' : ''}>
      <span>
        <span>${opt.label}</span>
        <span class="desc">${opt.desc}</span>
      </span>
    `;
    item.querySelector('input').onchange = (e) => {
      options[opt.key] = e.target.checked;
    };
    group.appendChild(item);
  });
}

function renderStep5() {
  document.getElementById('title-5').textContent = t['step-5'].title;
  document.getElementById('desc-5').textContent = t['step-5'].desc;
  document.getElementById('li-5-1').textContent = t['li-5-1'];
  document.getElementById('li-5-2').textContent = t['li-5-2'];
  document.getElementById('li-5-3').textContent = t['li-5-3'];
  document.getElementById('li-5-4').textContent = t['li-5-4'];
  document.getElementById('note-5').textContent = t['note-5'];
}

function nextStep() {
  if (currentStep < 5) {
    currentStep++;
    updateUI();
    if (currentStep === 2) renderStep2();
    else if (currentStep === 3) renderStep3();
    else if (currentStep === 4) renderStep4();
    else if (currentStep === 5) renderStep5();
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateUI();
    if (currentStep === 2) renderStep2();
    else if (currentStep === 3) renderStep3();
    else if (currentStep === 4) renderStep4();
    else if (currentStep === 5) renderStep5();
  }
}

async function finish() {
  const defaultProfile = {
    targets: [...selectedKeywords],
    enabled: true,
    ignoreCase: options.ignoreCase
  };

  const settings = {
    profiles: {
      default: defaultProfile,
      slack: { targets: [], enabled: true, ignoreCase: false },
      gmail: { targets: [], enabled: true, ignoreCase: false },
      docs: { targets: [], enabled: true, ignoreCase: false }
    },
    screenshotWarning: options.screenshotWarning
  };

  await CryptoUtils.saveSettings(settings);
  localStorage.setItem('obfuscator_onboarding_complete', 'true');
  window.close();
}

// Initialize
renderStep1();
renderStep2();
renderStep3();
renderStep4();
renderStep5();
updateUI();

