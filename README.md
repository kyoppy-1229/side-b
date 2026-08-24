# SIDE-B：終ベルの秒針（Vue + Vite）

GitHub Pages で公開する、仮想Webブラウザを舞台にした学校探索型の2D謎解きゲームです。

- ルーターは **Hash モード**（`createWebHashHistory`）です。
- メイン画面は **RE:TRACE Browser**。Messages、TRACE Search、資料をタブで往復します。
- 仮想URL・開いているタブ・タブ別履歴・未読通知はブラウザのlocalStorageへ保存されます。
- `public/docs/complete.md` には、提供された **完全まとめ（現時点）** をそのまま同梱しています。

## ローカル開発

```bash
npm ci
npm run dev
```

## ビルド

```bash
npm run build
```

`dist/` を GitHub Pages にデプロイしてください（本リポジトリには Actions ワークフローも同梱）。

## デバッグコンソール（`#/debug`）

`http://localhost:5173/side-b/#/debug` を開くと、**Game Lab** が起動します。

- 左のサイドメニュー（レールのアイコンで開閉、各項目も個別に折りたたみ可）から状態を操作し、
  右側にゲーム全体（RE:TRACE Browser・DM・掲示板・資料・2Dゲーム）をそのまま描画します。
- シナリオを1クリックで適用（本編フロー / 復刻版 / 初期版 / 仮想Web・UI / 一般Web の42種）、
  ワープ・地下ゲート・違和感・時計・フラグ・記憶・通知・タブ操作・スナップショット保存/復元に対応。
- 「一般Web」の3セクションから、34サイト・978URLを直接開けます。サイト／ページの絞り込み、
  テンプレート別のジャンプ、ランダム・最古の記事・サイト内404、検索のスコアと年代の確認、
  本編語句が一般Web側に漏れていないかの一括チェック（`本編語句の遮断チェック`）まで行えます。
  「同じタブで開く」を有効にすると、戻る／進むと履歴の動作も確認できます。
- 表示サイズ（FILL / 1280 / 1024 / 834 / 390）と倍率を切り替えてレイアウトを確認できます。

**本編タブ（`#/`）とは完全に切り離された空間です。** デバッグタブのセーブは
`debug:` 名前空間（例: `debug:side-b:game-session:v2`）に書かれ、本編のセーブは読み書きしません。
同じタブで `#/` と `#/debug` を行き来した場合は、スコープを切り替えるため自動でリロードされます。

## 体験版（`#/trial`）

`http://localhost:5173/side-b/#/trial`（公開環境では `https://<host>/side-b/#/trial`、
`/side-b/trial` でも `public/404.html` 経由で同じ場所へ入ります）から、**体験版**が始まります。

> **【暫定】いまは入口が体験版です。** ハッシュを付けずに開いたアクセス（`http://localhost:5173/side-b/`、
> 公開環境の `https://<host>/side-b/`）は起動時に `#/trial` へ寄せます（`src/trial/mode.js` の
> `TRIAL_IS_DEFAULT_ENTRY` → `applyDefaultEntry()`、呼び出しは `src/boot.js`）。本編は `#/` を、
> デバッグコンソールは `#/debug` を明示すればこれまでどおり開けます。通常版の公開に戻すときは
> `TRIAL_IS_DEFAULT_ENTRY` を `false` にするだけです。

```text
導入（同窓会 → 新PC → 再ログイン → 検索 → 水野からのDM）
→ 復刻版SIDE-Bを開く
→ 学校内を自由探索し、必須の思い出をすべて確認する
→ 復刻版クリア
→ 水野から通知 → 掲示板が昔あったらしい、という話（水野は住所を渡しません）
→ プレイヤーがTRACE Searchで一般Webを調べ、保存ログの住所を自分で組み立てる
→ 保存ログ（95レス）を読む ＝ 体験版の最後の内容
→ Messagesの「体験版を終える」→「体験版はここまでです。」
```

**保存ログへの辿り方**（`src/virtual-web/sites/` のデータのみで成立します。仕込みの解説は
`forumSites.js` 冒頭のコメント）。1ページで答えが揃わないように、日付と置き場所を別サイトに
分けてあります。

| 手がかり | 場所 | 分かること |
| --- | --- | --- |
| 雑談スレ「昔よく見てたサイトが消えてる」 | `minna-bbs.net/thread/talk/9021` | 依頼があったスレは消さずに別の場所へ移されている／案内スレがある |
| 管理人の案内スレ | `minna-bbs.net/thread/talk/1130` | ページ名は「移した日の8桁」／検索避けでアドレス直打ちのみ／**2015/03/07** に1件移した |
| 「検索に出したくないディレクトリだけを外す」 | `web-koubou.jp/entry/2015/noindex-directory` | robots.txt の実例として **`/archive/private/`** が載っている（相談元は minna-bbs.net） |
| （補助）インターネット掲示板 | `minna-pedia.jp/entry/bbs` | 非公開保存の一般的な運用（日付をページ名にする） |
| （おまけ）robots.txt | `minna-bbs.net/robots.txt` | 一覧にも検索にも出ない生ファイル。打った人だけが読める |

