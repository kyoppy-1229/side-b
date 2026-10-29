# SIDE-B：仮想Webの編集強化（第2弾）

2026-10-29追加制作。従来の34サイト・813コンテンツページを基準に、一般Webの現実味を深めた。物語の真相に関する新規情報は含めない。

## 変更の概要

- 2016〜2025年の背景記事590本を、サイトの種類に合わせた文体・見出し・本文構造へ変更。
- 新聞、ポータル、個人ブログ、Q&A、掲示板、百科事典、ソフト紹介、エンタメ、行政、通販、便利サイトで語り方を変えた。
- 朝凪市の共通した出来事6件を、行政・地方紙・写真ブログなど合計24本の記事から描写。
- 異なるサイトの関連する公開資料へ、ゲーム内で移動できるリンクを掲載。
- 2010年代の記事と2020〜22年の記事にそれぞれ異なる画面スタイルを適用。
- 年表イベント用にオリジナルの16:9 WebP記事画像（1600×900）を6枚生成・割り当て。

## 街の共通年表

| 年 | 出来事 | 記事を掲載するサイト |
| --- | --- | --- |
| 2017 | 市立学校のPC室を順次更新 | 市役所、地方新聞、学びナビ、PC Archive Journal |
| 2018 | 朝凪駅西口の歩道・排水設備を補修 | 市役所、地方新聞、街角写真帖、MapSquare |
| 2020 | 市立図書館の閲覧席オンライン予約を試行 | 市役所、地方新聞、日々の余白、Q-LINK |
| 2021 | 夏祭りを中央公民館から小規模映像配信 | 市役所、地方新聞、タウンナビ、日々の余白 |
| 2023 | 朝凪銀座商店街アーケード屋根の事前調査 | 市役所、地方新聞、街角写真帖、タウンナビ |
| 2024 | 郷土資料室で街の古写真を整理・デジタル化 | 市役所、地方新聞、街角写真帖、ウェブ保存庫 |

同一イベントでは年・場所・実施内容を固定し、記者・行政担当・住民・個人ブロガーはそれぞれ異なる情報を伝える。2015年の学校PC整備計画→2017年の更新、2023年の商店街調査→2026年の改修完了という既存記事との前後関係も維持した。

## 新規画像と生成指示

画像は src/assets/web/generated/ に保存。記事のタイトル・日時・記録は画像内に描かず、Vueで表示する。

| ファイル名（拡張子はWebP） | 個別生成プロンプトの主題 |
| --- | --- |
| web-town-2017-computer-room | 2017年の地方公立学校PC室、旧型モニター・交換用箱・配線、午前の自然光 |
| web-town-2018-station-walkway | 2018年の郊外駅西口、歩道補修直後の舗装、古い時計店と花屋、遠景に海 |
| web-town-2020-library-desk | 2020年秋の市立図書館、木の閲覧机、紙の番号札、ノートPC、静かな午後 |
| web-town-2021-festival-stream | 2021年の中央公民館、無観客の小規模配信準備、三脚・マイク・ノートPC・提灯 |
| web-town-2023-arcade-roof | 2023年の地方商店街、補修前の少し古いアーケード、雨上がりの日常風景 |
| web-town-2024-photo-archive | 2024年の郷土資料室、古い街の写真・スキャナー・台帳・箱、自然光 |

共通画像プロンプト：

> A high-fidelity hand-painted 2D Japanese slice-of-life animation background used as editorial imagery on a fictional local web site. Ordinary life in a quiet seaside town, grounded architecture and materials, subtle cinematic daylight, 16:9 wide composition. Historically appropriate everyday objects for the specified year. No legible text, logos, trademarks, watermarks, UI labels, horror or science-fiction elements. Every image should show a distinct location or subject.

上記の共通指示に、表のシーンを一つずつ追記して個別生成する。重要な記事の日付・数字・校内の記録を画像に書き込まない。

## 記事数と残作業

- 一般Webサイト：34サイト（29運営中・2更新停止・3閉鎖）
- コンテンツページ：837件（従来813件 + 年表に紐づく24件）
- 2016〜2025年の背景記事：590件（文体の多様化済み）
- 最終章のPC調査を学ぶ個別ガイド：6件（前回実装）
- 今回の新規画像：6枚（前回の2016〜2025年画像10枚と合わせて16枚）

年別背景記事590件には依然として共通の素材と構造が含まれ、すべてが完全に独立した取材原稿ではない。人物の立ち絵、物証、ゲーム背景など最終章の専用画像も未生成。

## 検証

- npm run check:town-chronicle
- npm run check:virtual-web
- npm run check:investigation
- npm run build

年表のチェックではイベント年と掲載日、24記事の所在、他サイトへのリンク先、画像WebPの実在、590本の背景記事、更新停止後の記事公開禁止を確認する。
