/* Travelideas｜Blogger 買分區塊自動同步積木
 * Source: https://www.travelideas.tw/2023/11/Marriott-IHG-Hilton-11.html
 * Use <div data-travelideas-buy-points="hotel"></div> for hotel point sales.
 * Use <div data-travelideas-buy-points="airline"></div> for airline mile sales.
 * Then include this script once per page.
 */
(function () {
  'use strict';
  var ARTICLE = 'https://www.travelideas.tw/2023/11/Marriott-IHG-Hilton-11.html';
  var BLOG = 'https://www.travelideas.tw';
  var SELECTOR = '[data-travelideas-buy-points]';
  var widgets = Array.from(document.querySelectorAll(SELECTOR)).filter(function (el) {
    return el.getAttribute('data-travelideas-init') !== '1';
  });
  if (!widgets.length) return;
  var sections = {
    hotel: {start:'酒店集團買分', end:'航司買分', title:'🏨 酒店集團買分'},
    airline: {start:'航司買分', end:'酒店集團新酒店專區', title:'✈️ 航司買分'}
  };
  var initialized = widgets.map(function (el) {
    el.setAttribute('data-travelideas-init','1');
    var kind = (el.getAttribute('data-travelideas-buy-points') || 'hotel').trim().toLowerCase();
    if (!sections[kind]) kind='hotel';
    var root=el.attachShadow ? el.attachShadow({mode:'open'}) : el;
    root.innerHTML='<style>:host{display:block;max-width:100%;font:16px/1.8 system-ui,-apple-system,"Noto Sans TC","Microsoft JhengHei",sans-serif;color:#242424}*{box-sizing:border-box}.wrap{max-width:100%;overflow:hidden}.heading{font-weight:800;font-size:1.1rem;border-left:5px solid #e9a70a;padding:6px 12px;margin:0 0 12px;background:#fff8e6}.content{overflow-wrap:anywhere;line-height:1.75}.content img{height:auto!important;max-width:100%!important}.content a{color:#1466af;word-break:break-word}.content div,.content p,.content span{max-width:100%}.content [style*="font-size: large"]{font-size:1rem!important}.content [style*="width:"]{max-width:100%!important}.content .section-tag{display:none}.status{padding:12px 14px;background:#fafafa;border:1px solid #dedede;border-radius:8px}.source{font-size:.78rem;color:#777;margin:12px 0 0}.source a{color:#1466af}</style><section class="wrap"><div class="status">正在同步里程家最新買分活動…</div></section>';
    return {el:el,root:root,kind:kind};
  });
  function escapeHtml(s){var n=document.createElement('span');n.textContent=String(s);return n.innerHTML;}
  function fail(message){initialized.forEach(function (w) {w.root.querySelector('.wrap').innerHTML='<div class="status"><strong>暫時無法載入買分優惠</strong><p>'+escapeHtml(message)+'</p><a href="'+ARTICLE+'" target="_blank" rel="noopener noreferrer">查看 Blogger 最新買分活動</a></div>';});}
  function permalink(entry) {
    return (entry.link||[]).some(function (l) {try {return l.rel==='alternate' && new URL(l.href).pathname.toLowerCase()===new URL(ARTICLE).pathname.toLowerCase();}catch(e){return false;}});
  }
  function extract(source, kind) {
    var doc=new DOMParser().parseFromString('<div id="ti-src">'+source+'</div>','text/html');
    var content=doc.getElementById('ti-src'), meta=sections[kind];
    var walker=doc.createTreeWalker(content,NodeFilter.SHOW_TEXT);var node,start=null,end=null;
    function norm(s){return String(s).replace(/\s+/g,'').replace(/　/g,'').trim();}
    while((node=walker.nextNode())) {
      var value=norm(node.textContent);
      if(!start && value===norm(meta.start)){start=node;continue;}
      if(start && value===norm(meta.end)){end=node;break;}
    }
    if(!start || !end)return null;
    // Range cuts exactly from the heading to the next heading, even in the
    // original Blogger HTML's deeply nested formatting tags.
    var range=doc.createRange();range.setStartAfter(start);range.setEndBefore(end);
    var box=doc.createElement('div');box.appendChild(range.cloneContents());
    box.querySelectorAll('script,style,iframe,object,embed,form,input,button,textarea,select,meta,link,base,svg,canvas').forEach(function(el){el.remove();});
    box.querySelectorAll('*').forEach(function(el){
      Array.from(el.attributes).forEach(function(a){
        var k=a.name.toLowerCase(),v=a.value.trim();
        if(k.startsWith('on')||k==='srcdoc'||k==='formaction')el.removeAttribute(a.name);
        if((k==='href'||k==='src') && !/^(https?:\/\/|\/\/|\/|#)/i.test(v))el.removeAttribute(a.name);
      });
      if(el.tagName==='A'){el.setAttribute('target','_blank');el.setAttribute('rel','noopener noreferrer');}
      if(el.tagName==='IMG'){el.setAttribute('loading','lazy');el.removeAttribute('width');el.removeAttribute('height');}
    });
    return box.innerHTML;
  }
  function render(entry){
    if(!entry || !entry.content || !entry.content.$t){fail('Blogger 公開 Feed 沒有提供完整文章內容。');return;}
    initialized.forEach(function(w){
      var html=extract(entry.content.$t,w.kind);
      if(!html){w.root.querySelector('.wrap').innerHTML='<div class="status">找不到「'+sections[w.kind].start+'」對應的完整區塊。請檢查 Blogger 的區塊標題是否仍相同。</div>';return;}
      w.root.querySelector('.wrap').innerHTML='<div class="heading">'+sections[w.kind].title+'</div><div class="content">'+html+'</div><p class="source">資料來源：<a href="'+ARTICLE+'" target="_blank" rel="noopener noreferrer">里程家買分活動彙整</a>｜依 Blogger 公開文章更新</p>';
    });
  }
  var tasks=[{q:'酒店優惠活動推薦',max:100},{q:'Marriott IHG Hilton',max:100},{q:null,max:150}];
  var idx=0, page=0, completed=false;
  function request(task,onOk,onError){
    var callback='__ti_points_'+Date.now()+'_'+Math.random().toString(36).slice(2);
    var tag=document.createElement('script'), timer, done=false;
    function cleanup(){clearTimeout(timer);tag.remove();try{delete window[callback];}catch(e){window[callback]=undefined;}}
    window[callback]=function(data){if(done)return;done=true;cleanup();onOk(data);};
    var url=BLOG+'/feeds/posts/default?alt=json-in-script&callback='+encodeURIComponent(callback)+'&max-results='+task.max;
    if(task.q)url+='&q='+encodeURIComponent(task.q);
    if(task.start)url+='&start-index='+task.start;
    tag.src=url;tag.async=true;
    tag.onerror=function(){if(done)return;done=true;cleanup();onError();};
    timer=setTimeout(function(){if(done)return;done=true;cleanup();onError();},12000);
    document.head.appendChild(tag);
  }
  function next(){
    if(completed)return;
    if(idx>=tasks.length){completed=true;fail('在 Blogger 公開 Feed 中找不到指定文章，請檢查 Blogger 的網站摘要設定。');return;}
    var task=tasks[idx];
    request(task,function(data){
      var entries=(data&&data.feed&&data.feed.entry)||[];
      var entry=entries.find(permalink);
      if(entry){completed=true;render(entry);return;}
      if(!task.q && entries.length===task.max && page<12){page++;task.start=(task.start||1)+task.max;next();return;}
      idx++;next();
    },function(){idx++;next();});
  }
  next();
})();
