<template>
  <main class="school-archive">
    <header class="archive-header">
      <div class="archive-header__inner">
        <button
          v-if="isGraduationPage"
          class="archive-header__back"
          type="button"
          @click="emit('open-url', VIRTUAL_URLS.SCHOOL_ARCHIVE)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
          アーカイブ
        </button>
        <span v-else class="archive-header__brand">
          <span aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M4 8.5 12 4l8 4.5v10H4v-10Z" />
              <path d="M8 19v-6h8v6M3 9l9-6 9 6" />
            </svg>
          </span>
          <span>
            <strong>学校アーカイブ</strong>
            <small>SCHOOL RECORDS</small>
          </span>
        </span>
        <span class="archive-header__status">
          <i aria-hidden="true"></i>
          保存記録
        </span>
      </div>
    </header>

    <template v-if="isGraduationPage">
      <article class="graduation-record">
        <nav class="archive-breadcrumb" aria-label="パンくずリスト">
          <button type="button" @click="emit('open-url', VIRTUAL_URLS.SCHOOL_ARCHIVE)">学校アーカイブ</button>
          <span aria-hidden="true">/</span>
          <span>卒業記録</span>
          <span aria-hidden="true">/</span>
          <span aria-current="page">2015</span>
        </nav>

        <header class="graduation-record__title">
          <p>GRADUATION RECORD · 2015</p>
          <h1>2015年度 卒業記録</h1>
          <span>卒業式に関する保存資料</span>
        </header>

        <section class="graduation-feature">
          <figure>
            <img :src="birdPhoto" alt="卒業式で配られた青い鳥のぬいぐるみ" />
          </figure>
          <div>
            <p class="archive-kicker">記念品記録</p>
            <h2>青い鳥のぬいぐるみ</h2>
            <p>
              卒業式で配られた記念品。卒業生には一人につき一匹が配られたと記録されています。
            </p>
            <dl>
              <div>
                <dt>分類</dt>
                <dd>卒業記念品</dd>
              </div>
              <div>
                <dt>外観</dt>
                <dd>青い鳥をかたどったぬいぐるみ</dd>
              </div>
              <div>
                <dt>確認事項</dt>
                <dd>背中の縫い目が粗い個体が確認されている</dd>
              </div>
            </dl>
          </div>
        </section>

        <section class="archive-document">
          <header>
            <span class="archive-document__number">01</span>
            <span>
              <p class="archive-kicker">同封資料</p>
              <h2>集合写真</h2>
            </span>
          </header>
          <figure class="archive-document__image">
            <img :src="classPhoto" alt="卒業時の集合写真" />
            <figcaption>卒業記念品の中から確認された集合写真。</figcaption>
          </figure>
          <p>
            青い鳥のぬいぐるみの中に、集合写真が収められていた例が確認されています。
            撮影を欠席した一名は別撮りされ、写真右上に加えられています。
          </p>
        </section>

        <aside class="archive-notice">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
          </svg>
          <p>このページは保存された会話内で確認できる情報を整理したものです。</p>
        </aside>
      </article>
    </template>

    <template v-else>
      <section class="archive-home">
        <div class="archive-home__hero">
          <p>LOCAL SCHOOL RECORDS</p>
          <h1>残された学校の記録を、<br />静かに辿る。</h1>
          <span>卒業式や記念品に関する保存資料を閲覧できます。</span>
        </div>

        <section class="archive-collection" aria-labelledby="archive-collection-title">
          <header>
            <span>
              <p>COLLECTION</p>
              <h2 id="archive-collection-title">保存コレクション</h2>
            </span>
            <small>1件の記録</small>
          </header>

          <button
            class="archive-card"
            type="button"
            @click="emit('open-url', VIRTUAL_URLS.SCHOOL_GRADUATION_2015)"
          >
            <span class="archive-card__image">
              <img :src="birdPhoto" alt="青い鳥のぬいぐるみ" />
              <span>2015</span>
            </span>
            <span class="archive-card__body">
              <small>卒業記録</small>
              <strong>2015年度 卒業式</strong>
              <span>青い鳥の記念品と集合写真に関する保存資料。</span>
              <i>
                記録を開く
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
              </i>
            </span>
          </button>
        </section>

        <section class="archive-about">
          <span class="archive-about__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M5 4h14v16H5V4Z" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
          </span>
          <span>
            <h2>このアーカイブについて</h2>
            <p>閉校にまつわる学校資料を閲覧するための仮想アーカイブです。記録は確認できた内容のみを掲載しています。</p>
          </span>
        </section>
      </section>
    </template>

    <footer class="archive-footer">
      <span>SCHOOL ARCHIVE · RE:TRACE LOCAL NETWORK</span>
      <span>保存記録</span>
    </footer>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import birdPhoto from '../../photo/鳥.jpg'
