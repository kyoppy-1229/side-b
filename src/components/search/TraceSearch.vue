<template>
  <main class="trace-search" :class="{ 'trace-search--home': !submittedQuery }">
    <section class="search-shell" aria-labelledby="trace-search-title">
      <header class="search-brand">
        <span class="search-brand__mark" aria-hidden="true">
          <i></i><i></i><i></i>
        </span>
        <span>
          <strong id="trace-search-title">TRACE</strong>
          <small>LOCAL INDEX SEARCH</small>
        </span>
      </header>

      <form class="search-form" role="search" @submit.prevent="submitSearch">
        <label for="trace-query" class="visually-hidden">TRACE Searchで検索</label>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.75" cy="10.75" r="6.5" />
          <path d="m15.5 15.5 4.5 4.5" />
        </svg>
        <input
          id="trace-query"
          ref="searchInput"
          v-model="draftQuery"
          type="search"
          placeholder="Webを検索"
          autocomplete="off"
          spellcheck="false"
          role="combobox"
          aria-expanded="false"
          aria-autocomplete="list"
          @focus="suggestOpen = true"
          @input="suggestOpen = true"
          @keydown.escape="suggestOpen = false"
          @blur="closeSuggestSoon"
        />
        <button type="submit">検索</button>

        <ul v-if="suggestOpen && liveSuggestions.length" class="search-suggest" aria-label="検索候補">
          <li v-for="suggestion in liveSuggestions" :key="suggestion">
            <button type="button" @mousedown.prevent="searchSuggestion(suggestion)">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.75" cy="10.75" r="6.5" />
                <path d="m15.5 15.5 4.5 4.5" />
              </svg>
              {{ suggestion }}
            </button>
          </li>
        </ul>
      </form>

      <template v-if="!submittedQuery">
        <p class="search-home__lead">保存された記録と、一般のWebページをまとめて検索します。</p>
        <div class="search-suggestions" aria-label="最近の検索">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            type="button"
            @click="searchSuggestion(suggestion)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {{ suggestion }}
          </button>
        </div>

        <p class="search-home__section">よく検索されている語句</p>
        <div class="search-suggestions" aria-label="よく検索されている語句">
          <button
            v-for="suggestion in popularSuggestions"
            :key="suggestion"
            type="button"
            class="search-suggestions__soft"
            @click="searchSuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>

        <div class="search-home__privacy">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3 5 6v5c0 4.8 2.8 8.1 7 10 4.2-1.9 7-5.2 7-10V6l-7-3Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>
            <strong>仮想ネットワーク内検索</strong>
            <small>入力内容が外部検索サービスへ送信されることはありません。</small>
          </span>
        </div>
      </template>

      <template v-else>
        <div class="search-summary" aria-live="polite">
          <span>約{{ report.total }}件の結果（{{ elapsed }}秒）</span>
          <span>
            検索語: {{ submittedQuery }}
            <template v-if="report.years.length"> ／ {{ report.years.join('・') }}年前後を優先</template>
          </span>
        </div>

        <section v-if="fullResults.length" class="search-results" aria-label="検索結果">
          <SearchResult
            v-for="result in visibleResults"
            :key="result.id"
            :result="result"
            @open-url="emit('open-url', $event)"
          />

          <nav v-if="pageCount > 1" class="search-pager" aria-label="検索結果のページ送り">
            <button type="button" :disabled="page <= 1" @click="goToPage(page - 1)">前へ</button>
            <button
              v-for="number in pageNumbers"
              :key="number"
              type="button"
              :aria-current="number === page"
              @click="goToPage(number)"
            >{{ number }}</button>
            <button type="button" :disabled="page >= pageCount" @click="goToPage(page + 1)">次へ</button>
          </nav>
        </section>

        <section v-if="partialResults.length" class="search-results search-results--partial" aria-label="一部の語句に一致した結果">
          <p class="search-partial__note">
            一部の語句のみに一致した結果を表示しています。
          </p>
          <SearchResult
            v-for="result in partialResults"
            :key="result.id"
            :result="result"
            @open-url="emit('open-url', $event)"
          />
        </section>

        <section v-if="!results.length" class="search-empty" aria-live="polite">
          <span class="search-empty__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m15.25 15.25 4.75 4.75M8.5 8.5l4 4m0-4-4 4" />
            </svg>
          </span>
          <h2>一致するページはありません</h2>
          <p>語句を短くするか、別のキーワードで検索してください。</p>
          <button type="button" @click="clearSearch">検索ホームへ戻る</button>
        </section>

        <section v-if="relatedQueries.length" class="search-related" aria-label="関連する検索">
          <h2>他のキーワード</h2>
          <div class="search-suggestions">
            <button
              v-for="suggestion in relatedQueries"
              :key="suggestion"
              type="button"
              class="search-suggestions__soft"
              @click="searchSuggestion(suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </section>
      </template>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import {
  HOME_SUGGESTIONS,
  searchSuggestions,
  searchVirtualWebDetailed,
  TRACE_SEARCH_SUGGESTIONS
} from '../../virtual-web/searchIndex.js'
import SearchResult from './SearchResult.vue'

