# Obfuscator (Firefox)

**画面共有中に見せたくない文字を、その場でランダムな記号に変化させるFirefox拡張機能。**

![Firefox Browser](https://img.shields.io/badge/Firefox-Extension-FF7139?logo=firefox&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![Alpha](https://img.shields.io/badge/Status-Alpha-orange)

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
- Slack / Gmail / Docs 向けのサイト別プロファイル
- キーボードショートカットで ON/OFF と適用を素早く操作
- ページ内容から候補キーワードを自動抽出
- 大文字小文字を無視して一致させるモードに対応
- SPA・動的コンテンツにも自動追従（MutationObserver）
- `<input>` `<textarea>` `contenteditable` などの入力欄には一切干渉しない
- ポップアップ上でキーワードを隠す表示（`●●●`）に切り替え可能
- 日本語 / English の自動切り替え

---

## プライバシー・セキュリティ

- キーワードは **AES-GCM 256bit で暗号化** してデバイス内にのみ保存
- ブラウザのクラウド同期機能は使用しない
- 外部サーバーへの通信は一切なし
- Firefox のプライベートブラウジングモード対応

---

## Firefox Alpha について

このバージョンは **Alpha** です。以下の点にご注意ください：

- **完全なテストはまだ行われていません** → bug report をお待ちしています
- **最新の Chrome 版と同じ機能** を実装していますが、Firefox 固有の問題が存在する可能性があります
- **定期的に更新される** 予定です

### 既知の問題

- 一部のサイト（iframe 内）では動作しない可能性があります
- Firefox 128.0 未満では動作しません

### bug report / feature request

問題が見つかった場合は、GitHub Issues で報告をお願いします：
https://github.com/kujira-wak/obfuscator-extension/issues

---

## インストール（開発版）

```bash
git clone -b firefox-alpha https://github.com/kujira-wak/obfuscator-extension.git
cd obfuscator-extension
```

### Firefox での読み込み

1. Firefox アドレスバーに `about:debugging#/runtime/this-firefox` を入力
2. **「一時的なアドオンを読み込む」** をクリック
3. クローンしたフォルダの `manifest.json` を選択

> **注意**: 一時的なアドオンのため、Firefox 再起動時に削除されます。
> 恒久的なインストールは、Firefox ESR や他の開発環境を使用してください。

### Firefox でのテスト・デバッグ

1. `about:debugging` でアドオンを選択
2. **「Inspect」** をクリックして Developer Tools を開く
3. Console タブでエラーを確認可能

---

## ファイル構成

```
obfuscator-extension/
├── manifest.json       # 拡張機能定義 (Manifest V3)
├── content.js          # ページへの注入スクリプト
├── crypto-utils.js     # AES-GCM 暗号化ユーティリティ
├── background.js       # ホットキー処理用 service worker
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
