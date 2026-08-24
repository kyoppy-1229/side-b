<template>
  <DebugSection id="scenarios" title="シナリオ（一発適用）" icon="⚑" :badge="SCENARIOS.length">
    <p class="dbg-hint">状態をまとめて組み立てて、その場面から確認できます。</p>

    <div class="dbg-btns">
      <button
        type="button"
        class="dbg-btn dbg-btn--sm"
        :class="{ 'is-active': groupFilter === 'all' }"
        @click="groupFilter = 'all'"
      >ALL</button>
      <button
        v-for="group in SCENARIO_GROUPS"
        :key="group.id"
        type="button"
        class="dbg-btn dbg-btn--sm"
        :class="{ 'is-active': groupFilter === group.id }"
        @click="groupFilter = group.id"
      >{{ group.label }}</button>
    </div>

    <div v-for="group in visibleGroups" :key="group.id" class="dbg-stack">
      <p class="dbg-label">{{ group.icon }} {{ group.label }}</p>
      <ul class="dbg-list">
        <li
          v-for="scenario in group.scenarios"
          :key="scenario.id"
          class="dbg-item"
          :class="{ 'is-active': lastApplied === scenario.id }"
        >
          <span class="dbg-item__text">
            <span class="dbg-item__title">{{ scenario.label }}</span>
            <span class="dbg-item__sub">{{ scenario.note }}</span>
          </span>
          <button type="button" class="dbg-btn dbg-btn--sm dbg-btn--primary" @click="apply(scenario)">適用</button>
        </li>
      </ul>
    </div>
  </DebugSection>

</template>

<script setup>
import { computed, ref } from 'vue'
import DebugSection from './DebugSection.vue'
import { useDebugConsole } from './debugContext.js'
import { SCENARIO_GROUPS, SCENARIOS, SCENARIOS_BY_GROUP } from '../../debug/scenarios.js'

const shell = useDebugConsole()
const groupFilter = ref('all')
const lastApplied = ref('')

const visibleGroups = computed(() => (
  groupFilter.value === 'all'
    ? SCENARIOS_BY_GROUP
    : SCENARIOS_BY_GROUP.filter((group) => group.id === groupFilter.value)
))

function apply(scenario){
  scenario.apply(shell.context)
  lastApplied.value = scenario.id
  shell.remountStage()
  shell.notify(`シナリオ適用: ${scenario.label}`)
}
</script>