const props = defineProps({
  query: { type: String, default: '' }
})

const emit = defineEmits(['open-url', 'search'])
const RESULTS_PER_PAGE = 10

const draftQuery = ref(props.query)
const submittedQuery = ref(props.query.trim())
const searchInput = ref(null)
const suggestOpen = ref(false)
const page = ref(1)
const suggestions = TRACE_SEARCH_SUGGESTIONS
const popularSuggestions = HOME_SUGGESTIONS

const report = computed(() => searchVirtualWebDetailed(submittedQuery.value))
const results = computed(() => report.value.results)
const fullResults = computed(() => results.value.filter((result) => !result.partial))
const partialResults = computed(() => results.value.filter((result) => result.partial))
const pageCount = computed(() => Math.max(1, Math.ceil(fullResults.value.length / RESULTS_PER_PAGE)))
const pageNumbers = computed(() => Array.from({ length: pageCount.value }, (unused, index) => index + 1))
const visibleResults = computed(() => fullResults.value.slice((page.value - 1) * RESULTS_PER_PAGE, page.value * RESULTS_PER_PAGE))
const liveSuggestions = computed(() => searchSuggestions(draftQuery.value))
const relatedQueries = computed(() => (submittedQuery.value ? searchSuggestions(submittedQuery.value).slice(0, 6) : []))

// A plausible-looking latency, derived from the query so it does not flicker.
const elapsed = computed(() => (0.08 + (submittedQuery.value.length % 7) * 0.03).toFixed(2))

let closeTimer = 0

watch(() => props.query, value => {
  draftQuery.value = value
  submittedQuery.value = value.trim()
  page.value = 1
})

function submitSearch(){
  submittedQuery.value = draftQuery.value.trim()
  suggestOpen.value = false
  page.value = 1
  emit('search', submittedQuery.value)
}

function searchSuggestion(suggestion){
  draftQuery.value = suggestion
  submittedQuery.value = suggestion
  suggestOpen.value = false
  page.value = 1
  emit('search', suggestion)
}

function clearSearch(){
  draftQuery.value = ''
  submittedQuery.value = ''
  page.value = 1
  emit('search', '')
  nextTick(() => searchInput.value?.focus())
}

function goToPage(next){
  page.value = Math.min(Math.max(next, 1), pageCount.value)
}

// Let a click on a suggestion land before the list closes.
function closeSuggestSoon(){
  window.clearTimeout(closeTimer)
  closeTimer = window.setTimeout(() => { suggestOpen.value = false }, 120)
}
</script>

