/* 里程家｜IHG 洲際優惠積木
 * <div data-travelideas-ihg></div>
 * <script src="https://travelideas88-bit.github.io/travelideas-widget/travelideas-ihg-live.js" defer></script>
 */
(() => {
  'use strict';

  const article = new URL('https://www.travelideas.tw/2023/11/Marriott-IHG-Hilton-11.html');
  const feed = new URL('/feeds/posts/default/6490677577758392527', article);
  const mounts = [...document.querySelectorAll('[data-travelideas-ihg]:not([data-ti-ihg-ready])')];
  if (!mounts.length) return;

  const styles = `
    :host{display:block}
    .ti-ihg{max-width:1040px;margin:auto;color:#2e1c15;font:16px/1.65 system-ui,-apple-system,"Noto Sans TC",sans-serif;overflow-wrap:anywhere}
    .ti-ihg *{box-sizing:border-box}
    .ti-ihg header{border-radius:16px;background:#712b19;color:white;padding:18px clamp(16px,4vw,28px)}
    .ti-ihg h2,.ti-ihg h3,.ti-ihg p{margin:0}
    .ti-ihg h2{font-size:clamp(1.35rem,4vw,1.75rem);line-height:1.35}
    .ti-ihg h3{padding:9px 15px;background:#f8e8dd;color:#712b19;font-size:1.08rem}
    .ti-ihg .jump,.ti-ihg .actions{display:flex;flex-wrap:wrap;gap:8px}
    .ti-ihg .jump{margin:14px 0}
    .ti-ihg .jump a,.ti-ihg .actions a,.ti-ihg .source a{display:inline-flex;align-items:center;min-height:44px;max-width:100%;padding:6px 13px;border:1px solid #b15c3f;border-radius:8px;color:#712b19;background:#fff;text-decoration:none;font-weight:650;font-size:.9rem}
    .ti-ihg .actions a.activity{background:#883520;color:#fff;border-color:#883520}
    .ti-ihg a:hover{text-decoration:underline}
    .ti-ihg a:focus-visible{outline:2px solid #712b19;outline-offset:2px}
    .ti-ihg .group{margin:16px 0;border:1px solid #e8cbb9;border-radius:13px;scroll-margin-top:1rem}
    .ti-ihg .group h3{border-radius:12px 12px 0 0}
    .ti-ihg .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,19rem),1fr));gap:10px;padding:12px;background:#fffaf6;border-radius:0 0 12px 12px}
    .ti-ihg .card{min-width:0;padding:12px 14px;border:1px solid #eed8ca;border-radius:10px;background:#fff}
    .ti-ihg .card p+p{margin-top:4px}
    .ti-ihg .card .actions{margin:6px 0}
    .ti-ihg .card .actions:last-child{margin-bottom:0}
    .ti-ihg .intro,.ti-ihg .status{padding:13px 15px;margin:12px 0;border:1px solid #e8cbb9;border-radius:10px;background:#fffaf6}
    .ti-ihg .source{margin-top:12px}
    @media(max-width:600px){.ti-ihg .cards{grid-template-columns:1fr;padding:9px}}
  `;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function link(text, href, className) {
    const anchor = element('a', className, text);
    anchor.href = href;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    return anchor;
  }

  const widgets = mounts.map((mount) => {
    mount.setAttribute('data-ti-ihg-ready', '');
    const root = mount.shadowRoot || mount.attachShadow({ mode: 'open' });
    const shell = element('section', 'ti-ihg');
    const header = element('header');
    header.append(element('h2', '', 'IHG 洲際酒店優惠與活動'));
    const body = element('div');
    body.setAttribute('aria-busy', 'true');
    const status = element('p', 'status', '正在載入里程家 IHG 活動…');
    status.setAttribute('role', 'status');
    body.append(status);
    shell.append(header, body);
    root.append(element('style', '', styles), shell);
    return body;
  });

  const normalize = (text) => text.replace(/[\s\u200B-\u200D\uFEFF]+/gu, '');
  const cleanText = (text) => text.replace(/\s+/gu, ' ').trim();

  function readSection(source) {
    const doc = new DOMParser().parseFromString(source, 'text/html');
    const banners = [...doc.querySelectorAll('.black-tag')];
    const first = banners.findIndex((banner) => normalize(banner.textContent) === '#洲際#IHG近期活動匯總');
    if (first < 0 || !banners[first + 1]) throw new Error('IHG section boundary missing');

    const range = doc.createRange();
    range.setStartAfter(banners[first]);
    range.setEndBefore(banners[first + 1]);
    const rows = [];
    let parts = [];

    function flush() {
      if (parts.some((part) => part.href || cleanText(part.text))) rows.push({ parts });
      parts = [];
    }

    function visit(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        parts.push({ text: node.textContent });
        return;
      }
      if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        node.childNodes.forEach(visit);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE || /^(SCRIPT|STYLE|IFRAME|OBJECT|SVG|TEMPLATE)$/.test(node.tagName)) return;

      if (node.classList.contains('section-tag')) {
        flush();
        const title = cleanText(node.textContent);
        if (title) rows.push({ title });
        return;
      }

      if (node.tagName === 'A') {
        const raw = node.getAttribute('href')?.trim();
        let url;
        try { if (raw) url = new URL(raw, article); } catch {}
        if (url && /^https?:$/.test(url.protocol)) {
          parts.push({ text: cleanText(node.textContent), href: url.href });
          return;
        }
      }

      const block = /^(DIV|BR|P|H[1-6]|LI|SECTION|ARTICLE|UL|OL|HR|TR)$/.test(node.tagName);
      if (block) flush();
      node.childNodes.forEach(visit);
      if (block) flush();
    }

    visit(range.cloneContents());
    flush();
    if (!rows.some((row) => row.title)) throw new Error('IHG groups missing');
    return rows;
  }

  function appendRow(card, parts) {
    const plain = cleanText(parts.map((part) => part.href ? '' : part.text).join(''))
      .replace(/\(\s*👉?\s*\)|（\s*👉?\s*）/gu, '')
      .replace(/(?:\s*👉\s*|\s*[（(]\s*)+$/gu, '').trim();
    const actions = new Map();

    parts.forEach((part) => {
      if (!part.href || actions.has(part.href)) return;
      const label = part.text.replace(/[)）]$/u, '').trim();
      const story = /^文章$/u.test(label) || new URL(part.href).hostname === article.hostname;
      const bare = !label || /^(?:https?:\/\/|(?:www\.)?[\w.-]+\.[a-z]{2,}\/)/i.test(label);
      actions.set(part.href, link(
        bare || /^文章$/u.test(label) ? (story ? '看文章' : '開啟連結') : label,
        part.href,
        story ? '' : 'activity',
      ));
    });

    if (plain) card.append(element('p', '', plain));
    if (actions.size) {
      const buttons = element('div', 'actions');
      buttons.append(...actions.values());
      card.append(buttons);
    }
  }

  function render(body, rows, widgetIndex) {
    const nav = element('nav', 'jump');
    nav.setAttribute('aria-label', 'IHG 活動分類');
    const sections = element('div');
    const intro = element('div', 'intro');
    let cards;
    let card;
    let groupNumber = 0;

    rows.forEach(({ title, parts }) => {
      if (title) {
        const id = 'ti-ihg-' + widgetIndex + '-' + ++groupNumber;
        const group = element('section', 'group');
        const heading = element('h3', '', title);
        heading.tabIndex = -1;
        cards = element('div', 'cards');
        group.append(heading, cards);
        sections.append(group);
        card = null;

        const jump = element('a', '', title);
        heading.id = id;
        jump.href = '#' + id;
        jump.addEventListener('click', (event) => {
          event.preventDefault();
          heading.focus({ preventScroll: true });
          group.scrollIntoView({ block: 'start' });
        });
        nav.append(jump);
        return;
      }

      const rowText = cleanText(parts.map((part) => part.text).join(''));
      if (/^[🔶\s]+$/u.test(rowText) || !normalize(rowText) && !parts.some((part) => part.href)) return;
      if (!cards) {
        appendRow(intro, parts);
        return;
      }
      if (!card || /^(?:🆕|🎡|📢|💎|🎁【|🔹|🔸|👉\s*IHG|溫馨提醒)/u.test(rowText)) {
        card = element('div', 'card');
        cards.append(card);
      }
      appendRow(card, parts);
    });

    const source = element('p', 'source');
    source.append(link('查看 Blogger 原文', article.href));
    body.replaceChildren(...(intro.childNodes.length ? [intro] : []), nav, sections, source);
  }

  function fail() {
    widgets.forEach((body) => {
      const status = element('p', 'status', '目前無法同步 IHG 活動。');
      status.setAttribute('role', 'status');
      const source = element('p', 'source');
      source.append(link('查看 Blogger 原文', article.href));
      body.replaceChildren(status, source);
      body.setAttribute('aria-busy', 'false');
    });
  }

  // Blogger's public JSONP feed can be read from the shop's separate domain.
  const callback = '__travelideasIhg_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  const script = document.createElement('script');
  feed.searchParams.set('alt', 'json-in-script');
  feed.searchParams.set('callback', callback);
  script.src = feed.href;
  script.async = true;

  function cleanup() {
    clearTimeout(timer);
    script.remove();
    delete window[callback];
  }

  const timer = setTimeout(() => {
    cleanup();
    fail();
  }, 12000);

  script.onerror = () => {
    cleanup();
    fail();
  };

  window[callback] = (data) => {
    cleanup();
    try {
      const entry = data?.entry;
      if (!entry?.content?.$t || !entry.link?.some(({ rel, href }) => rel === 'alternate' && href === article.href)) {
        throw new Error('Blogger entry missing');
      }
      const rows = readSection(entry.content.$t);
      widgets.forEach((body, index) => {
        render(body, rows, index);
        body.setAttribute('aria-busy', 'false');
      });
    } catch {
      fail();
    }
  };

  document.head.append(script);
})();
