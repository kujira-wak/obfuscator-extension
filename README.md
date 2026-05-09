# Obfuscator

**画面共有中に見せたくない文字を、その場でランダムな記号に変化させるChrome拡張機能。**

![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)

---

## こんな場面で使える

### 画面共有・スクリーンレコーディング

ミーティング中に突然メールや Slack を開かなければいけないとき、送信者名・件名・本文などの意図しない情報が映り込んでしまうことがあります。Obfuscator はあらかじめ登録した文字・単語をリアルタイムで記号に化かし続けるため、**画面共有をしたまま** 手間なく情報を守れます。

```
登録例:
  田中　→　∑ℵ∂Ω
  salary → ℭΔℝ∫ℤ
  Project X → ∮∞□◆∇
```

登録したキーワードはページ上のすべての一致箇所に即座に適用されます。OFF にすれば元の表示に戻ります。

---

## 使い方

1. 拡張機能アイコンをクリック
2. 隠したい文字・単語を入力（最大30件）
3. **「ページに適用」** を押す

キーワードはいつでも追加・削除・ON/OFF 切り替えができます。

---

## 機能

- 指定したキーワードをランダムな記号に変化させ続ける（リアルタイム更新）
- SPA・動的コンテンツにも自動追従（MutationObserver）
- `<input>` `<textarea>` `contenteditable` などの入力欄には一切干渉しない
- ポップアップ上でキーワードを隠す表示（`●●●`）に切り替え可能
- 日本語 / English の自動切り替え

---

## プライバシー・セキュリティ

- キーワードは **AES-GCM 256bit で暗号化** してデバイス内にのみ保存
- `chrome.storage.sync`（Google クラウド同期）は使用しない
- 外部サーバーへの通信は一切なし

---

## インストール（開発版）

```bash
git clone https://github.com/kujira-wak/obfuscator-extension.git
```

1. Chrome で `chrome://extensions` を開く
2. 右上の **「デベロッパーモード」** をON
3. **「パッケージ化されていない拡張機能を読み込む」** → クローンしたフォルダを選択

---

## ファイル構成

```
obfuscator-extension/
├── manifest.json       # 拡張機能定義 (Manifest V3)
├── content.js          # ページへの注入スクリプト
├── crypto-utils.js     # AES-GCM 暗号化ユーティリティ
├── popup.html          # ポップアップ UI
├── popup.js            # ポップアップロジック
├── icons/              # アイコン (16 / 32 / 48 / 128px)
└── _locales/           # i18n (en / ja)
    ├── en/messages.json
    └── ja/messages.json
```

---

## ライセンス

MIT License — 詳細は [LICENSE](./LICENSE) を参照してください。