import classPhoto from '../../photo/集合写真.png'
import { VIRTUAL_PAGE_TYPES, VIRTUAL_URLS } from '../../virtual-web/constants.js'

const props = defineProps({
  page: { type: String, default: VIRTUAL_PAGE_TYPES.SCHOOL_ARCHIVE }
})

const emit = defineEmits(['open-url'])
const isGraduationPage = computed(() => {
  return props.page === VIRTUAL_PAGE_TYPES.SCHOOL_GRADUATION ||
    props.page === VIRTUAL_URLS.SCHOOL_GRADUATION_2015 ||
    props.page === 'graduation'
})
</script>

<style scoped>
.school-archive{
  min-height:100%;
  overflow:auto;
  background:#f4f2ec;
  color:#29352e;
  font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.archive-header{
  position:sticky;
  top:0;
  border-bottom:1px solid rgba(73, 88, 77, 0.17);
  background:rgba(249, 248, 244, 0.95);
  backdrop-filter:blur(12px);
  z-index:3;
}

.archive-header__inner{
  width:min(100% - 40px, 1050px);
  min-height:65px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  margin:0 auto;
}

.archive-header__brand{
  display:flex;
  align-items:center;
  gap:10px;
}

.archive-header__brand > span:first-child{
  width:37px;
  height:37px;
  display:grid;
  place-items:center;
  border-radius:11px;
  background:#536a58;
  color:#fff;
}

.archive-header__brand svg{
  width:21px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.6;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.archive-header__brand > span:last-child{
  display:flex;
  flex-direction:column;
  gap:2px;
}

.archive-header__brand strong{
  font-size:13px;
}

.archive-header__brand small{
  color:#7b877e;
  font-size:7px;
  font-weight:900;
  letter-spacing:0.14em;
}

.archive-header__status{
  display:flex;
  align-items:center;
  gap:6px;
  color:#6d796f;
  font-size:9px;
  font-weight:700;
}

.archive-header__status i{
  width:7px;
  height:7px;
  border-radius:50%;
  background:#769b79;
  box-shadow:0 0 0 4px rgba(118, 155, 121, 0.12);
}

.archive-header__back{
  display:flex;
  align-items:center;
  gap:5px;
  padding:8px 10px;
  border:0;
  border-radius:9px;
  background:transparent;
  color:#506157;
  font-size:10px;
  font-weight:800;
  cursor:pointer;
}

.archive-header__back:hover{
  background:#e8e9e3;
}

.archive-header__back svg{
  width:16px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.9;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.archive-header__back:focus-visible,
.archive-breadcrumb button:focus-visible,
.archive-card:focus-visible{
  outline:3px solid rgba(83, 106, 88, 0.26);
  outline-offset:3px;
}

.archive-home{
  width:min(100% - 40px, 1050px);
  margin:0 auto;
  padding:0 0 68px;
}

.archive-home__hero{
  padding:clamp(58px, 9vw, 105px) 0 70px;
  background:
    linear-gradient(90deg, #f4f2ec 0%, rgba(244, 242, 236, 0.87) 60%, transparent 100%),
    radial-gradient(circle at 80% 50%, rgba(107, 134, 112, 0.16), transparent 36%);
}

.archive-home__hero > p,
.archive-collection header p,
.archive-kicker{
  margin:0;
  color:#718277;
  font-size:8px;
  font-weight:900;
  letter-spacing:0.17em;
}

.archive-home__hero h1{
  max-width:670px;
  margin:13px 0 17px;
  color:#28372d;
  font-family:Georgia, 'Yu Mincho', 'Hiragino Mincho ProN', serif;
  font-size:clamp(31px, 5vw, 51px);
  font-weight:500;
  line-height:1.4;
  letter-spacing:0.03em;
}

.archive-home__hero > span{
  color:#65726a;
  font-size:12px;
  line-height:1.8;
}

.archive-collection > header{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:20px;
  padding-bottom:15px;
  border-bottom:1px solid #cfd2ca;
}

.archive-collection header h2{
  margin:6px 0 0;
  font-family:Georgia, 'Yu Mincho', serif;
  font-size:21px;
  font-weight:500;
}

.archive-collection header small{
  color:#7b857d;
  font-size:9px;
}

.archive-card{
  width:100%;
  min-width:0;
  display:grid;
  grid-template-columns:minmax(200px, 38%) minmax(0, 1fr);
  margin-top:22px;
  padding:0;
  overflow:hidden;
  border:1px solid #d3d5ce;
  border-radius:18px;
  background:#fdfcf8;
  color:inherit;
  text-align:left;
  cursor:pointer;
  box-shadow:0 12px 32px rgba(49, 61, 52, 0.07);
  transition:transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
}

.archive-card:hover{
  transform:translateY(-3px);
  border-color:#aeb9ae;
  box-shadow:0 19px 38px rgba(49, 61, 52, 0.12);
}

.archive-card__image{
  position:relative;
  min-height:260px;
  overflow:hidden;
  background:#d9ded7;
}

.archive-card__image::after{
  position:absolute;
  inset:0;
  background:linear-gradient(180deg, transparent 55%, rgba(25, 40, 29, 0.3));
  content:'';
}

.archive-card__image img{
  width:100%;
  height:100%;
  display:block;
  object-fit:cover;
  transition:transform 400ms ease;
}

.archive-card:hover .archive-card__image img{
  transform:scale(1.025);
}

.archive-card__image > span{
  position:absolute;
  right:13px;
  bottom:12px;
  padding:5px 9px;
  border-radius:999px;
  background:rgba(247, 246, 241, 0.91);
  color:#46584b;
  font-size:9px;
  font-weight:900;
  z-index:1;
}

.archive-card__body{
  display:flex;
  align-items:flex-start;
  justify-content:center;
  flex-direction:column;
  padding:clamp(27px, 5vw, 56px);
}

.archive-card__body > small{
  color:#78867b;
  font-size:9px;
  font-weight:800;
  letter-spacing:0.08em;
}

.archive-card__body > strong{
  margin-top:8px;
  font-family:Georgia, 'Yu Mincho', serif;
  font-size:clamp(21px, 3vw, 29px);
  font-weight:500;
}

.archive-card__body > span{
  margin-top:13px;
  color:#657268;
  font-size:11px;
  line-height:1.8;
}

.archive-card__body i{
  display:flex;
  align-items:center;
  gap:5px;
  margin-top:23px;
  color:#526c59;
  font-size:10px;
  font-style:normal;
  font-weight:800;
}

.archive-card__body i svg{
  width:14px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
}

.archive-about{
  display:flex;
  align-items:flex-start;
  gap:16px;
  margin-top:30px;
  padding:22px;
  border:1px solid #d9dbd4;
  border-radius:15px;
  background:rgba(255, 255, 255, 0.42);
}

.archive-about__icon{
  width:41px;
  height:41px;
  display:grid;
  place-items:center;
  border-radius:12px;
  background:#e1e6df;
  color:#5f7665;
  flex:0 0 auto;
}

.archive-about__icon svg{
  width:20px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.6;
  stroke-linecap:round;
}

.archive-about h2{
  margin:0 0 5px;
  font-size:12px;
}

.archive-about p{
  margin:0;
  color:#69776d;
  font-size:10px;
  line-height:1.7;
}

.graduation-record{
  width:min(100% - 40px, 900px);
  margin:0 auto;
  padding:24px 0 72px;
}

.archive-breadcrumb{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:7px;
  color:#819087;
  font-size:8px;
}

.archive-breadcrumb button{
  padding:0;
  border:0;
  background:transparent;
  color:#5e7565;
  font:inherit;
  text-decoration:underline;
  text-underline-offset:2px;
  cursor:pointer;
}

.graduation-record__title{
  padding:55px 0 34px;
  border-bottom:1px solid #cfd2ca;
}

.graduation-record__title p{
  margin:0;
  color:#718277;
  font-size:8px;
  font-weight:900;
  letter-spacing:0.16em;
}

.graduation-record__title h1{
  margin:12px 0 9px;
  font-family:Georgia, 'Yu Mincho', serif;
  font-size:clamp(30px, 5vw, 46px);
  font-weight:500;
  letter-spacing:0.04em;
}

.graduation-record__title > span{
  color:#738077;
  font-size:11px;
}

.graduation-feature{
  display:grid;
  grid-template-columns:minmax(240px, 42%) minmax(0, 1fr);
  gap:clamp(30px, 6vw, 66px);
  padding:52px 0;
  border-bottom:1px solid #cfd2ca;
}

.graduation-feature figure{
  min-height:350px;
  margin:0;
  overflow:hidden;
  border-radius:16px;
  background:#d9ded7;
  box-shadow:0 16px 34px rgba(47, 60, 50, 0.12);
}

.graduation-feature figure img{
  width:100%;
  height:100%;
  display:block;
  object-fit:cover;
}

.graduation-feature > div{
  display:flex;
  justify-content:center;
  flex-direction:column;
}

.graduation-feature h2,
.archive-document h2{
  margin:9px 0 14px;
  font-family:Georgia, 'Yu Mincho', serif;
  font-size:clamp(22px, 3vw, 31px);
  font-weight:500;
}

.graduation-feature > div > p:not(.archive-kicker),
.archive-document > p{
  margin:0;
  color:#5f6e64;
  font-size:11px;
  line-height:1.9;
}

.graduation-feature dl{
  margin:24px 0 0;
  border-top:1px solid #d3d6ce;
}

.graduation-feature dl > div{
  display:grid;
  grid-template-columns:82px minmax(0, 1fr);
  gap:12px;
  padding:10px 0;
  border-bottom:1px solid #d9dcd5;
  font-size:9px;
  line-height:1.6;
}

.graduation-feature dt{
  color:#7b897f;
  font-weight:800;
}

.graduation-feature dd{
  margin:0;
  color:#536057;
}

.archive-document{
  padding:52px 0;
  border-bottom:1px solid #cfd2ca;
}

.archive-document > header{
  display:flex;
  align-items:center;
  gap:15px;
  margin-bottom:22px;
}

.archive-document__number{
  width:45px;
  height:45px;
  display:grid;
  place-items:center;
  border:1px solid #aeb8ae;
  border-radius:50%;
  color:#69796d;
  font-family:Georgia, serif;
  font-size:14px;
}

.archive-document h2{
  margin:5px 0 0;
}

.archive-document__image{
  margin:0 0 23px;
}

.archive-document__image img{
  width:100%;
  max-height:470px;
  display:block;
  border-radius:13px;
  object-fit:cover;
  box-shadow:0 14px 30px rgba(44, 56, 47, 0.11);
}

.archive-document__image figcaption{
  margin-top:9px;
  color:#7b877f;
  font-size:8px;
}

.archive-notice{
  display:flex;
  align-items:flex-start;
  gap:10px;
  margin-top:27px;
  padding:14px 16px;
  border:1px solid #d7dad3;
  border-radius:12px;
  background:rgba(255, 255, 255, 0.5);
  color:#6e7c72;
}

.archive-notice svg{
  width:18px;
  flex:0 0 auto;
  fill:none;
  stroke:currentColor;
  stroke-width:1.6;
  stroke-linecap:round;
}

.archive-notice p{
  margin:0;
  font-size:9px;
  line-height:1.7;
}

.archive-footer{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:15px;
  padding:17px max(20px, calc((100% - 1050px) / 2));
  border-top:1px solid #d3d5cf;
  background:#e9e8e2;
  color:#7c877f;
  font-size:7px;
  font-weight:800;
  letter-spacing:0.1em;
}

@media (max-width:680px){
  .archive-header__inner,
  .archive-home,
  .graduation-record{
    width:min(100% - 24px, 1050px);
  }

  .archive-home__hero{
    padding:54px 0;
  }

  .archive-card,
  .graduation-feature{
    grid-template-columns:1fr;
  }

  .archive-card__image{
    min-height:210px;
  }

  .archive-card__body{
    padding:27px 23px;
  }

  .graduation-feature{
    gap:27px;
    padding:36px 0;
  }

  .graduation-feature figure{
    min-height:270px;
  }

  .archive-footer{
    align-items:flex-start;
    flex-direction:column;
    padding:16px 12px;
  }
}
</style>
