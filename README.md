# 里程家 JS 積木索引

目前有 **3 類積木、7 支 JS**。要新增文章時，從下表選用途，再複製對應的 HTML。

| 分類 | 目前使用版 | 適用情境 | 資料來源 |
| --- | --- | --- | --- |
| IHG 洲際優惠 | [IHG v2](travelideas-ihg-live-v2.js) | Blogger 原文就地排版，或在其他文章引用。寬欄雙排、手機單排，含分類跳轉及活動按鈕。 | 原文頁面的 IHG 段落，或 Blogger 公開 Feed |
| 酒店／航司買分 | [買分 v3](travelideas-buy-points-v3.js) | Blogger 文章引用買分優惠，可顯示全部、只顯示酒店或只顯示航司。 | Blogger 公開 Feed |
| 酒店優惠總覽 | [整篇同步版](travelideas-blogger-live.js) | 1shop 引用整篇酒店優惠彙整。 | Blogger 公開 Feed |

[酒店優惠彙整原文](https://www.travelideas.tw/2023/11/Marriott-IHG-Hilton-11.html)

## IHG 洲際優惠｜Blogger

在文章的 **HTML 檢視** 貼入下列兩行。貼回酒店優惠彙整原文時，放在文章最末尾並保留原有 IHG 段落，積木會在該段落的位置顯示。貼在其他文章時，放在要顯示的位置。

```html
<div data-travelideas-ihg=""></div>
<script defer="defer" src="https://cdn.jsdelivr.net/gh/travelideas88-bit/travelideas-widget@9a71bb656812475b1e3a29ac80392264d941f28a/travelideas-ihg-live-v2.js"></script>
```

## 酒店／航司買分｜Blogger

在文章的 **HTML 檢視** 貼在要顯示的位置。把 `all` 改成 `hotel` 就只顯示酒店買分，改成 `airline` 就只顯示航司買分。同一頁的指令碼放一次即可。

```html
<div data-travelideas-buy-points="all"></div>
<script defer="defer" src="https://cdn.jsdelivr.net/gh/travelideas88-bit/travelideas-widget@2e459af7594b046bfb0a616738286845fc7961ef/travelideas-buy-points-v3.js"></script>
```

## 酒店優惠總覽｜1shop

在 1shop 自訂 HTML 區塊貼在要顯示的位置。

```html
<div id="travelideas-live-offers"></div>
<script defer="defer" src="https://cdn.jsdelivr.net/gh/travelideas88-bit/travelideas-widget@6abc5e4e3f919b648be44d2a412a2dba129aa61f/travelideas-blogger-live.js"></script>
```

## 歷史版本

| 分類 | 版本 | 用途 |
| --- | --- | --- |
| IHG 洲際優惠 | [IHG 初版](travelideas-ihg-live.js) | 透過公開 Feed 顯示完整 IHG 段落，含定向活動。 |
| 酒店／航司買分 | [買分 v2](travelideas-buy-points-v2.js) | Blogger 共用買分積木的前一版。 |
| 酒店／航司買分 | [買分同步初版](travelideas-buy-points-live.js) | 酒店與航司買分各自嵌入的同步版。 |
| 酒店優惠總覽 | [2026/11/02 快照](Travelideas-JS-Widget-20261102.js) | 內建當時的文章內容，供回查。 |
