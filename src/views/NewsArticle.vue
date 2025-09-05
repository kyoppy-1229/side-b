<template>
  <article class="news-article">
    <header>
      <h1>市内の男子高校生、自宅で変死体として発見</h1>
      <p class="meta">2015年3月2日 17:00</p>
    </header>
    <div class="hr"></div>
    <p>市内の男子高校生が自宅で変死体として発見されました。死亡推定時刻は昨夜20時20分ごろで、家族が帰宅した際にはすでに死亡していた模様です。</p>
    <p>警察は事件と事故の両面から調べを進めています。</p>
    <div class="toolbar">
      <button class="btn btn-primary" @click="router.back()">戻る</button>
    </div>
  </article>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.news-article {
  max-width: 640px;
  margin: 2rem auto;
  background: #ffffff;
  padding: 2rem;
  font-family: 'Georgia', serif;
  color: #222;
  line-height: 1.7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.news-article header {
  margin-bottom: 1rem;
}
.news-article h1 {
  font-size: 1.8rem;
  margin: 0 0 0.5rem;
}
.news-article .meta {
  font-size: 0.9rem;
  color: #555;
}
.news-article .hr {
  border-top: 1px solid #ccc;
  margin: 1rem 0;
}
.toolbar {
  text-align: center;
  margin-top: 2rem;
}
</style>
