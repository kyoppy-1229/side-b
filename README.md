# SIDE-B：終ベルの秒針（Vue + Vite）

GitHub Pages で公開する横スク×謎解きゲームのスターターです。
- ルーターは **Hash モード**（`createWebHashHistory`）。
- メイン画面は **水野とのDM**。ユーザー操作でのみシーンが進みます。
- `public/docs/complete.md` に、提供いただいた **完全まとめ（現時点）** を **一字一句省略せず** 同梱しています（アプリ内の「資料」から閲覧可能）。

## ローカル開発

```bash
npm i
npm run dev
```

## ビルド

```bash
npm run build
```

`dist/` を GitHub Pages にデプロイしてください（本リポジトリには Actions ワークフローも同梱）。
