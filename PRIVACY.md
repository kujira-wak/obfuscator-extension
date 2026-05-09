# Privacy Policy — Obfuscator

*Last updated: 2025*

---

## Summary

Obfuscator does not collect, store, or transmit any personal data to any server.  
All settings are encrypted and kept entirely on your device.

---

## What data is stored

When you register keywords in Obfuscator, those keywords are:

- Encrypted with **AES-GCM 256-bit** before being written to disk
- Stored only in `chrome.storage.local` (on your device, never synced to Google's servers)
- Never transmitted to any external server or third party

No browsing history, page content, or usage analytics are collected.

---

## Permissions explained

| Permission | Why it's needed |
|---|---|
| `storage` | Save your encrypted keyword settings locally on your device |
| `activeTab` | Apply obfuscation to the tab you're currently viewing when you click "Apply" |
| `scripting` | Inject the obfuscation script into the page |
| `host_permissions: <all_urls>` | Allow you to use the extension on any website you choose to open it on |

---

## Third parties

Obfuscator communicates with no third-party services whatsoever.

---

## Changes to this policy

Any changes will be reflected in this document with an updated date.

---

## Contact

Questions? Open an issue at [github.com/kujira-wak/obfuscator-extension](https://github.com/kujira-wak/obfuscator-extension)