→ `https://minna-bbs.net/archive/private/20150307` をアドレスバーに入力して到達します。
検索・板一覧・過去ログ一覧・新規タブの候補には最後まで出ません（`noindex` / `weight: 0`）。

体験版の保存ログは**内容確認のみ**です。ページ下部の「Messagesへ戻る（物語を進める）」は
体験版では描画されず（`BrowserWorkspace.vue` → `WebSitePage` の `allow-return-messages`）、
読んでも章は進みません。水野の会話もこの1本で終わりで、以降のメッセージは追加されません。
読み終えるとMessages側に「体験版を終える」が出ます（読む前は出ません）。

- **モード判定は一箇所だけ**です。`src/trial/mode.js` が起動時（`src/boot.js`）にURLから
  `full` / `trial` を決め、以降は誰も `location` を読みません（`isTrialMode()` を参照）。
- **セーブは別名前空間**です。デバッグコンソールと同じ仕組み（`store/storage.js` のスコープ）で、
  体験版は `trial:` 接頭辞（例: `trial:side-b:story-state:v2`）に書きます。通常版を遊び終えた
  ブラウザで `#/trial` を開いても最初から始まり、体験版を遊んでも通常版の進行は変わりません。
  `#/` と `#/trial` を同じタブで行き来した場合は、スコープを切り替えるため自動でリロードされます。
- **クリア条件は必須思い出のみ**です。`src/trial/memories.js` の1つの表から、一覧・進捗・
  クリア判定・調べたときの文章がすべて導かれます（任意の思い出や通常オブジェクトは進捗に入りません）。
  思い出一覧に出るのは「○階・○○室」までで、物の名前・人物名・思い出の内容は出しません。
- **体験版が渡さないもの**は `src/trial/restrictions.js` にまとめてあります。学校アーカイブ／
  卒業記録／初期版は、検索にも新規タブの候補にも出ず、アドレスバーからも開けません
  （`store/virtualBrowser.js` の `guardTrialEdition`）。掲示板の保存ログはこの一覧には入りません。
  代わりに従来からの物語ガード（`guardPrivateStoryArchive`）が、体験版では「水野が掲示板の話を
  書いたあと」だけ通します。掲示板そのもののデータ・検索仕様は無変更です。
- 終了画面の「最初から」は、体験版の名前空間を消してリロードします（`trial/flow.js` の `restartTrial`）。
  通常版のセーブには触れません。

## 検証スクリプト

```bash
npm run check:virtual-browser
npm run check:browser-content
npm run check:virtual-web
npm run check:game
npm run check:scene
npm run check:debug
npm run check:story
npm run check:trial
npm run check:trial-flow
```

`check:scene` は校舎の当たり判定を実際に歩いて検証します。walkable な範囲を
flood fill し、(1) 入室時のスポーン地点が家具の中でないこと、(2) 両端の階段の
踊り場に歩いて到達できること、(3)「？」が付いた調べられるオブジェクトすべてに
手が届くこと、(4) 出入口の前に家具が置かれていないことを assert します。

`check:trial` は体験版のモード判定・セーブ分離・必須思い出（配置・文章・進捗・クリア判定）・
検索とURLの遮断・各画面の文言を検証します。`check:trial-flow` は Vite 経由で実際のストアと
コンポーネントを読み込み、導入から終了画面までを1本通してから、通常版が無変更であることを確認します。

`check:virtual-web` は一般Web（後述）のデータ・内部リンク・検索・本編との分離を
検証し、最後に到達可能なすべてのURLを SSR で描画して Vue の警告が出ないことを
確認します。描画を省く場合は `node scripts/check-virtual-web.mjs --no-render`。

## 仮想Web（一般Web世界）

仮想ブラウザーからは、本編用のページ（Messages / TRACE Search / 掲示板ログ /
学校アーカイブ / ゲーム本体）とは別に、**2026年現在の一般的なインターネット**を
閲覧できます。34サイト・約980URLがあり、内容は本編とは無関係な普通のWeb情報です。

```text
src/virtual-web/
├ sites/            サイト定義（データのみ）
│  ├ kit.js         defineSite()：記述の正規化
│  ├ index.js       全サイトの集約とドメイン解決
│  ├ newsSites.js   ニュース
│  ├ portalSites.js ポータル・まとめ
│  ├ techSites.js   IT・Web制作
│  ├ knowledgeSites.js 百科事典・用語辞典
│  ├ qaSites.js     Q&A
│  ├ blogSites.js   個人ブログ・写真ブログ
│  ├ forumSites.js  掲示板
│  ├ softwareSites.js フリーソフト・収録サイト
│  ├ mediaSites.js  ゲーム・映画・音楽レビュー
│  ├ civicSites.js  自治体・観光・教育
│  ├ commerceSites.js EC
│  ├ utilitySites.js 天気・地図・保存サービス
│  └ closedSites.js 閉鎖済みサイト
├ pages.js          パス解決（記事＋カテゴリ/アーカイブ等の自動生成）
├ breadcrumbs.js    パンくず
├ format.js         日付・件数・価格の表示
├ art/artwork.js    SVG画像とロゴの生成（外部画像は一切使いません）
└ search/
   ├ buildWebIndex.js 検索インデックス（初回検索時に一度だけ構築）
   ├ webSearch.js     スコアリングと年代検索
   ├ suggestions.js   検索候補
   ├ storyExclusion.js 本編語句の除外（二重防御）
   └ text.js          正規化・分割

src/components/web/    描画側（テンプレート13種＋共通パーツ）
src/assets/web/base.css 共通スタイル（サイトごとの差はCSS変数と data 属性で切替）
```

