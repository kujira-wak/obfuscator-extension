// crypto-utils.js — Obfuscator
// AES-GCM 256bit による設定値の暗号化・復号
// キーはインストール時に生成し chrome.storage.local に保持（端末外に出ない）

'use strict';

const CryptoUtils = (() => {
  const KEY_STORE  = '_obf_k';   // 鍵の保存先キー
  const DATA_STORE = '_obf_d';   // 暗号化データの保存先キー

  // 保存済み鍵を取得、なければ新規生成して保存
  async function getKey() {
    const stored = await chrome.storage.local.get(KEY_STORE);
    const raw = stored[KEY_STORE];

    if (raw) {
      return crypto.subtle.importKey(
        'raw',
        new Uint8Array(raw),
        { name: 'AES-GCM' },
        false,            // extractable: false — JS から鍵材料を取り出せない
        ['encrypt', 'decrypt']
      );
    }

    // 初回: 256bit 鍵を生成
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const exported = await crypto.subtle.exportKey('raw', key);
    await chrome.storage.local.set({ [KEY_STORE]: Array.from(new Uint8Array(exported)) });

    // 保存後は extractable: false の鍵を再インポートして使う
    return crypto.subtle.importKey(
      'raw',
      exported,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // 設定オブジェクトを暗号化して storage.local に保存
  async function saveSettings(settings) {
    const key = await getKey();
    const iv  = crypto.getRandomValues(new Uint8Array(12)); // 96bit IV
    const plaintext = new TextEncoder().encode(JSON.stringify(settings));

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plaintext
    );

    await chrome.storage.local.set({
      [DATA_STORE]: {
        iv:   Array.from(iv),
        data: Array.from(new Uint8Array(ciphertext)),
      }
    });
  }

  // storage.local から設定を復号して返す
  // 設定がなければ null を返す
  async function loadSettings() {
    const stored = await chrome.storage.local.get(DATA_STORE);
    const blob   = stored[DATA_STORE];
    if (!blob?.iv || !blob?.data) return null;

    try {
      const key       = await getKey();
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(blob.iv) },
        key,
        new Uint8Array(blob.data)
      );
      return JSON.parse(new TextDecoder().decode(decrypted));
    } catch {
      // 復号失敗（データ破損など）は null 扱い
      return null;
    }
  }

  return { saveSettings, loadSettings };
})();
