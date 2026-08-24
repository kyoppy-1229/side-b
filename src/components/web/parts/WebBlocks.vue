<template>
  <div class="web-prose">
    <template v-for="(block, index) in blocks" :key="index">
      <p v-if="block.type === 'p'">{{ block.text }}</p>

      <component :is="block.level === 3 ? 'h3' : 'h2'" v-else-if="block.type === 'h'">
        {{ block.text }}
      </component>

      <ul v-else-if="block.type === 'ul'">
        <li v-for="(item, itemIndex) in block.items" :key="itemIndex">{{ item }}</li>
      </ul>

      <ol v-else-if="block.type === 'ol'">
        <li v-for="(item, itemIndex) in block.items" :key="itemIndex">{{ item }}</li>
      </ol>

      <blockquote v-else-if="block.type === 'quote'">
        {{ block.text }}
        <cite v-if="block.cite">— {{ block.cite }}</cite>
      </blockquote>

      <div v-else-if="block.type === 'note'" class="web-note">
        <strong v-if="block.label" class="web-note__label">{{ block.label }}</strong>
        {{ block.text }}
      </div>

      <figure v-else-if="block.type === 'img'">
        <WebArt :kind="block.art || 'abstract'" :seed="`${seed}:${index}`" :era="era" :ratio="block.ratio || 'photo'" />
        <figcaption v-if="block.caption">{{ block.caption }}</figcaption>
      </figure>

      <pre v-else-if="block.type === 'code'"><code>{{ block.text }}</code></pre>

      <div v-else-if="block.type === 'table'" class="web-table-scroll">
        <table>
          <thead v-if="block.head?.length">
            <tr><th v-for="(cell, cellIndex) in block.head" :key="cellIndex">{{ cell }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex">
              <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <dl v-else-if="block.type === 'dl'" class="web-defs">
        <div v-for="(item, itemIndex) in block.items" :key="itemIndex">
          <dt>{{ item.label }}</dt>
          <dd>{{ item.value }}</dd>
        </div>
      </dl>

      <ul v-else-if="block.type === 'spec'" class="web-spec">
        <li v-for="(item, itemIndex) in block.items" :key="itemIndex">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </li>
      </ul>

      <nav v-else-if="block.type === 'links'" class="web-inline-links">
        <p v-if="block.label" class="web-inline-links__label">{{ block.label }}</p>
        <ul>
          <li v-for="(item, itemIndex) in block.items" :key="itemIndex">
            <WebLink :to="item.path" :label="item.label" />
          </li>
        </ul>
      </nav>
    </template>
  </div>
</template>

<script setup>
import WebArt from './WebArt.vue'
import WebLink from './WebLink.vue'

defineProps({
  blocks: { type: Array, default: () => [] },
  seed: { type: String, default: 'art' },
  era: { type: String, default: '' }
})
</script>

<style scoped>
.web-defs{
  display:grid;
  gap:0;
  margin:0;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  overflow:hidden;
  font-size:calc(var(--web-body-size) - 1px);
}

.web-defs > div{
  display:grid;
  grid-template-columns:132px minmax(0,1fr);
}

.web-defs > div + div{ border-top:1px solid var(--web-line) }

.web-defs dt{
  padding:9px 12px;
  background:var(--web-accent-soft);
  font-weight:700;
}

.web-defs dd{ margin:0; padding:9px 12px }

.web-spec{
  display:grid;
  gap:7px;
  margin:0;
  padding:0;
  list-style:none;
}

.web-spec li{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:12px;
  padding-bottom:6px;
  border-bottom:1px dotted var(--web-line);
  font-size:calc(var(--web-body-size) - 1px);
}

.web-spec span{ color:var(--web-muted) }

.web-inline-links{
  padding:13px 15px;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  background:var(--web-page);
}

.web-inline-links__label{
  margin:0 0 7px;
  font-size:11px;
  font-weight:800;
}

.web-inline-links ul{
  margin:0;
  padding-left:1.2em;
  font-size:12px;
}

@media (max-width:560px){
  .web-defs > div{ grid-template-columns:minmax(0,1fr) }
  .web-defs dt{ padding-bottom:4px }
}
</style>