<style scoped>
.trace-search{
  width:100%;
  min-height:100%;
  overflow:auto;
  background:#fbfcfe;
  color:#25344b;
  font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.search-shell{
  width:min(100% - 40px, 850px);
  margin:0 auto;
  padding:38px 0 64px;
}

.trace-search--home .search-shell{
  width:min(100% - 40px, 680px);
  padding-top:clamp(70px, 11vh, 130px);
}

.search-brand{
  display:flex;
  align-items:center;
  justify-content:flex-start;
  gap:11px;
  margin-bottom:24px;
}

.trace-search--home .search-brand{
  justify-content:center;
  margin-bottom:29px;
}

.search-brand__mark{
  position:relative;
  width:40px;
  height:40px;
  display:grid;
  place-items:center;
  border-radius:13px;
  background:#2869c7;
  box-shadow:0 9px 20px rgba(40, 105, 199, 0.23);
}

.search-brand__mark i{
  position:absolute;
  width:18px;
  height:2px;
  border-radius:999px;
  background:#fff;
  transform-origin:left center;
}

.search-brand__mark i:nth-child(1){ transform:translate(-7px, -6px) rotate(15deg) }
.search-brand__mark i:nth-child(2){ width:23px; transform:translate(-9px, 0) }
.search-brand__mark i:nth-child(3){ transform:translate(-7px, 6px) rotate(-15deg) }

.search-brand > span:last-child{
  display:flex;
  flex-direction:column;
  line-height:1;
}

.search-brand strong{
  color:#1c304d;
  font-size:21px;
  letter-spacing:0.1em;
}

.search-brand small{
  margin-top:6px;
  color:#7a8a9f;
  font-size:7px;
  font-weight:900;
  letter-spacing:0.16em;
}

.search-form{
  display:flex;
  align-items:center;
  gap:10px;
  padding:7px 7px 7px 17px;
  border:1px solid #d3deec;
  border-radius:18px;
  background:#fff;
  box-shadow:0 10px 28px rgba(38, 60, 91, 0.1);
  transition:border-color 180ms ease, box-shadow 180ms ease;
}

.search-form:focus-within{
  border-color:#6f9ddc;
  box-shadow:0 0 0 4px rgba(44, 111, 208, 0.12), 0 13px 30px rgba(38, 60, 91, 0.12);
}

.search-form > svg{
  width:20px;
  color:#64768e;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
  flex:0 0 auto;
}

.search-form input{
  min-width:0;
  flex:1;
  padding:9px 0;
  border:0;
  outline:0;
  background:transparent;
  color:#22324a;
  font:inherit;
  font-size:14px;
}

.search-form button,
.search-empty button{
  padding:10px 17px;
  border:0;
  border-radius:12px;
  background:#2869c7;
  color:#fff;
  font-size:11px;
  font-weight:800;
  cursor:pointer;
  transition:background 180ms ease, transform 180ms ease;
}

.search-form button:hover,
.search-empty button:hover{
  background:#1d58a8;
  transform:translateY(-1px);
}

.search-form button:focus-visible,
.search-empty button:focus-visible,
.search-suggestions button:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.26);
  outline-offset:3px;
}

.search-home__lead{
  margin:22px 0 18px;
  color:#738297;
  font-size:11px;
  line-height:1.7;
  text-align:center;
}

.search-suggestions{
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  gap:8px;
}

.search-suggestions button{
  display:flex;
  align-items:center;
  gap:6px;
  padding:8px 12px;
  border:1px solid #dce4ee;
  border-radius:999px;
  background:#fff;
  color:#50637b;
  font-size:10px;
  cursor:pointer;
  transition:border-color 180ms ease, background 180ms ease, color 180ms ease;
}

.search-suggestions button:hover{
  border-color:#91acd0;
  background:#eef4fc;
  color:#285e9f;
}

.search-suggestions svg{
  width:13px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
}

.search-home__privacy{
  display:flex;
  align-items:center;
  gap:11px;
  max-width:410px;
  margin:46px auto 0;
  padding:13px 15px;
  border:1px solid #e1e7ef;
  border-radius:14px;
  background:#f5f8fb;
  color:#68788c;
}