URLの解決は `src/virtual-web/registry.js` が行います。本編用の固定ルートを先に
引き当て、該当がなければドメインで一般Webのサイトを探し、`pageType:
'web-site'`（`state` に `siteId` / `path`）として返します。存在しないパスは
サイト自身の404、存在しないドメインはブラウザーの接続エラーになります。

### 31サイト目を追加する

1. 種類に合う `src/virtual-web/sites/*.js` を開き、`defineSite({ ... })` を1つ
   足して、そのファイル末尾の配列（例 `export const newsSites = ...`）に加える。
   新しい分類を作る場合はファイルを追加し、`sites/index.js` の import と
   `virtualWebSites` に並べる。
2. 必須項目は `id` / `domain` / `name` / `template` / `description` /
   `pages`。`template` は `news` `portal` `blog` `retro-blog` `forum` `qa`
   `wiki` `civic` `media` `shop` `utility` `software` `closed` から選ぶ
   （`src/components/web/templates/templateRegistry.js`）。
3. 見た目は `theme` で変える（`accent` `page` `line` `font`: sans/serif/mono/rounded、
   `width`: narrow/normal/wide、`logo`: mark/square/circle/wordmark/retro、
   `era`: modern/2010s）。ページ単位で `layout: '2010s'` を付けると、その記事だけ
   当時のレイアウトで表示されます。
4. `pages[]` の1件が1ページです。`path` `title` `kind` `date` `keywords`
   `excerpt` `body` を書きます。`body` は文字列（段落）と `{ h: '見出し' }`
   `{ ul: [...] }` `{ table: { head, rows } }` `{ img: { art, caption } }`
   `{ quote: '…' }` `{ note: '…' }` `{ links: { items } }` などの短縮記法で、
   `kind` により `posts`（レス・回答・レビュー）、`items`（収録曲・更新履歴）、
   `facts`（infobox・仕様表）も使えます。`art` に指定できる名前は
   `src/virtual-web/art/artwork.js` の `ART_KIND_NAMES`。
5. トップページ、カテゴリ一覧、月別・年別アーカイブ、タグ、`/about` `/privacy`
   `/terms` `/contact`、サイト内検索（`/search?q=`）は `pages.js` が自動生成する
   ので書く必要はありません。`categories` を定義すればカテゴリページができます。
6. 画像・ロゴはコードから生成されるため、ファイルの追加は不要です。
7. 最後に `npm run check:virtual-web` と `npm run build` を実行します。

### 本編との分離

一般Web側には本編の核心情報を一切置きません。`search/storyExclusion.js` の
`STORY_KEYWORDS` に該当する語句を含むページは、たとえ書かれていても検索
インデックスから除外されます（`check:virtual-web` が違反を検出します）。
検索候補も同じ一覧で遮断します。`SIDE-B` などで検索した場合に出るのは、
本編が用意している保存記録（`searchIndex.js` の `virtualWebDocuments`）だけです。

### 年代検索

検索語に西暦（`2015` / `2015年`）が含まれるとその年代を優先し（差0年 +28、
±1年 +15、±2年 +7、5年以上離れると −12）、含まれない場合は新しい記事に
小さな加点（最大 +12）を与えます。スコアは
`タイトル + キーワード + 本文 + カテゴリ + サイト名 + 年代 + サイト信頼度 +
ページ重要度 + 新しさ` の合計です。

## 校舎の寸法

`src/game/data/school.js` はすべてメートル単位で記述し、`PX_PER_M` で一度だけ
ピクセルに変換します（片廊下型・北side が教室、南side が校庭に面した連続窓）。

| | 寸法 |
|---|---|
| 普通教室 | 9.0m × 7.5m（前後2箇所の引戸・西面に黒板） |
| 特別教室 | 13.5m × 7.5m（1.5スパン） |
| 小部屋 | 6.75m × 7.5m |
| 廊下 | 幅 3.0m、両端に 4.0m の階段室＋2.4m の壁面 |
| 昇降口 | 12.0m × 6.0m。1階の廊下の**南側**に開く唯一の部屋 |

階の移動は校舎の階段からのみ行います（右上の 1F/2F/3F は現在地の表示専用）。
地下へは1階の廊下・西寄りの扉から降ります。階段室とは別の出入口で、原作版で
解放されるまで現れず、右上の表示にも B1 は出ません。

廊下の外の景色を描くのは1階だけです（植え込み・花壇・樹木）。2階と3階は窓のみで、
窓枠の中の空だけが見えます。どの階もカメラの枠の高さは同じなので、階を移動しても
人物の大きさは変わりません。
