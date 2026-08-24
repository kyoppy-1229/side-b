<template>
  <WebChrome owns-heading :site="site" :page="page" variant="shop" :columns="1">
    <template #header-meta>
      <WebSearchBox placeholder="商品を検索" />
      <span class="shop-cart">カート {{ cartCount }}</span>
    </template>

    <template #breadcrumb>
      <WebBreadcrumb :items="breadcrumbs" />
    </template>

    <template v-if="page.kind === 'home'">
      <section class="shop-banner">
        <div>
          <p class="shop-banner__kicker">{{ site.homeCopy.kicker || 'ピックアップ' }}</p>
          <h1 class="shop-banner__title">{{ site.homeCopy.title || site.tagline }}</h1>
          <p class="shop-banner__text">{{ site.homeCopy.lead || site.description }}</p>
        </div>
        <WebArt kind="abstract-grid" :seed="site.id" ratio="banner" class="shop-banner__art" />
      </section>

      <section class="shop-section">
        <h2 class="web-section-title">
          売れている商品
          <small>{{ products.length }}件</small>
        </h2>
        <div class="shop-grid">
          <WebLink v-for="item in products" :key="item.path" :to="item.path" variant="bare" class="shop-card">
            <WebArt :kind="item.art || 'product'" :seed="item.path" ratio="square" />
            <span class="shop-card__body">
              <span class="shop-card__brand">{{ item.data.brand }}</span>
              <span class="shop-card__name">{{ item.title }}</span>
              <span class="shop-card__price">{{ formatPrice(item.data.price) }}</span>
              <span class="shop-card__meta">
                <span class="shop-card__stars">{{ stars(item.data.rating) }}</span>
                {{ item.data.reviews || 0 }}件のレビュー
              </span>
            </span>
          </WebLink>
        </div>
      </section>
    </template>

    <template v-else-if="page.kind === 'product'">
      <article class="shop-product">
        <div class="shop-product__main web-card web-pad">
          <div class="shop-product__gallery">
            <WebArt :kind="page.art || 'product'" :seed="page.path" ratio="square" />
            <div class="shop-product__thumbs">
              <WebArt v-for="index in 3" :key="index" :kind="page.art || 'product'" :seed="`${page.path}:${index}`" ratio="square" />
            </div>
          </div>

          <div class="shop-product__info">
            <p class="shop-product__brand">{{ page.data.brand }}</p>
            <h1 class="web-title">{{ page.heading }}</h1>
            <p class="shop-product__rating">
              <span class="shop-card__stars">{{ stars(page.data.rating) }}</span>
              {{ page.data.rating }}（{{ page.data.reviews || 0 }}件）
            </p>
            <p class="shop-product__price">
              {{ formatPrice(page.data.price) }}
              <small v-if="page.data.listPrice">通常価格 {{ formatPrice(page.data.listPrice) }}</small>
            </p>
            <p class="shop-product__stock" :data-stock="page.data.stock || 'in'">
              {{ page.data.stockText || '在庫あり — 通常2〜3日で発送' }}
            </p>
            <div class="shop-product__actions">
              <button class="web-button" type="button" @click="addToCart">カートに入れる</button>
              <button class="web-button web-button--ghost" type="button" @click="saved = !saved">
                {{ saved ? 'お気に入り登録済み' : 'お気に入りに追加' }}
              </button>
            </div>
            <p v-if="cartMessage" class="shop-product__flash" role="status">{{ cartMessage }}</p>
            <ul v-if="page.facts.length" class="shop-product__spec">
              <li v-for="fact in page.facts" :key="fact.label">
                <span>{{ fact.label }}</span>
                <strong>{{ fact.value }}</strong>
              </li>
            </ul>
          </div>
        </div>

        <section class="web-card web-pad shop-product__desc">
          <h2 class="web-section-title">商品説明</h2>
          <WebBlocks :blocks="page.blocks" :seed="page.path" />
        </section>

        <section v-if="page.posts.length" class="web-card web-pad">
          <h2 class="web-section-title">カスタマーレビュー<small>{{ page.posts.length }}件</small></h2>
          <ul class="shop-reviews">
            <li v-for="post in page.posts" :key="post.no">
              <div>
                <span class="shop-card__stars">{{ stars(post.likes) }}</span>
                <strong>{{ post.name }}</strong>
                <span>{{ post.date }}</span>
              </div>
              <p>{{ post.text }}</p>
            </li>
          </ul>
        </section>

        <section v-if="related.length" class="web-card web-pad">
          <h2 class="web-section-title">この商品を見た人はこちらも見ています</h2>
          <div class="shop-grid shop-grid--small">
            <WebLink v-for="item in related" :key="item.path" :to="item.path" variant="bare" class="shop-card">
              <WebArt :kind="item.art || 'product'" :seed="item.path" ratio="square" />
              <span class="shop-card__body">
                <span class="shop-card__name">{{ item.title }}</span>
                <span class="shop-card__price">{{ formatPrice(item.data.price) }}</span>
              </span>
            </WebLink>
          </div>
        </section>
      </article>
    </template>

    <template v-else-if="isListing">
      <section class="web-card web-pad">
        <h1 class="web-title">{{ page.heading }}</h1>
        <p class="shop-count">{{ (page.listing || []).length }}件の商品</p>
        <div class="shop-grid">
          <WebLink v-for="item in page.listing" :key="item.path" :to="item.path" variant="bare" class="shop-card">
            <WebArt :kind="item.art || 'product'" :seed="item.path" ratio="square" />
            <span class="shop-card__body">
              <span class="shop-card__brand">{{ item.data.brand }}</span>
              <span class="shop-card__name">{{ item.title }}</span>
              <span class="shop-card__price">{{ formatPrice(item.data.price) }}</span>
            </span>
          </WebLink>
        </div>
      </section>
    </template>

    <WebDefaultBody v-else :site="site" :page="page" :query="query" list-variant="card" />
  </WebChrome>