.search-home__privacy svg{
  width:22px;
  flex:0 0 auto;
  fill:none;
  stroke:#4c7fb9;
  stroke-width:1.6;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.search-home__privacy span{
  display:flex;
  flex-direction:column;
  gap:3px;
}

.search-home__privacy strong{
  font-size:10px;
}

.search-home__privacy small{
  font-size:8px;
  line-height:1.5;
}

.search-summary{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:15px;
  padding:18px 2px 5px;
  color:#7c899b;
  font-size:9px;
}

.search-results{
  padding-bottom:30px;
}

.search-empty{
  display:flex;
  align-items:center;
  flex-direction:column;
  padding:76px 20px;
  text-align:center;
}

.search-empty__icon{
  width:62px;
  height:62px;
  display:grid;
  place-items:center;
  border-radius:20px;
  background:#edf2f8;
  color:#6d819b;
}

.search-empty__icon svg{
  width:29px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.6;
  stroke-linecap:round;
}

.search-empty h2{
  margin:18px 0 7px;
  font-size:17px;
}

.search-empty p{
  margin:0 0 18px;
  color:#718096;
  font-size:11px;
}

.search-form{
  position:relative;
}

.search-suggest{
  position:absolute;
  z-index:5;
  top:calc(100% + 6px);
  left:0;
  right:0;
  margin:0;
  padding:6px;
  border:1px solid #d3deec;
  border-radius:14px;
  background:#fff;
  box-shadow:0 14px 34px rgba(38, 60, 91, 0.16);
  list-style:none;
}

.search-suggest button{
  display:flex;
  align-items:center;
  gap:9px;
  width:100%;
  padding:8px 11px;
  border:0;
  border-radius:9px;
  background:transparent;
  color:#2f4058;
  font:inherit;
  font-size:12px;
  text-align:left;
  cursor:pointer;
}

.search-suggest button:hover{ background:#eef4fc }

.search-suggest svg{
  width:13px;
  flex:0 0 auto;
  color:#8b9bb0;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
}

.search-home__section{
  margin:26px 0 10px;
  color:#8894a5;
  font-size:9px;
  font-weight:800;
  letter-spacing:.08em;
  text-align:center;
}

.search-suggestions__soft{
  border-style:dashed !important;
}

.search-pager{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  padding:22px 0 6px;
}

.search-pager button{
  min-width:32px;
  padding:6px 10px;
  border:1px solid #dce4ee;
  border-radius:8px;
  background:#fff;
  color:#3c536f;
  font-size:11px;
  cursor:pointer;
}

.search-pager button[aria-current="true"]{
  border-color:#2869c7;
  background:#2869c7;
  color:#fff;
  font-weight:800;
}

.search-pager button:disabled{ opacity:.42; cursor:default }

.search-results--partial{
  margin-top:14px;
  padding-top:8px;
  border-top:1px solid #e3e9f0;
}

.search-partial__note{
  margin:0 0 4px;
  color:#8894a5;
  font-size:10px;
}

.search-related{
  padding:26px 0 8px;
  border-top:1px solid #e3e9f0;
}

.search-related h2{
  margin:0 0 12px;
  color:#3c536f;
  font-size:12px;
}

.visually-hidden{
  position:absolute;
  width:1px;
  height:1px;
  padding:0;
  margin:-1px;
  overflow:hidden;
  clip:rect(0, 0, 0, 0);
  white-space:nowrap;
  border:0;
}

@media (max-width:600px){
  .search-shell,
  .trace-search--home .search-shell{
    width:min(100% - 24px, 850px);
    padding-top:36px;
  }

  .search-form{
    padding-left:13px;
    border-radius:15px;
  }

  .search-form button{
    padding:9px 12px;
  }

  .search-summary{
    align-items:flex-start;
    flex-direction:column;
    gap:4px;
  }
}
</style>
