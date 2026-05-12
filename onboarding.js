'use strict';

const isJa = navigator.language.startsWith('ja');

const INPUT_FIELDS = {
  ja: {
    work: [
      { key: 'employee_id', label: '社員ID', placeholder: '例: E12345' },
      { key: 'company', label: '会社名', placeholder: '例: 株式会社○○' },
      { key: 'project', label: 'プロジェクト名', placeholder: '例: Project Alpha' },
    ],
    sns: [
      { key: 'surname', label: '苗字', placeholder: '例: 山田' },
      { key: 'given_name', label: '名前', placeholder: '例: 太郎' },
      { key: 'surname_hiragana', label: '苗字（ひらがな）', placeholder: '例: やまだ' },
      { key: 'given_hiragana', label: '名前（ひらがな）', placeholder: '例: たろう' },
      { key: 'surname_katakana', label: '苗字（カタカナ）', placeholder: '例: ヤマダ' },
      { key: 'given_katakana', label: '名前（カタカナ）', placeholder: '例: タロウ' },
      { key: 'romaji', label: 'ローマ字', placeholder: '例: Yamada Taro' },
      { key: 'email', label: 'メールアドレス', placeholder: '例: yamada@example.com' },
      { key: 'address', label: '住所', placeholder: '例: 東京都渋谷区' },
      { key: 'phone', label: '電話番号', placeholder: '例: 090-1234-5678' },
    ]
  },
  en: {
    work: [
      { key: 'employee_id', label: 'Employee ID', placeholder: 'e.g., E12345' },
      { key: 'company', label: 'Company Name', placeholder: 'e.g., Acme Inc' },
      { key: 'project', label: 'Project Name', placeholder: 'e.g., Project Alpha' },
    ],
    sns: [
      { key: 'last_name', label: 'Last Name', placeholder: 'e.g., Smith' },
      { key: 'first_name', label: 'First Name', placeholder: 'e.g., John' },
      { key: 'username', label: 'Username', placeholder: 'e.g., jsmith' },
      { key: 'email', label: 'Email', placeholder: 'e.g., john@example.com' },
      { key: 'phone', label: 'Phone', placeholder: 'e.g., +1-555-1234' },
      { key: 'address', label: 'Address', placeholder: 'e.g., 123 Main St' },
      { key: 'birthday', label: 'Birthday', placeholder: 'e.g., Jan 1' },
    ]
  }
};

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
      'Name', 'Address', 'Email', 'Phone', 'Social Media ID', 'Account Number', 'Birthday'
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

    'step-3': { title: 'あなたの情報を入力', desc: 'スクリーン共有時に隠したいあなたの情報を入力してください。' },
    'note-3': '後から追加・削除・変更できます。空欄でも大丈夫です。',

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
    
    'skip-confirm': 'Setup をスキップしますか？\n後からポップアップで設定できます。',
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

    'step-3': { title: 'Enter your information', desc: 'Enter the personal information you want to hide during screen sharing.' },
    'note-3': 'You can add, remove or change this anytime. Empty fields are fine.',

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
    
    'skip-confirm': 'Skip setup now? You can configure it later in the popup.',
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
  const progressBar = document.getElementById('progressBar');
  if (progressBar) progressBar.style.width = progress + '%';
  
  const stepIndicator = document.getElementById('stepIndicator');
  if (stepIndicator) stepIndicator.textContent = `Step ${currentStep} of ${totalSteps}`;

  for (let i = 1; i <= totalSteps; i++) {
    const step = document.getElementById(`step-${i}`);
    if (step) step.classList.remove('active');
  }
  const currentStepEl = document.getElementById(`step-${currentStep}`);
  if (currentStepEl) currentStepEl.classList.add('active');
}

function renderStep1() {
  const title1 = document.getElementById('title-1');
  if (title1) title1.textContent = t['step-1'].title;
  const desc1 = document.getElementById('desc-1');
  if (desc1) desc1.textContent = t['step-1'].desc;
  const li11 = document.getElementById('li-1-1');
  if (li11) li11.textContent = t['li-1-1'];
  const li12 = document.getElementById('li-1-2');
  if (li12) li12.textContent = t['li-1-2'];
  const li13 = document.getElementById('li-1-3');
  if (li13) li13.textContent = t['li-1-3'];
  const note1 = document.getElementById('note-1');
  if (note1) note1.textContent = t['note-1'];
}

function renderStep2() {
  const title2 = document.getElementById('title-2');
  if (title2) title2.textContent = t['step-2'].title;
  const desc2 = document.getElementById('desc-2');
  if (desc2) desc2.textContent = t['step-2'].desc;
  const note2 = document.getElementById('note-2');
  if (note2) note2.textContent = t['note-2'];

  const container = document.getElementById('sceneOptions');
  if (!container) return;
  container.innerHTML = '';
  
  const scenes = [
    { id: 'work', label: t['scene-work'].name, desc: t['scene-work'].desc },
    { id: 'sns', label: t['scene-sns'].name, desc: t['scene-sns'].desc }
  ];

  scenes.forEach(scene => {
    const card = document.createElement('div');
    card.className = 'scene-card' + (selectedScene === scene.id ? ' selected' : '');
    card.innerHTML = `<h3>${scene.label}</h3><p>${scene.desc}</p>`;
    card.addEventListener('click', () => {
      selectedScene = scene.id;
      selectedKeywords.clear();
      renderStep3();
    });
    container.appendChild(card);
  });
}

