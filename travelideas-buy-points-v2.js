/* 里程家 Travelideas｜酒店＋航司買分 Blogger 共用積木 v2
 * 資料來源：https://www.travelideas.tw/2023/11/Marriott-IHG-Hilton-11.html
 * Blogger HTML 模式：
 * <div data-travelideas-buy-points="all"></div>
 * <script src="https://travelideas88-bit.github.io/travelideas-widget/travelideas-buy-points-v2.js" defer></script>
 * 可選 hotel / airline，惟一般建議 all。
 * 只讀取原始文章：酒店集團買分 → 航司買分 → 酒店集團新酒店專區。
 * 各筆活動以 📌 為界；文字、排序及 href 均來自 Blogger，不內建促銷數字。
 */
(function () {
  'use strict';
  var SOURCE = 'https://www.travelideas.tw/2023/11/Marriott-IHG-Hilton-11.html';
  var FEED = 'https://www.travelideas.tw/feeds/posts/default';
  var SEL = '[data-travelideas-buy-points]';
  var targets = Array.prototype.slice.call(document.querySelectorAll(SEL)).filter(function (el) {
    return !el.hasAttribute('data-ti-bp-v2-ready');
  });
  if (!targets.length) return;
  var modes = {all: true, hotel: true, airline: true};
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function textNorm(s) { return (s || '').replace(/[\u00a0\u200b\u3000]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function matchHeading(s, val) { return textNorm(s).replace(/\s/g, '') === val.replace(/\s/g, ''); }
  function isSafeHttp(value) {
    try { var u = new URL(value, SOURCE); return /^https?:$/.test(u.protocol) ? u.href : ''; }
    catch (e) { return ''; }
  }
  function styleText() { return [
    ':host{display:block;color:#27303d;font-family:system-ui,-apple-system,"Noto Sans TC","Microsoft JhengHei",sans-serif;font-size:16px;line-height:1.6}',
    '*,*:before,*:after{box-sizing:border-box}',
    '.ti-bp-shell{max-width:100%;background:transparent}',
    '.ti-bp-heading{font-size:1.23rem;line-height:1.4;font-weight:800;color:#172b47;margin:20px 0 12px;padding:0 0 9px;border-bottom:3px solid #e4b342}',
    '.ti-bp-heading:first-child{margin-top:0}',
    '.ti-bp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:12px}',
    '.ti-bp-card{min-width:0;border:1px solid #e7eaf0;border-radius:12px;background:#fff;padding:14px 15px;box-shadow:0 2px 9px rgba(0,0,0,.035);display:flex;flex-direction:column;gap:8px}',
    '.ti-bp-title{font-size:1.04rem;font-weight:750;line-height:1.5;overflow-wrap:anywhere}',
    '.ti-bp-desc{font-size:.91rem;color:#596172;overflow-wrap:anywhere;white-space:normal}',
    '.ti-bp-links{margin-top:auto;display:flex;flex-wrap:wrap;gap:7px}',
    '.ti-bp-button{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:8px 14px;background:#f0bc3e;color:#252017!important;border:1px solid #e0aa2a;border-radius:9px;font-size:.9rem;font-weight:750;text-decoration:none!important;line-height:1.25;white-space:normal;text-align:center;overflow-wrap:anywhere;flex:1 1 150px;transition:filter .15s}',
    '.ti-bp-button:hover,.ti-bp-button:focus{filter:brightness(.94);text-decoration:none!important}',
    '.ti-bp-button.ti-bp-secondary{background:#f5f7fb;border-color:#dbe2ef;color:#243952!important}',
    '.ti-bp-info{border:1px solid #e4e7ee;border-radius:10px;padding:14px;background:#fafbfd;color:#434c5c;font-size:.92rem}',
    '.ti-bp-info a,.ti-bp-foot a{color:#175aab!important}',
    '.ti-bp-foot{margin:14px 0 0;font-size:.78rem;color:#747b89}',
    '@media(max-width:450px){.ti-bp-grid{grid-template-columns:1fr}.ti-bp-card{padding:12px}.ti-bp-button{flex:1 1 100%}}'
  ].join(''); }
  var mounts = targets.map(function (t) {
    t.setAttribute('data-ti-bp-v2-ready', '1');
    var mode = textNorm(t.getAttribute('data-travelideas-buy-points')).toLowerCase();
    if (!modes[mode]) mode = 'all';
    var root = t.attachShadow ? t.attachShadow({mode:'open'}) : t;
    root.appendChild(el('style', '', styleText()));
    var shell = el('div','ti-bp-shell');
    shell.appendChild(el('div','ti-bp-info','正在讀取里程家最新酒店與航司買分優惠…'));
    root.appendChild(shell);
    return {mode:mode,shell:shell};
  });
  function showError(message) {
    mounts.forEach(function (w) {
      w.shell.replaceChildren();
      var box=el('div','ti-bp-info',message + ' ');
      var a=el('a',null,'查看原始優惠彙整'); a.href=SOURCE; a.target='_blank'; a.rel='noopener noreferrer'; box.appendChild(a);
      w.shell.appendChild(box);
    });
  }
  function getPostHtml(entry) {return entry && entry.content && typeof entry.content.$t==='string' ? entry.content.$t : null;}
  function extractItems(html) {
    // 只讀文字節點與連結，不複製原文巢狀排版，避免把其他章節／空白區塊帶入。
    var doc = new DOMParser().parseFromString('<div id="ti-buy-points-source">'+html+'</div>', 'text/html');
    var base=doc.getElementById('ti-buy-points-source');
    if (!base) return null;
    var walker=doc.createTreeWalker(base, NodeFilter.SHOW_TEXT);
    var section=null, foundHotel=false, foundAirline=false, done=false;
    var entries=[]; var current=null; var lastLabel='';
    function finish() {
      if (!current) return;
      current.label=textNorm(current.fragments.join(' ')).replace(/^[📌\s]+/u,'').replace(/\s+([)）:：,，])/g,'$1').replace(/\s*👉\s*$/,'').trim();
      // 只把有活動名稱且至少有一條買分連結的項目納入，不輸出雜訊。
      if (current.label && current.links.length) entries.push(current);
      current=null;lastLabel='';
    }
    var n;
    while ((n=walker.nextNode()) && !done) {
      if (n.parentElement && n.parentElement.closest('script,style,template,noscript,svg')) continue;
      var raw=textNorm(n.nodeValue);
      if (!raw) continue;
      if (matchHeading(raw,'酒店集團買分')) {finish();section='hotel';foundHotel=true;continue;}
      if (section && matchHeading(raw,'航司買分')) {finish();section='airline';foundAirline=true;continue;}
      if (section && matchHeading(raw,'酒店集團新酒店專區')) {finish();done=true;break;}
      if (!section) continue;
      var a=n.parentElement && n.parentElement.closest('a[href]');
      if (a) {
        if (!current) continue;
        var href=isSafeHttp(a.getAttribute('href'));
        if (!href || current.links.some(function (l) {return l.href===href;})) continue;
        var special=/贈予|贈與|gift/i.test(lastLabel);
        var caption=special ? '積分贈與' : '立即買分';
        // 每個活動可有多個按鈕；連結跟隨該活動，而非依序號配對。
        current.links.push({href:href,caption:caption});
        lastLabel='';
        continue;
      }
      // 📌 是每筆獨立活動的邊界，無論 Blogger 把文字拆成幾個 span 都可辨識。
      if (raw.indexOf('📌')!==-1) {
        finish();
        current={type:section,fragments:[],links:[]};
        var after=textNorm(raw.slice(raw.indexOf('📌')+2)).replace(/^👉\s*/,'');
        if (after) current.fragments.push(after);
        lastLabel=after;
        continue;
      }
      if (!current) continue;
      if (/^[👉👇🔶\s]+$/u.test(raw)) continue;
      if (/^(https?:\/\/|www\.)/i.test(raw)) continue;
      if (/贈予|贈與|gift/i.test(raw)) { lastLabel=raw; continue; }
      if (/^👉/.test(raw)) raw=raw.replace(/^👉\s*/,'');
      if (!raw) continue;
      current.fragments.push(raw);
      lastLabel=raw;
    }
    finish();
    if (!foundHotel || !foundAirline || !done) return null;
    // Radisson 是酒店集團，即使 Blogger 暫時排在航空段落也歸回酒店。
    entries.forEach(function (x) { if (/\bRadisson\b/i.test(x.label)) x.type='hotel'; });
    return entries;
  }
  function render(items) {
    mounts.forEach(function (mount) {
      mount.shell.replaceChildren();
      var types=mount.mode==='all' ? ['hotel','airline'] : [mount.mode];
      types.forEach(function (type) {
        var list=items.filter(function (x) {return x.type===type;});
        if (!list.length) return;
        mount.shell.appendChild(el('h2','ti-bp-heading',type==='hotel'?'🏨 酒店集團買分':'✈️ 航司買分'));
        var grid=el('div','ti-bp-grid');
        list.forEach(function (item) {
          var card=el('div','ti-bp-card');
          // 優惠資訊是同一活動內所有文字；沒有價格就不杜撰。
          var m=item.label.match(/^(.*?)([（(][^()（）]*[)）])\s*$/);
          var name=m?textNorm(m[1]):item.label;
          var description=m?textNorm(m[2]).replace(/^[（(]|[)）]$/g,''):'';
          card.appendChild(el('div','ti-bp-title',name));
          if(description)card.appendChild(el('div','ti-bp-desc',description));
          var links=el('div','ti-bp-links');
          item.links.forEach(function (link,i) {
            var a=el('a','ti-bp-button'+(i?' ti-bp-secondary':''),link.caption + ' ↗');
            a.href=link.href;a.target='_blank';a.rel='noopener noreferrer sponsored';
            links.appendChild(a);
          });
          card.appendChild(links);grid.appendChild(card);
        });
        mount.shell.appendChild(grid);
      });
      if (!mount.shell.children.length) {showError('未找到買分活動。');return;}
      var foot=el('p','ti-bp-foot','內容與順序依 Blogger 原始文章同步。 ');
      var a=el('a',null,'查看原始文章');a.href=SOURCE;a.target='_blank';a.rel='noopener noreferrer';foot.appendChild(a);
      mount.shell.appendChild(foot);
    });
  }
  function hasMatchingPermalink(entry) {
    try {
      var expected=new URL(SOURCE).pathname.toLowerCase();
      return (entry.link||[]).some(function (link) {
        return link.rel==='alternate' && new URL(link.href).pathname.toLowerCase()===expected;
      });
    } catch (e) {return false;}
  }
  // 與已在 1shop 運作的舊檔分離，使用獨立 callback namespace，不覆蓋舊版全域變數。
  function jsonp(args,onOk,onFail) {
    var id='__ti_bp_v2_'+Date.now()+'_'+Math.random().toString(36).slice(2);
    var script=document.createElement('script');var finished=false;var timer;
    function finish() { if(finished)return false;finished=true;clearTimeout(timer);script.remove();try{delete window[id];}catch(e){window[id]=undefined;}return true; }
    window[id]=function (data) {if(finish())onOk(data);};
    var url=FEED+'?alt=json-in-script&callback='+encodeURIComponent(id)+'&max-results='+args.max+'&_='+Date.now();
    if(args.q)url+='&q='+encodeURIComponent(args.q);
    if(args.start)url+='&start-index='+args.start;
    script.src=url; script.async=true;
    script.onerror=function(){if(finish())onFail();};
    timer=setTimeout(function(){if(finish())onFail();},13000);
    document.head.appendChild(script);
  }
  var searches=[{q:'酒店優惠活動推薦',max:100},{q:'Marriott IHG Hilton',max:100},{max:150}];
  var searchIndex=0, page=0, lastError='';
  function next() {
    if(searchIndex>=searches.length) {showError(lastError||'無法在 Blogger 公開 Feed 找到指定文章，請檢查文章摘要設定。');return;}
    var args=searches[searchIndex];
    jsonp(args,function (response) {
      var entries=(response && response.feed && response.feed.entry)||[];
      var match=entries.find(hasMatchingPermalink);
      if(match) {
        var html=getPostHtml(match);
        if(!html) {showError('Blogger Feed 未提供完整文章內容。');return;}
        var items=extractItems(html);
        if(!items || !items.length) {showError('找不到完整的「酒店集團買分／航司買分」區塊，請檢查原文的三個章節標題與 📌 活動標記。');return;}
        render(items);return;
      }
      if(!args.q && entries.length===args.max && page<12) {page++;args.start=(args.start||1)+args.max;next();return;}
      searchIndex++;next();
    },function(){lastError='讀取 Blogger Feed 失敗，請稍後重新整理。';searchIndex++;next();});
  }
  next();
})();
