<template>
  <div class="name-dialog" @click.self="emit('close')">
    <form class="name-dialog__card" role="dialog" aria-labelledby="name-dialog-title" @submit.prevent="submit">
      <h2 id="name-dialog-title" class="name-dialog__title">表示名を変更</h2>

      <label class="name-dialog__field">
        <span class="visually-hidden">表示名</span>
        <input
          ref="inputElement"
          v-model="draft"
          type="text"
          :maxlength="PLAYER_NAME_MAX_LENGTH"
          autocomplete="off"
          spellcheck="false"
          enterkeyhint="done"
          @keydown.esc.prevent="emit('close')"
        />
      </label>

      <p class="name-dialog__counter" :class="{ 'is-full': length >= PLAYER_NAME_MAX_LENGTH }">
        {{ length }} / {{ PLAYER_NAME_MAX_LENGTH }}
      </p>

      <!-- Plain information, not a warning: the name can be changed again from
           the home screen whenever the player feels like it. -->
      <p class="name-dialog__note">変更した名前は、以降の会話や一部のゲーム内表示に使用されます。あとから変更もできます。</p>

      <div class="name-dialog__actions">
        <button type="button" class="name-dialog__button" @click="emit('close')">キャンセル</button>
        <button type="submit" class="name-dialog__button name-dialog__button--primary" :disabled="!canSave">変更する</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { PLAYER_NAME_MAX_LENGTH, playerNameLength, sanitizePlayerName } from '../../story/player.js'

const props = defineProps({
  name: { type: String, default: '' }
})

const emit = defineEmits(['close', 'submit'])

const draft = ref(props.name)
const inputElement = ref(null)

// The name that would actually be saved: trimmed, whitespace flattened, capped.
// Everything the dialog shows is derived from it, so what the player reads is
// what the store will keep.
const sanitized = computed(() => sanitizePlayerName(draft.value))
const length = computed(() => playerNameLength(draft.value))
const canSave = computed(() => sanitized.value.length > 0)

function submit(){
  if(!canSave.value) return
  emit('submit', sanitized.value)
}

onMounted(() => nextTick(() => {
  inputElement.value?.focus()
  inputElement.value?.select()
}))
</script>

<style scoped>
.name-dialog{
  position:absolute;
  inset:0;
  z-index:5;
  display:grid;
  place-items:center;
  padding:20px;
  background:rgba(20, 33, 54, 0.34);
  animation:dialog-fade 180ms ease both;
}

@keyframes dialog-fade{
  from{ opacity:0; }
  to{ opacity:1; }
}

.name-dialog__card{
  width:min(330px, 100%);
  display:flex;
  flex-direction:column;
  padding:22px 22px 18px;
  border:1px solid #dce4ef;
  border-radius:18px;
  background:#fff;
  box-shadow:0 22px 48px rgba(24, 42, 70, 0.22);
  animation:dialog-rise 200ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

@keyframes dialog-rise{
  from{ opacity:0; transform:translateY(8px); }
  to{ opacity:1; transform:none; }
}

.name-dialog__title{
  margin:0 0 14px;
  color:#1d2c42;
  font-size:14px;
  font-weight:700;
}

.name-dialog__field input{
  width:100%;
  padding:11px 13px;
  border:1px solid #cfdaea;
  border-radius:12px;
  background:#f8fafd;
  color:#1f2e44;
  font:inherit;
  font-size:14px;
  transition:border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.name-dialog__field input:focus{
  outline:0;
  border-color:#6d9cdd;
  background:#fff;
  box-shadow:0 0 0 3px rgba(43, 107, 198, 0.14);
}

.name-dialog__counter{
  margin:6px 2px 0;
  color:#8c9aad;
  font-size:9px;
  text-align:right;
  font-variant-numeric:tabular-nums;
}

.name-dialog__counter.is-full{
  color:#b07a3a;
}

.name-dialog__note{
  margin:10px 0 0;
  color:#78879b;
  font-size:10px;
  line-height:1.7;
}

.name-dialog__actions{
  display:flex;
  justify-content:flex-end;
  gap:8px;
  margin-top:18px;
}

.name-dialog__button{
  padding:9px 15px;
  border:1px solid #d6dfec;
  border-radius:11px;
  background:#fff;
  color:#40536e;
  font:inherit;
  font-size:11px;
  font-weight:700;
  cursor:pointer;
  transition:background 180ms ease, border-color 180ms ease, filter 180ms ease;
}

.name-dialog__button:hover{
  background:#f2f6fb;
}

.name-dialog__button--primary{
  border-color:transparent;
  background:#2869c7;
  color:#fff;
  box-shadow:0 8px 18px rgba(40, 105, 199, 0.26);
}

.name-dialog__button--primary:hover{
  background:#3277d8;
}

.name-dialog__button:disabled{
  cursor:not-allowed;
  opacity:0.45;
  box-shadow:none;
}

.name-dialog__button:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.28);
  outline-offset:2px;
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
</style>