function renderStep3() {
  const title3 = document.getElementById('title-3');
  if (title3) title3.textContent = t['step-3'].title;
  const desc3 = document.getElementById('desc-3');
  if (desc3) desc3.textContent = t['step-3'].desc;
  const note3 = document.getElementById('note-3');
  if (note3) note3.textContent = t['note-3'];

  const grid = document.getElementById('keywordGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const fields = INPUT_FIELDS[isJa ? 'ja' : 'en'][selectedScene] || [];
  
  fields.forEach(field => {
    const container = document.createElement('div');
    container.style.marginBottom = '12px';
    
    const label = document.createElement('label');
    label.style.display = 'block';
    label.style.fontSize = '12px';
    label.style.color = '#ccc';
    label.style.marginBottom = '4px';
    label.style.fontWeight = '500';
    label.textContent = field.label;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = field.placeholder;
    input.className = 'keyword-input';
    input.style.width = '100%';
    input.style.background = '#2c2c2c';
    input.style.color = '#fff';
    input.style.border = 'none';
    input.style.borderRadius = '5px';
    input.style.padding = '8px 10px';
    input.style.fontSize = '12px';
    input.style.fontFamily = 'inherit';
    input.style.boxSizing = 'border-box';
    input.style.outline = 'none';
    input.value = selectedKeywords.has(field.key) ? Array.from(selectedKeywords).find(k => k.startsWith(field.key + ':'))?.split(':')[1] || '' : '';
    
    input.addEventListener('input', () => {
      const text = input.value.trim();
      const key = field.key + ':' + text;
      
      // 同じフィールドの古いキーを削除
      selectedKeywords.forEach(k => {
        if (k.startsWith(field.key + ':')) selectedKeywords.delete(k);
      });
      
      // 新しい値を追加
      if (text) selectedKeywords.add(key);
    });
    
    container.appendChild(label);
    container.appendChild(input);
    grid.appendChild(container);
  });
}

function renderStep4() {
  const title4 = document.getElementById('title-4');
  if (title4) title4.textContent = t['step-4'].title;
  const desc4 = document.getElementById('desc-4');
  if (desc4) desc4.textContent = t['step-4'].desc;
  const note4 = document.getElementById('note-4');
  if (note4) note4.textContent = t['note-4'];

  const group = document.getElementById('optionsGroup');
  if (!group) return;
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
    const input = item.querySelector('input');
    if (input) {
      input.addEventListener('change', (e) => {
        options[opt.key] = e.target.checked;
      });
    }
    group.appendChild(item);
  });
}

function renderStep5() {
  const title5 = document.getElementById('title-5');
  if (title5) title5.textContent = t['step-5'].title;
  const desc5 = document.getElementById('desc-5');
  if (desc5) desc5.textContent = t['step-5'].desc;
  const li51 = document.getElementById('li-5-1');
  if (li51) li51.textContent = t['li-5-1'];
  const li52 = document.getElementById('li-5-2');
  if (li52) li52.textContent = t['li-5-2'];
  const li53 = document.getElementById('li-5-3');
  if (li53) li53.textContent = t['li-5-3'];
  const li54 = document.getElementById('li-5-4');
  if (li54) li54.textContent = t['li-5-4'];
  const note5 = document.getElementById('note-5');
  if (note5) note5.textContent = t['note-5'];
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

async function skipAll() {
  if (confirm(t['skip-confirm'])) {
    const settings = {
      profiles: {
        default: { targets: [], enabled: true, ignoreCase: false },
        slack: { targets: [], enabled: true, ignoreCase: false },
        gmail: { targets: [], enabled: true, ignoreCase: false },
        docs: { targets: [], enabled: true, ignoreCase: false }
      },
      screenshotWarning: false
    };
    await CryptoUtils.saveSettings(settings);
    localStorage.setItem('obfuscator_onboarding_complete', 'true');
    window.close();
  }
}

async function finish() {
  // selectedKeywords から "field:value" 形式の値を抽出
  const keywords = Array.from(selectedKeywords)
    .map(k => {
      const parts = k.split(':');
      if (parts.length > 1) {
        return parts.slice(1).join(':'); // "field:value" から "value" を取る
      }
      return k; // フォールバック
    })
    .filter(k => k.trim().length > 0);

  const defaultProfile = {
    targets: keywords,
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

// Event listeners (CSP compliant - no inline handlers)
const btnSkip = document.getElementById('btnSkip');
if (btnSkip) btnSkip.addEventListener('click', skipAll);
const btnNext1 = document.getElementById('btnNext1');
if (btnNext1) btnNext1.addEventListener('click', nextStep);
const btnNext2 = document.getElementById('btnNext2');
if (btnNext2) btnNext2.addEventListener('click', nextStep);
const btnNext3 = document.getElementById('btnNext3');
if (btnNext3) btnNext3.addEventListener('click', nextStep);
const btnNext4 = document.getElementById('btnNext4');
if (btnNext4) btnNext4.addEventListener('click', nextStep);
const btnBack2 = document.getElementById('btnBack2');
if (btnBack2) btnBack2.addEventListener('click', prevStep);
const btnBack3 = document.getElementById('btnBack3');
if (btnBack3) btnBack3.addEventListener('click', prevStep);
const btnBack4 = document.getElementById('btnBack4');
if (btnBack4) btnBack4.addEventListener('click', prevStep);
const btnBack5 = document.getElementById('btnBack5');
if (btnBack5) btnBack5.addEventListener('click', prevStep);
const btnFinish = document.getElementById('btnFinish');
if (btnFinish) btnFinish.addEventListener('click', finish);

