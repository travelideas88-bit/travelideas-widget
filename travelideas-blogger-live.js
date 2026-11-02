/* Travelideas Blogger → 1shop Live Widget | 2026-11-02
 * Source: https://www.travelideas.tw/2023/11/Marriott-IHG-Hilton-11.html
 * Put <div id="travelideas-live-offers"></div><script src=".../travelideas-blogger-live.js" defer></script> on 1shop.
 * Fetches a public Blogger JSONP feed, looks for the exact permalink, and renders full post HTML.
 */
(function () {
  'use strict';
  var ARTICLE = 'https://www.travelideas.tw/2023/11/Marriott-IHG-Hilton-11.html';
  var BLOG = 'https://www.travelideas.tw';
  var ID = 'travelideas-live-offers';
  var TARGET = document.getElementById(ID);
  if (!TARGET) { TARGET = document.createElement('div'); TARGET.id = ID; (document.currentScript && document.currentScript.parentNode ? document.currentScript.parentNode : document.body).appendChild(TARGET); }
  var root = TARGET.attachShadow ? TARGET.attachShadow({mode:'open'}) : TARGET;
  root.innerHTML = '<style> :host{display:block;max-width:100%;font:16px/1.8 system-ui,-apple-system,"Noto Sans TC",sans-serif;color:#262626} .shell{max-width:100%;background:#fff} .status{padding:18px;border:1px solid #e9e9e9;border-radius:12px;color:#555}.content{overflow-wrap:anywhere}.content img{height:auto!important;max-width:100%!important;object-fit:contain}.content iframe{max-width:100%}.content table{display:block;overflow-x:auto;max-width:100%}.content a{color:#0969da;word-break:break-word}.content .section-tag{background:#ffd700;border-radius:16px;display:inline-block;padding:6px 12px;margin:12px 0}.content div{max-width:100%}.content p{margin:.6em 0}.content [style*="font-size: large"]{font-size:1.06rem!important}.content [style*="width:"]{max-width:100%!important}.content b\\:includable{display:contents}.error{border-color:#f3c4c4;background:#fff8f8}.source{font-size:.85rem;margin-top:14px;color:#777}.source a{color:#0969da}</style><section class="shell"><div class="status" role="status">正在讀取里程家 Blogger 最新優惠內容…</div></section>';
  var shell = root.querySelector('.shell');
  function normalize(s) { try { return new URL(s).pathname.toLowerCase().replace(/\/$/,''); } catch(e) { return ''; } }
  var expectedPath = normalize(ARTICLE);
  function matches(entry){ return (entry.link||[]).some(function(l){return l.rel==='alternate' && normalize(l.href)===expectedPath;}); }
  function escapeText(s){var d=document.createElement('span');d.textContent=s;return d.innerHTML;}
  function showError(msg){shell.innerHTML='<div class="status error"><strong>目前無法同步優惠內容</strong><p>'+escapeText(msg)+'</p><a href="'+ARTICLE+'" target="_blank" rel="noopener noreferrer">前往 Blogger 閱讀最新活動</a></div>';}
  function clean(source){
    var doc=new DOMParser().parseFromString('<div id="travpost">'+source+'</div>','text/html');
    var wrap=doc.getElementById('travpost');
    wrap.querySelectorAll('script,style,iframe,object,embed,form,input,button,textarea,select,meta,link,base,svg,canvas,b\\:includable').forEach(function(n){
      // Keep text children of Blogger's layout-only b:includable tags.
      if(n.tagName && n.tagName.toLowerCase()==='b:includable'){n.replaceWith.apply(n,Array.from(n.childNodes));}else{n.remove();}
    });
    wrap.querySelectorAll('*').forEach(function(el){
      Array.from(el.attributes).forEach(function(a){
        var k=a.name.toLowerCase(),v=a.value;
        if(k.indexOf('on')===0 || k==='srcdoc' || k==='formaction')el.removeAttribute(a.name);
        if((k==='href'||k==='src') && !/^(https?:\/\/|\/\/|\/|#|data:image\/(png|gif|webp|jpeg);base64,)/i.test(v.trim()))el.removeAttribute(a.name);
      });
      if(el.tagName==='A'){el.setAttribute('target','_blank');el.setAttribute('rel','noopener noreferrer');}
      if(el.tagName==='IMG'){el.setAttribute('loading','lazy');el.removeAttribute('width');el.removeAttribute('height');}
    });
    return wrap.innerHTML;
  }
  var finished=false;
  function render(entry){
    if(finished)return;
    if(!entry.content || !entry.content.$t){showError('Blogger 文章摘要模式可能未提供完整內容，請在 Blogger 設定中確認允許完整網站摘要。');finished=true;return;}
    finished=true;
    var contents=clean(entry.content.$t);
    shell.innerHTML='<article class="content">'+contents+'</article><p class="source">資料來源：<a href="'+ARTICLE+'" target="_blank" rel="noopener noreferrer">里程家 Blogger 原文</a> · 內容以 Blogger 公開文章為準</p>';
  }
  var searches=[
    {q:'酒店優惠活動推薦', max:100},
    {q:'Marriott IHG Hilton', max:100},
    {q:null,max:150}
  ];
  function jsonp(params,ok,fail){
    var name='__travelideas_feed_'+Date.now()+'_'+Math.random().toString(36).slice(2);
    var scr=document.createElement('script'); var timer;
    function finish(){clearTimeout(timer);scr.remove();try{delete window[name];}catch(e){window[name]=undefined;}}
    window[name]=function(data){finish();ok(data);};
    var url=BLOG+'/feeds/posts/default?alt=json-in-script&callback='+encodeURIComponent(name)+'&max-results='+params.max;
    if(params.q)url+='&q='+encodeURIComponent(params.q);
    if(params.start)url+='&start-index='+params.start;
    scr.src=url; scr.async=true;
    scr.onerror=function(){finish();fail();};
    timer=setTimeout(function(){finish();fail();},15000);
    document.head.appendChild(scr);
  }
  var index=0, pages=0;
  function next(){
    if(finished)return;
    if(index>=searches.length){showError('公開 Blogger Feed 找不到指定文章。請確認網站摘要已開啟、文章公開，以及 Blogger Feed 可被讀取。');return;}
    var task=searches[index];
    jsonp(task,function(data){
      var entries=(data && data.feed && data.feed.entry)||[];
      var match=entries.find(matches);
      if(match){render(match);return;}
      // If standard search is unavailable, scan a limited number of pages as fallback.
      if(!task.q && entries.length===task.max && pages<12){pages++;task.start=(task.start||1)+task.max;next();return;}
      index++;next();
    },function(){index++;next();});
  }
  next();
})();
