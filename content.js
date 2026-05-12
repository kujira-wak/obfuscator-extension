// content.js — Obfuscator
'use strict';

(() => {
  if (window.__obfuscatorRunning) return;
  window.__obfuscatorRunning = true;

  // ── 文字セット ──────────────────────────────────────────────
  const CHARS_ASCII =
    '∀∂∃∅∆∇∈∉∋∏∑∞∟∠∡∣∥∦∧∨∩∪∫∬∭∮∴∵∶∷∼∽' +
    'ℬℭℯℰℱℳℴℵℶℷℸℙℚℛℜℝℤℨ' +
    'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ' +
    'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω' +
    'ДЖЗИЙЛФЦЧШЩЪЫЬЭЮЯджзийлфцчшщъыьэюя' +
    '¢£¥§©®°±¼½¾×÷' +
    '░▒▓█▄▀■□▲△▶◆◇○●◐◑♠♡♢♣★☆♪♫←↑→↓↔↕' +
    '0123456789';

  const CHARS_CJK =
    '亜哀愛悪握圧扱安暗案異移医意育一壱逸稲飲印因引宇羽雨運雲永泳英栄営影鋭衛易液駅悦越謁円援演煙遠' +
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
    'ァィゥェォッャュョヴ〓〔〕《》「」【】〒〜※＊×÷≠≦≧∞∴♂♀°℃';

  const CHARS_LATIN_EXT =
    'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ';

  function randomChar(ch) {
    const cp = ch.codePointAt(0);
    if (cp >= 0x3000) return CHARS_CJK      [Math.random() * CHARS_CJK.length      | 0];
    if (cp >= 0x0080) return CHARS_LATIN_EXT[Math.random() * CHARS_LATIN_EXT.length | 0];
    return               CHARS_ASCII        [Math.random() * CHARS_ASCII.length      | 0];
  }

  // ── スキップ判定 ────────────────────────────────────────────
  const SKIP_TAGS = new Set([
    'SCRIPT','STYLE','NOSCRIPT','LINK','META',
    'TEXTAREA','INPUT','SELECT','BUTTON','OPTION','OPTGROUP',
    'CODE','PRE','KBD','SAMP','VAR',
    'SVG','MATH','CANVAS','VIDEO','AUDIO','IFRAME','EMBED','OBJECT',
  ]);
  const SKIP_ANCESTOR_SEL = [
    '[contenteditable]','[role="textbox"]','[role="combobox"]',
    '[role="listbox"]','[role="searchbox"]','[role="spinbutton"]',
    '[aria-live="assertive"]','[data-obf-span]',
  ].join(',');

  function shouldSkipNode(node) {
    const p = node.parentElement;
    if (!p) return true;
    if (SKIP_TAGS.has(p.tagName)) return true;
    if (p.closest(SKIP_ANCESTOR_SEL)) return true;
    if (!node.textContent.trim()) return true;
    if (node.textContent.length > 2000) return true;
    return false;
  }

  function collectTextNodes(root) {
    const nodes = [], walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) { if (!shouldSkipNode(n)) nodes.push(n); }
    return nodes;
  }

  // ── ラッピング ──────────────────────────────────────────────
  function wrapTargets(root, targets, ignoreCase = false) {
    if (!targets.length) return;
    if (root.nodeType === Node.ELEMENT_NODE && root.hasAttribute('data-obf-span')) return;

    for (const textNode of collectTextNodes(root)) {
      const text = textNode.textContent;
      const haystack = ignoreCase ? text.toLowerCase() : text;
      const matches = [];
      for (const t of targets) {
        const needle = ignoreCase ? t.toLowerCase() : t;
        let pos = 0;
        while (pos < text.length) {
          const idx = haystack.indexOf(needle, pos);
          if (idx === -1) break;
          matches.push({
            index: idx,
            end: idx + t.length,
            original: text.slice(idx, idx + t.length),
          });
          pos = idx + t.length;
        }
      }
      if (!matches.length) continue;

      matches.sort((a, b) => a.index - b.index);
      const deduped = []; let cursor = 0;
      for (const m of matches) {
        if (m.index >= cursor) { deduped.push(m); cursor = m.end; }
      }

      const frag = document.createDocumentFragment();
      let last = 0;
      for (const m of deduped) {
        if (m.index > last)
          frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const span = document.createElement('span');
        span.setAttribute('data-obf-span', 'true');
        span.setAttribute('data-obf-orig', m.original);
        span.style.cssText =
          'display:inline;font:inherit;color:inherit;background:none;' +
          'padding:0;margin:0;border:none;text-decoration:inherit;';
        span.textContent = m.original;
        frag.appendChild(span);
        last = m.end;
      }
      if (last < text.length)
        frag.appendChild(document.createTextNode(text.slice(last)));

      pauseObserver();
      try { textNode.parentNode.replaceChild(frag, textNode); }
      finally { resumeObserver(); }
    }
  }

  // ── アンラップ ──────────────────────────────────────────────
  function unwrapAll() {
    pauseObserver();
    try {
      for (const span of document.querySelectorAll('[data-obf-span="true"]'))
        span.replaceWith(document.createTextNode(span.getAttribute('data-obf-orig') ?? ''));
      document.body.normalize();
    } finally { resumeObserver(); }
  }

  // ── アニメーション（rAF）───────────────────────────────────
  let rafId = null, lastTick = 0;
  const INTERVAL = 50;

  function animLoop(ts) {
    if (ts - lastTick >= INTERVAL) {
      lastTick = ts;
      
      // メインドキュメントのスパン更新
      for (const span of document.querySelectorAll('[data-obf-span="true"]')) {
        const orig = span.getAttribute('data-obf-orig') ?? '';
        span.textContent = [...orig].map(ch =>
          (ch === ' ' || ch === '\u3000') ? ch : randomChar(ch)
        ).join('');
      }
      
      // フレーム内のスパン更新
      const frames = document.querySelectorAll('frame, iframe');
      for (const frame of frames) {
        try {
          const framedoc = frame.contentDocument;
          if (framedoc) {
            for (const span of framedoc.querySelectorAll('[data-obf-span="true"]')) {
              const orig = span.getAttribute('data-obf-orig') ?? '';
              span.textContent = [...orig].map(ch =>
                (ch === ' ' || ch === '\u3000') ? ch : randomChar(ch)
              ).join('');
            }
          }
        } catch {
          // クロスオリジン or アクセス不可 → スキップ
        }
      }
    }
    rafId = requestAnimationFrame(animLoop);
  }

  function startAnimation() { if (rafId == null) rafId = requestAnimationFrame(animLoop); }
  function stopAnimation()  { if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; } }

  // ── フレーム内への処理適用 ─────────────────────────────────
  function applyToFrames(targets, ignoreCase = false) {
    const frames = document.querySelectorAll('frame, iframe');
    for (const frame of frames) {
      try {
        const framedoc = frame.contentDocument;
        if (framedoc && framedoc.body) {
          wrapTargets(framedoc.body, targets, ignoreCase);
          startObserverForFrame(framedoc, targets, ignoreCase);
        }
      } catch {
        // クロスオリジン or アクセス不可 → スキップ
      }
    }
  }

  // ── MutationObserver（デバウンス付き）─────────────────────
  let observer = null, frameObservers = new Map();
  let observerPaused = false;
  let debounceTimer = null, pendingNodes = [];

  function pauseObserver()  { observerPaused = true;  }
  function resumeObserver() { observerPaused = false; }

  function startObserver(targets, ignoreCase = false) {
    if (observer) observer.disconnect();
    observer = new MutationObserver(mutations => {
      if (observerPaused) return;
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) pendingNodes.push(node);
          if (node.nodeType === Node.TEXT_NODE && node.parentElement)
            pendingNodes.push(node.parentElement);
        }
      }
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const batch = [...new Set(pendingNodes)]; pendingNodes = [];
        for (const node of batch) {
          if (document.contains(node)) wrapTargets(node, targets, ignoreCase);
        }
      }, 120);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function startObserverForFrame(framedoc, targets, ignoreCase = false) {
    if (!framedoc.body) return;
    const key = framedoc.defaultView?.location?.href ?? 'unknown';
    if (frameObservers.has(key)) {
      frameObservers.get(key).disconnect();
    }
    const frameObs = new MutationObserver(mutations => {
      if (observerPaused) return;
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE && framedoc.contains(node))
            wrapTargets(node, targets, ignoreCase);
          if (node.nodeType === Node.TEXT_NODE && node.parentElement && framedoc.contains(node.parentElement))
            wrapTargets(node.parentElement, targets, ignoreCase);
        }
      }
    });
    frameObs.observe(framedoc.body, { childList: true, subtree: true });
    frameObservers.set(key, frameObs);
  }

  function stopObserver() {
    if (observer) { observer.disconnect(); observer = null; }
    for (const obs of frameObservers.values()) { obs.disconnect(); }
    frameObservers.clear();
    clearTimeout(debounceTimer); pendingNodes = [];
  }

  // ── 設定適用 ────────────────────────────────────────────────
  function applySettings(settings) {
    stopAnimation(); stopObserver(); unwrapAll();

    const ignoreCase = settings?.ignoreCase === true;
    const targets = (settings?.targets ?? [])
      .map(t => (typeof t === 'string' ? t.trim() : ''))
      .filter(t => t.length > 0 && t.length <= 100)
      .filter((t, idx, arr) => {
        if (!ignoreCase) return arr.indexOf(t) === idx;
        const lower = t.toLowerCase();
        return arr.findIndex(v => v.toLowerCase() === lower) === idx;
      })
      .slice(0, 30);

    if (settings?.enabled === false || !targets.length) return;

    wrapTargets(document.body, targets, ignoreCase);
    applyToFrames(targets, ignoreCase);
    startAnimation();
    startObserver(targets, ignoreCase);
  }

  // ── 起動: 暗号化ストレージから復元 ─────────────────────────
  // popup → content へ平文で渡す経路（sendMessage）は
  // 拡張機能内部通信のみで外部には出ない
  CryptoUtils.loadSettings().then(data => {
    if (data) applySettings(data);
  });

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === 'UPDATE_SETTINGS') {
      applySettings(msg.settings ?? {});
      sendResponse({ ok: true });
    } else if (msg?.type === 'CHECK_KEYWORDS') {
      const keywords = msg.keywords ?? [];
      const ignoreCase = msg.ignoreCase === true;
      const found = [];

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      const seen = new Set();
      let node;
      while (node = walker.nextNode()) {
        if (!node.textContent.trim()) continue;
        const text = node.textContent;
        for (const keyword of keywords) {
          if (seen.has(keyword)) continue;
          const match = ignoreCase
            ? text.toLowerCase().includes(keyword.toLowerCase())
            : text.includes(keyword);
          if (match) {
            found.push(keyword);
            seen.add(keyword);
          }
        }
      }

      sendResponse({ found });
    }
    return false;
  });

})();
