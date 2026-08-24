<template>
  <a
    :class="classes"
    :href="href"
    :aria-current="current ? 'page' : undefined"
    @click="onClick"
    @auxclick="onAuxClick"
  >
    <slot>{{ label }}</slot>
  </a>
</template>

<script setup>
import { computed } from 'vue'
import { useWebSite } from '../webSiteContext.js'

const props = defineProps({
  to: { type: String, required: true },
  label: { type: String, default: '' },
  variant: { type: String, default: 'link' },
  current: { type: Boolean, default: false }
})

const site = useWebSite()
const href = computed(() => site.toUrl(props.to))
const classes = computed(() => {
  if(props.variant === 'nav') return 'web-nav__link'
  if(props.variant === 'plain') return 'web-link web-link--plain'
  if(props.variant === 'button') return 'web-button'
  if(props.variant === 'bare') return 'web-bare-link'
  return 'web-link'
})

// A modifier-click behaves like the real thing: it opens another browser tab
// instead of navigating the current one.
function onClick(event){
  event.preventDefault()
  if(event.metaKey || event.ctrlKey || event.shiftKey){
    site.openInNewTab(href.value)
    return
  }
  site.navigate(href.value)
}

function onAuxClick(event){
  if(event.button !== 1) return
  event.preventDefault()
  site.openInNewTab(href.value)
}
</script>

<style scoped>
.web-bare-link{
  color:inherit;
  text-decoration:none;
  cursor:pointer;
}

.web-bare-link:hover{
  text-decoration:underline;
  text-underline-offset:2px;
}

.web-link--plain{
  color:inherit;
  text-decoration:none;
}
</style>
