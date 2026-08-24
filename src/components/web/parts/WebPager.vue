<template>
  <nav v-if="pageCount > 1" class="web-pager" aria-label="ページ送り">
    <button type="button" :disabled="modelValue <= 1" @click="go(modelValue - 1)">前へ</button>
    <button
      v-for="page in pages"
      :key="page"
      type="button"
      :aria-current="page === modelValue"
      @click="go(page)"
    >{{ page }}</button>
    <button type="button" :disabled="modelValue >= pageCount" @click="go(modelValue + 1)">次へ</button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: { type: Number, default: 0 },
  perPage: { type: Number, default: 10 },
  modelValue: { type: Number, default: 1 }
})

const emit = defineEmits(['update:modelValue'])
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))
const pages = computed(() => Array.from({ length: pageCount.value }, (unused, index) => index + 1))

function go(page){
  const next = Math.min(Math.max(page, 1), pageCount.value)
  if(next !== props.modelValue) emit('update:modelValue', next)
}
</script>
