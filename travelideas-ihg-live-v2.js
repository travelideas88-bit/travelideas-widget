/* 里程家｜Blogger IHG 洲際優惠積木
 * 將 <div data-travelideas-ihg=""></div> 與本指令碼放在 Blogger 文章末尾。
 * 原文以頁面上的 IHG 段落排版，其他文章讀取原文的公開 Blogger Feed。
 */
(() => {
  'use strict';

  const article = new URL('https://www.travelideas.tw/2023/11/Marriott-IHG-Hilton-11.html');
  const feed = new URL('/feeds/posts/default/6490677577758392527', article);
  const mounts = [...document.querySelectorAll('[data-travelideas-ihg]:not([data-ti-ihg-ready])')];
  if (!mounts.length) return;

  const styles = `
    :host{display:block;container-type:inline-size;max-width:100%;margin:24px 0;text-align:start}
    .ti-ihg{--ink:#301b16;--rust:#852d1c;--orange:#a93620;--line:#e9d6ca;--paper:#fff9f4;max-width:1040px;margin:auto;color:var(--ink);font:16px/1.65 system-ui,-apple-system,"Noto Sans TC",sans-serif;overflow-wrap:anywhere}
    .ti-ihg *{box-sizing:border-box}
    .ti-ihg header{background:linear-gradient(115deg,#522018,#87301f 68%,#a73922);color:#fff;border-radius:16px;padding:clamp(18px,4vw,30px);border-bottom:4px solid #e68957}
    .ti-ihg h2,.ti-ihg h3,.ti-ihg p{margin:0}
    .ti-ihg h2{color:inherit;font-size:clamp(1.4rem,4vw,1.95rem);line-height:1.25;letter-spacing:.015em}
    .ti-ihg .jump,.ti-ihg .actions{display:flex;flex-wrap:wrap;gap:8px}
    .ti-ihg .jump{margin:16px 0 22px}
    .ti-ihg .jump a,.ti-ihg .actions a,.ti-ihg .intro a{display:inline-flex;align-items:center;min-height:44px;max-width:100%;padding:6px 12px;border:1px solid #c99c87;border-radius:8px;color:var(--rust);background:#fff;text-decoration:none;font-weight:650;font-size:.9rem;line-height:1.4}
    .ti-ihg .jump a{min-height:38px;border-radius:20px;background:var(--paper)}
    .ti-ihg .actions a.activity,.ti-ihg .intro a{background:var(--orange);color:#fff;border-color:var(--orange)}
    .ti-ihg a:hover{text-decoration:underline}
    .ti-ihg a:focus-visible{outline:2px solid var(--rust);outline-offset:2px}
    .ti-ihg .group{margin:0 0 22px;scroll-margin-top:1rem}
    .ti-ihg h3{border-left:4px solid var(--orange);border-radius:0 9px 9px 0;background:#f8e9df;color:var(--rust);font-size:1.09rem;line-height:1.45;padding:9px 13px;margin-bottom:10px}
    .ti-ihg .cards{display:grid;grid-template-columns:minmax(0,1fr);gap:10px}
    .ti-ihg .card{min-width:0;display:flex;flex-direction:column;gap:7px;padding:14px 15px;border:1px solid var(--line);border-radius:11px;background:#fff}
    .ti-ihg .card.featured{border-top:3px solid var(--orange);background:var(--paper)}
    .ti-ihg .card p:first-child{font-weight:700;line-height:1.5}
    .ti-ihg .card .actions{margin-top:auto;padding-top:3px}
    .ti-ihg .intro,.ti-ihg .status{padding:13px 15px;margin:12px 0;border:1px solid var(--line);border-radius:10px;background:var(--paper)}
    @container (min-width:560px){.ti-ihg .cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
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

  function findSection(root) {
    const banners = [...root.querySelectorAll('.black-tag')];
    const first = banners.findIndex((banner) => normalize(banner.textContent) === '#洲際#IHG近期活動匯總');
    const start = banners[first];
    const end = banners[first + 1];
    if (first < 0 || !end || normalize(end.textContent) !== '#萬豪#Marriott') {
      throw new Error('IHG section boundary missing');
    }
    const range = root.ownerDocument.createRange();
    range.setStartBefore(start);
    range.setEndBefore(end);
    return { range, start };
  }

  function readSection(fragment) {
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

      if (node.classList.contains('black-tag')) return;

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

    visit(fragment);
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
    let hiddenGroup = false;

    rows.forEach(({ title, parts }) => {
      if (title) {
        hiddenGroup = normalize(title) === '定向活動';
        if (hiddenGroup) return;
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

      if (hiddenGroup) return;
      const rowText = cleanText(parts.map((part) => part.text).join(''));
      if (/^[🔶\s]+$/u.test(rowText) || !normalize(rowText) && !parts.some((part) => part.href)) return;
      if (!cards) {
        appendRow(intro, parts);
        return;
      }
      if (!card || /^(?:🆕|🎡|📢|💎|🎁【|🔹|🔸|👉\s*IHG|溫馨提醒)/u.test(rowText)) {
        card = element('div', rowText.startsWith('🆕') ? 'card featured' : 'card');
        cards.append(card);
      }
      appendRow(card, parts);
    });

    body.replaceChildren(...(intro.childNodes.length ? [intro] : []), nav, sections);
    body.setAttribute('aria-busy', 'false');
  }

  function fail() {
    widgets.forEach((body) => {
      const status = element('p', 'status', '目前無法載入 IHG 活動。');
      status.setAttribute('role', 'status');
      body.replaceChildren(status);
      body.setAttribute('aria-busy', 'false');
    });
  }

  // Use the article DOM on the source page, including Blogger's article preview.
  const originalPost = document.getElementById('post-body-6490677577758392527');
  if (originalPost && mounts.some((mount) => originalPost.contains(mount))) {
    try {
      const { range, start } = findSection(originalPost);
      const rows = readSection(range.cloneContents());
      const index = mounts.findIndex((mount) => originalPost.contains(mount));
      widgets.forEach((body, index) => render(body, rows, index));
      const placement = document.createComment('IHG widget');
      start.before(placement);
      range.setStartAfter(placement);
      range.deleteContents();
      placement.replaceWith(mounts[index]);
    } catch {
      fail();
    }
    return;
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
      const source = new DOMParser().parseFromString(entry.content.$t, 'text/html');
      const { range } = findSection(source.body);
      const rows = readSection(range.cloneContents());
      widgets.forEach((body, index) => render(body, rows, index));
    } catch {
      fail();
    }
  };

  document.head.append(script);
})();
