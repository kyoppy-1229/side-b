<template>
  <article class="news-article">
    <!-- アイキャッチ画像: 警察の規制線などをイメージしたダミー画像 -->
    <figure class="eyecatch">
      <img src="https://min-chi.material.jp/mc/materials/background-c/condominium/_condominium_2.jpg" alt="ニュース速報のイメージ画像" />
    </figure>

    <div class="article-body">
      <header class="article-header">
        <p class="source">JNN（ジャパン・ニュース・ネットワーク）</p>
        
        <h1>都内のマンションで男子高校生が死亡 自宅で発見、事件・事故両面で捜査</h1>
        
        <p class="meta">
          <!-- 日時を現在に近いものに更新 -->
          <time datetime="2025-09-05T23:15:00+09:00">2025年9月5日 23:15</time>
        </p>
      </header>
      
      <div class="article-content">
        <p class="lead">
          5日午後9時半ごろ、東京都のマンションの一室で、この部屋に住む都立高校2年の男子生徒（17）が自室で倒れているのを帰宅した母親（45）が発見し、119番通報しました。男子生徒は心肺停止の状態で、その場で死亡が確認されました。
        </p>
        <p>
          警視庁によりますと、男子生徒は自室のベッドの上で仰向けの状態で倒れており、発見時に目立った外傷はなかったということです。部屋が荒らされた形跡もなく、遺書のようなものは見つかっていません。
        </p>
        <p>
          男子生徒は両親と3人暮らしで、発見当時は1人で自宅にいたとみられています。家族は「普段と変わった様子はなかった」と話しているということです。
        </p>
        <p>
          現場は住宅街にあるマンションで、近隣住民からは「おとなしい感じの生徒で、会えば挨拶をしてくれた。こんなことになるなんて信じられない」といった声が聞かれました。
        </p>
        <p>
          警視庁は、事件と事故の両面で詳しい経緯を調べるとともに、6日にも司法解剖を行って死因の特定を進める方針です。
        </p>
      </div>
    </div>

    <footer class="toolbar">
      <button class="btn-back" @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        <span>戻る</span>
      </button>
    </footer>
  </article>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
/* 基本的なリセットとフォント設定 */
body {
  background-color: #f0f2f5; /* 背景色を少しグレーに */
}

.news-article {
  max-width: 720px;
  margin: 3rem auto;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden; /* 角丸を画像に適用するため */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Kaku Gothic ProN', 'メイリオ', Meiryo, sans-serif;
  color: #333;
}

/* アイキャッチ画像 */
.eyecatch {
  margin: 0;
  width: 100%;
  aspect-ratio: 16 / 9; /* 画像のアスペクト比を固定 */
  background-color: #e5e7eb;
}
.eyecatch img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 画像がコンテナにフィットするように */
}

/* 記事本文エリア */
.article-body {
  padding: 2rem 2.5rem;
}

/* ヘッダー */
.article-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1.5rem;
}

.source {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4f46e5; /* テーマカラー */
  margin-bottom: 0.5rem;
}

h1 {
  font-size: 2.25rem; /* 見出しを大きく */
  font-weight: 800; /* より太く */
  line-height: 1.4;
  margin: 0;
  color: #111827;
}

.meta {
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 1rem;
}

/* 記事本文 */
.article-content p {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1.5em;
  color: #374151;
}

.article-content p.lead {
  font-weight: 600;
  color: #1f2937;
}

.article-content p:last-child {
  margin-bottom: 0;
}

/* フッターとボタン */
.toolbar {
  text-align: center;
  padding: 1.5rem 2.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #4b5563;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.btn-back:hover {
  background-color: #f3f4f6;
  color: #111827;
  border-color: #9ca3af;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.btn-back svg {
  transition: transform 0.2s ease-in-out;
}

.btn-back:hover svg {
  transform: translateX(-3px);
}
</style>