</template>

<script setup>
import { computed, ref } from 'vue'
import { buildBreadcrumbs } from '../../../virtual-web/breadcrumbs.js'
import { relatedArticles, siteArticles } from '../../../virtual-web/pages.js'
import { formatPrice } from '../../../virtual-web/format.js'
import WebArt from '../parts/WebArt.vue'
import WebBlocks from '../parts/WebBlocks.vue'
import WebBreadcrumb from '../parts/WebBreadcrumb.vue'
import WebChrome from '../parts/WebChrome.vue'
import WebDefaultBody from '../parts/WebDefaultBody.vue'
import WebLink from '../parts/WebLink.vue'
import WebSearchBox from '../parts/WebSearchBox.vue'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true },
  query: { type: Object, default: () => ({}) }
})

const cartCount = ref(0)
const cartMessage = ref('')
const saved = ref(false)
const products = computed(() => siteArticles(props.site))
const breadcrumbs = computed(() => buildBreadcrumbs(props.site, props.page))
const related = computed(() => relatedArticles(props.site, props.page, 4))
const isListing = computed(() => ['category', 'tag', 'archive-index', 'archive-year', 'archive-month'].includes(props.page.kind))

// The cart is local to the open page: nothing is ordered, nothing is stored.
function addToCart(){
  cartCount.value += 1
  cartMessage.value = 'カートに追加しました（この店舗は現在ご注文を受け付けていません）'
}

function stars(rating){
  const value = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)))
  return '★'.repeat(value) + '☆'.repeat(5 - value)
}
</script>

<style scoped>
.shop-cart{
  padding:4px 10px;
  border:1px solid var(--web-line);
  border-radius:999px;
  font-size:10px;
}

.shop-banner{
  display:grid;
  grid-template-columns:minmax(0,1fr) 300px;
  gap:18px;
  align-items:center;
  padding:20px 22px;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  background:linear-gradient(120deg, var(--web-accent-soft), var(--web-surface));
}

.shop-banner__kicker{ margin:0 0 6px; color:var(--web-accent); font-size:10px; font-weight:800 }
.shop-banner__title{ margin:0 0 8px; font-size:21px; font-weight:800; line-height:1.45 }
.shop-banner__text{ margin:0; color:var(--web-muted); font-size:12px; line-height:1.75 }
.shop-banner__art{ border-radius:var(--web-radius); overflow:hidden }

.shop-section{ margin-top:20px }

.shop-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill, minmax(168px, 1fr));
  gap:14px;
}

.shop-grid--small{ grid-template-columns:repeat(auto-fill, minmax(132px, 1fr)) }

.shop-card{
  display:flex;
  flex-direction:column;
  overflow:hidden;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  background:var(--web-surface);
}

.shop-card:hover{ border-color:var(--web-accent) }
.shop-card__body{ display:flex; flex-direction:column; gap:4px; padding:11px 12px 13px }
.shop-card__brand{ color:var(--web-muted); font-size:10px }
.shop-card__name{ font-size:12px; font-weight:700; line-height:1.5 }
.shop-card__price{ color:#c0392b; font-size:14px; font-weight:800 }
.shop-card__meta{ color:var(--web-muted); font-size:10px }
.shop-card__stars{ color:#e8a33d; letter-spacing:.04em }

.shop-product__main{
  display:grid;
  grid-template-columns:minmax(0,320px) minmax(0,1fr);
  gap:24px;
}

.shop-product__gallery{ display:grid; gap:9px }
.shop-product__gallery > :deep(.web-art){ border:1px solid var(--web-line); border-radius:var(--web-radius) }
.shop-product__thumbs{ display:grid; grid-template-columns:repeat(3, 1fr); gap:8px }
.shop-product__thumbs :deep(.web-art){ border:1px solid var(--web-line); border-radius:6px }

.shop-product__brand{ margin:0 0 6px; color:var(--web-muted); font-size:11px }
.shop-product__rating{ margin:0 0 10px; color:var(--web-muted); font-size:11px }

.shop-product__price{
  margin:0 0 6px;
  color:#c0392b;
  font-size:25px;
  font-weight:800;
}

.shop-product__price small{ display:block; color:var(--web-muted); font-size:10px; font-weight:400 }

.shop-product__stock{ margin:0 0 14px; color:#1f7a4d; font-size:11.5px }
.shop-product__stock[data-stock="low"]{ color:#c0392b }
.shop-product__stock[data-stock="out"]{ color:var(--web-muted) }

.shop-product__actions{ display:flex; flex-wrap:wrap; gap:9px }
.shop-product__flash{ margin:10px 0 0; color:var(--web-accent); font-size:10.5px }

.shop-product__spec{
  margin:16px 0 0;
  padding:0;
  list-style:none;
  border-top:1px solid var(--web-line);
}

.shop-product__spec li{
  display:flex;
  justify-content:space-between;
  gap:12px;
  padding:7px 0;
  border-bottom:1px dotted var(--web-line);
  font-size:11.5px;
}

.shop-product__spec span{ color:var(--web-muted) }
.shop-product__desc{ margin-top:16px }
.shop-count{ margin:0 0 12px; color:var(--web-muted); font-size:11px }

.shop-reviews{ margin:0; padding:0; list-style:none }
.shop-reviews li{ padding:11px 0; border-bottom:1px dotted var(--web-line) }
.shop-reviews li > div{ display:flex; flex-wrap:wrap; align-items:baseline; gap:9px; margin-bottom:4px; font-size:11px }
.shop-reviews span:last-of-type{ color:var(--web-muted); font-size:10px }
.shop-reviews p{ margin:0; font-size:12px; line-height:1.75 }

@media (max-width:760px){
  .shop-banner,
  .shop-product__main{ grid-template-columns:minmax(0,1fr) }
}
</style>
