<template>
  <main class="case-page">
    <section v-if="!unlocked" class="case-locked">
      <span class="case-locked__icon">▣</span>
      <h1>この記録にはアクセスできません</h1>
      <p>現在のセッションには閲覧権限がありません。</p>
      <small>ASANAGI SCHOOL / ARCHIVE SERVER</small>
    </section>

    <template v-else>
      <header class="case-header">
        <div>
          <span class="case-kicker">ARCHIVE / CASE 2015-03-01</span>
          <h1>あの日の10人 <small>証言・記録照合</small></h1>
          <p>卒業当日の19:44:12。誰が校内端末を使用できたのか、証言と保存資料を突き合わせる。</p>
        </div>
        <div class="case-stats" aria-label="調査の進捗">
          <span>聞き込み <strong>{{ outcome.interviews }}/9</strong></span>
          <span>アリバイ確認 <strong>{{ outcome.verified }}/8</strong></span>
          <span>重要ログ <strong>{{ outcome.logFiles }}/3</strong></span>
        </div>
      </header>

      <nav class="case-tabs" aria-label="調査ツール">
        <button :class="{ selected: view === 'interviews' }" @click="view = 'interviews'">聞き込み・人物一覧</button>
        <button :class="{ selected: view === 'terminal' }" @click="view = 'terminal'">校内PC・保存ログ</button>
        <button :class="{ selected: view === 'deduction' }" @click="view = 'deduction'">推理ノート</button>
      </nav>

      <div v-if="view === 'interviews'" class="case-interviews">
        <aside class="case-roster" aria-label="卒業生の一覧">
          <div class="case-roster__label">同級生 9人（主人公を除く）</div>
          <div class="case-roster__list"><button
            v-for="person in SUSPECTS"
            :key="person.id"
            class="case-person"
            :class="{ selected: selectedId === person.id, cleared: cleared.includes(person.id) }"
            @click="selectedId = person.id"
          >
            <img v-if="portraitFor(person.name)" :src="portraitFor(person.name)" :alt="person.name" />
            <span v-else class="case-person__initial">{{ person.name.charAt(0) }}</span>
            <span class="case-person__main"><strong>{{ person.name }}</strong><small>{{ person.place }}</small></span>
            <b>{{ cleared.includes(person.id) ? '除外' : interviewed.includes(person.id) ? '聴取済' : '未聴取' }}</b>
          </button></div>
        </aside>

        <section class="case-interview-card">
          <div class="case-interview-card__eyebrow">INTERVIEW RECORD / {{ String(SUSPECTS.findIndex(p => p.id === selectedId) + 1).padStart(2, '0') }}</div>
          <div class="case-interview-card__profile">
            <img v-if="portraitFor(selected.name)" :src="portraitFor(selected.name)" :alt="selected.name" />
            <div><h2>{{ selected.name }}</h2><p>申告場所：{{ selected.place }}</p></div>
          </div>
          <div v-if="!asked.includes(selected.id)" class="case-empty">
            <p>まだ本人の証言を聞いていない。</p>
            <button class="case-primary" @click="askFirst">2015年3月1日の居場所を尋ねる</button>
          </div>
          <template v-else>
            <div class="case-dialogue"><span>あなた</span><p>2015年3月1日の19時44分ごろ、どこにいた？</p></div>
            <div class="case-dialogue case-dialogue--reply"><span>{{ selected.name }}</span><p>{{ selected.testimony }}</p></div>
            <button v-if="!interviewed.includes(selected.id)" class="case-secondary" @click="askFollowup">裏付けになる記録がないか聞く</button>
            <div v-else class="case-dialogue case-dialogue--reply"><span>{{ selected.name }}</span><p>{{ selected.followup }}</p></div>
            <div v-if="selected.file && interviewed.includes(selected.id)" class="case-verification">
              <strong>{{ cleared.includes(selected.id) ? 'アリバイ確認済み' : '証言の裏付けが必要' }}</strong>
              <p v-if="cleared.includes(selected.id)">{{ selected.clue }}</p>
              <p v-else>保存資料と照合してから、除外できるか判断しよう。</p>
              <button
                v-if="!cleared.includes(selected.id)"
                :disabled="!inspectedFiles.includes(selected.file)"
                class="case-primary"
                @click="verify(selected)"
              >アリバイを照合して候補から除外</button>
              <small v-if="!cleared.includes(selected.id) && !inspectedFiles.includes(selected.file)">まだ対応する資料を読んでいません。校内PCの保存ファイルを調査してください。</small>
            </div>
            <div v-else-if="interviewed.includes(selected.id)" class="case-verification">
              <strong>証言の検証が必要</strong>
              <p>本人の説明だけでは、校内端末の利用記録との矛盾を解消できない。</p>
            </div>
          </template>
        </section>
      </div>

      <section v-else-if="view === 'terminal'" class="case-terminal-section">
        <div class="case-terminal-intro">
          <h2>校内PC / 2015年度バックアップ</h2>
          <p>旧式のコマンドプロンプトを模した読み取り専用端末。実際のOSやネットワークにはアクセスせず、ゲーム内の保存資料のみ閲覧できます。</p>
          <div class="case-quick-commands">
            <button v-for="command in ['HELP', 'DIR', 'TIMELINE']" :key="command" @click="execute(command)">{{ command }}</button>
          </div>
        </div>
        <div class="case-console" role="region" aria-label="校内PCターミナル">
          <div ref="terminalLog" class="case-console__output" role="log" aria-label="実行結果">
            <pre v-for="(line, index) in terminalOutput" :key="index">{{ line }}</pre>
          </div>
          <form class="case-command" @submit.prevent="execute(commandInput)">
            <label for="case-command-input">C:\ARCHIVE\20150301&gt;</label>
            <input id="case-command-input" v-model="commandInput" autocomplete="off" spellcheck="false" autocapitalize="off" enterkeyhint="go" placeholder="HELP" />
            <button type="submit">実行</button>
          </form>
        </div>
        <p class="case-terminal-note">閲覧したファイルは推理ノートに記録されます。保存ログを読み比べるには <code>FC ACCESS.LOG SESSION.LOG</code> を試してください。</p>
      </section>

      <section v-else class="case-deduction">
        <div class="case-deduction__summary">
          <h2>推理ノート</h2>
          <p>誰か一人を疑うだけでは不十分。ほかの8人のアリバイを確認し、ログの矛盾を説明する。</p>
          <div class="case-progress"><span :style="{ width: `${Math.round(outcome.verified / 8 * 100)}%` }"></span></div>
          <p>{{ outcome.remaining.length }}人が候補として残っている。</p>
        </div>
        <ul class="case-evidence-list">
          <li v-for="person in SUSPECTS" :key="person.id"><span>{{ person.name }}</span><strong :class="{ complete: cleared.includes(person.id) }">{{ cleared.includes(person.id) ? 'アリバイ成立・除外' : interviewed.includes(person.id) ? '証言取得・未確定' : '未調査' }}</strong></li>
        </ul>
        <div class="case-final">
          <h3>最終照合</h3>
          <p>校内のアクセス記録・セッション記録・転送記録の3つを読み、ほかの8人を除外した後で結論を出せる。</p>
          <button class="case-primary" :disabled="!outcome.ready || resolved" @click="resolveCase">最後の一人を特定する</button>
          <div v-if="resolved" class="case-resolution" role="status">
            <strong>調査記録が確定した。</strong>
            <p>残された人物は{{ outcome.remaining[0]?.name }}。ただし、ログイン名が本人の操作を証明するとは限らない。次は直接本人に真相を問いかける必要がある。</p>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { useStoryStore } from '../../store/story.js'
import { STORY_CHAPTERS } from '../../story/chapters.js'
import { isTrialMode } from '../../trial/mode.js'
import { readJson, writeJson } from '../../store/storage.js'
import { SUSPECTS, FINAL_FILES, evaluateCase } from '../../investigation/data.js'
import { runArchiveCommand, terminalIntro } from '../../investigation/terminal.js'

const STORAGE_KEY = 'side-b:final-investigation:v1'
const portraits = import.meta.glob('../../photo/solo/*.png', { eager: true, query: '?url', import: 'default' })
const story = useStoryStore()
const unlocked = computed(() => !isTrialMode() && story.hasReached(STORY_CHAPTERS.CH8_TEN_PEOPLE))
let saved = {}
try { saved = readJson(STORAGE_KEY) || {} } catch { saved = {} }

const view = ref('interviews')
const selectedId = ref(SUSPECTS[0].id)
const asked = ref(Array.isArray(saved.asked) ? saved.asked : [])
const interviewed = ref(Array.isArray(saved.interviewed) ? saved.interviewed : [])
const inspectedFiles = ref(Array.isArray(saved.inspectedFiles) ? saved.inspectedFiles : [])
const cleared = ref(Array.isArray(saved.cleared) ? saved.cleared : [])
const resolved = ref(Boolean(saved.resolved))
const commandInput = ref('')
const terminalOutput = ref([terminalIntro()])
const terminalLog = ref(null)

const selected = computed(() => SUSPECTS.find((person) => person.id === selectedId.value) || SUSPECTS[0])
const outcome = computed(() => evaluateCase(interviewed.value, inspectedFiles.value, cleared.value))

function portraitFor(name){
  return portraits[`../../photo/solo/${name}.png`] || ''
}

function persist(){
  writeJson(STORAGE_KEY, {
    asked: asked.value,
    interviewed: interviewed.value,
    inspectedFiles: inspectedFiles.value,
    cleared: cleared.value,
    resolved: resolved.value
  })
}

function addUnique(listRef, value){
  if(listRef.value.includes(value)) return
  listRef.value = [...listRef.value, value]
  persist()
}

function askFirst(){ addUnique(asked, selected.value.id) }
function askFollowup(){ addUnique(interviewed, selected.value.id) }

function verify(person){
  if(!person.file || !interviewed.value.includes(person.id) || !inspectedFiles.value.includes(person.file)) return
  addUnique(cleared, person.id)
}

function execute(input){
  const command = String(input || '').trim()
  commandInput.value = ''
  if(!command) return
  const result = runArchiveCommand(command)
  terminalOutput.value = result.clear
    ? [result.output]
    : [...terminalOutput.value.slice(-24), `C:\\ARCHIVE\\20150301> ${command}`, result.output]
  if(result.file) addUnique(inspectedFiles, result.file)
  for(const file of result.files || []) addUnique(inspectedFiles, file)
  nextTick(() => {
    if(terminalLog.value) terminalLog.value.scrollTop = terminalLog.value.scrollHeight
  })
}

function resolveCase(){
  if(!outcome.value.ready || outcome.value.remaining.length !== 1) return
  resolved.value = true
  story.markMilestone('final_investigation_completed')
  persist()
}
</script>

<style scoped>
.case-page{min-height:100%;padding:26px clamp(14px,3vw,42px);background:#eceae4;color:#202b31;font-family:'Noto Sans JP',system-ui,sans-serif}
.case-locked{max-width:520px;margin:9vh auto;padding:45px 30px;text-align:center;border:1px solid #c9cbc8;background:#fff;box-shadow:0 14px 40px #1b283215}
.case-locked__icon{font-size:38px;color:#546370}.case-locked h1{font-size:20px}.case-locked small{color:#71808a;letter-spacing:.1em}
.case-header{display:flex;align-items:flex-end;justify-content:space-between;gap:25px;margin-bottom:18px;border-bottom:2px solid #263844;padding-bottom:18px}
.case-kicker,.case-interview-card__eyebrow{font-size:11px;letter-spacing:.14em;color:#4d6c79;font-weight:700}
.case-header h1{font-size:28px;margin:6px 0}.case-header h1 small{font-size:14px;color:#53646d;font-weight:400}
.case-header p{max-width:680px;font-size:13px;color:#52626a;margin:5px 0}
.case-stats{display:flex;gap:12px;flex-wrap:wrap}.case-stats span{display:grid;gap:4px;padding:10px 14px;white-space:nowrap;background:#fff;border:1px solid #cbd3d6;font-size:11px;color:#52646c}.case-stats strong{font-size:20px;color:#1b3847}
.case-tabs{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}.case-tabs button{border:1px solid #bbc9cf;background:#fafafa;color:#405763;border-radius:5px;padding:10px 15px;font-weight:700;cursor:pointer}.case-tabs button.selected{background:#234456;color:white;border-color:#234456}
.case-interviews{display:grid;grid-template-columns:minmax(245px,315px) minmax(0,1fr);gap:17px}.case-roster,.case-interview-card,.case-terminal-intro,.case-deduction__summary,.case-evidence-list,.case-final{background:#fff;border:1px solid #cbd3d6;border-radius:6px;box-shadow:0 3px 12px #192c3410}
.case-roster{padding:9px;max-height:640px;overflow-y:auto}.case-roster__label{padding:9px 8px 12px;color:#60717b;font-size:11px;font-weight:700}.case-roster__list{display:grid;gap:2px}.case-person{width:100%;display:flex;align-items:center;gap:10px;text-align:left;padding:9px;border:1px solid transparent;background:white;cursor:pointer;border-radius:4px}.case-person:hover{background:#edf3f5}.case-person.selected{background:#e7f0f3;border-color:#97b5c1}.case-person img,.case-person__initial{width:45px;height:45px;object-fit:cover;border-radius:5px;background:#e0e5e7}.case-person__initial{display:grid;place-items:center}.case-person__main{display:grid;gap:2px;flex:1}.case-person strong{font-size:13px}.case-person small{color:#677984;font-size:11px}.case-person b{font-size:10px;color:#8d681d}.case-person.cleared b{color:#347c64}
.case-interview-card{padding:clamp(18px,3vw,32px);min-height:450px}.case-interview-card__profile{display:flex;align-items:center;gap:18px;border-bottom:1px solid #e1e7e9;padding:15px 0 22px;margin-bottom:18px}.case-interview-card__profile img{height:92px;width:92px;object-fit:cover;border-radius:8px}.case-interview-card__profile h2{font-size:23px;margin:0 0 5px}.case-interview-card__profile p{color:#62717a;margin:0;font-size:12px}.case-empty{padding:25px 5px;color:#586a73}.case-dialogue{background:#f1f4f5;border:1px solid #d9e2e5;padding:12px 15px;border-radius:6px;margin:12px 0;max-width:80%;font-size:14px}.case-dialogue--reply{margin-left:auto;background:#e9f2ee;border-color:#cfe2d9}.case-dialogue span{font-size:10px;font-weight:700;color:#627581}.case-dialogue p{margin:5px 0;line-height:1.75}
.case-primary,.case-secondary{border:0;background:#244a5c;color:#fff;border-radius:5px;padding:10px 16px;cursor:pointer;font-weight:700;font-size:12px}.case-secondary{background:#ecf0f2;color:#2d4a59;border:1px solid #bdcbd1}.case-primary:disabled{cursor:not-allowed;opacity:.45}.case-verification{background:#f4f7f4;border-left:3px solid #659984;padding:13px 15px;margin-top:23px;display:grid;gap:7px}.case-verification strong{font-size:13px}.case-verification p,.case-verification small{font-size:12px;color:#50646a;margin:0}.case-verification button{justify-self:start}
.case-terminal-intro{padding:20px 22px;margin-bottom:12px}.case-terminal-intro h2{margin:0 0 7px;font-size:19px}.case-terminal-intro p{font-size:12px;color:#52666f;line-height:1.7}.case-quick-commands{display:flex;gap:8px}.case-quick-commands button{border:1px solid #b9c5cb;border-radius:4px;background:#edf3f5;padding:6px 12px;font-family:monospace;cursor:pointer}
.case-console{height:460px;display:flex;flex-direction:column;min-height:0;background:#091720;color:#b4e6ca;border:1px solid #1c3440;padding:16px 20px;box-shadow:inset 0 0 50px #0009;font:13px/1.7 'Consolas','Courier New',monospace}.case-console__output{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}.case-console pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere;margin:0 0 14px}.case-command{display:flex;flex-wrap:wrap;align-items:center;gap:9px;flex-shrink:0;padding-top:10px;border-top:1px solid #ffffff22}.case-command label{white-space:nowrap;color:#7bc5a2}.case-command input{flex:1;min-width:140px;background:transparent;color:#e5ffee;border:0;outline:none;font:inherit}.case-command button{background:#244f44;color:white;border:1px solid #417560;border-radius:3px;padding:8px 12px;cursor:pointer}.case-terminal-note{font-size:12px;color:#576b74}.case-terminal-note code{background:#dce3e5;padding:2px 5px}
.case-deduction{display:grid;grid-template-columns:minmax(260px,1fr) minmax(280px,1fr);gap:15px}.case-deduction__summary,.case-final{padding:22px}.case-deduction h2,.case-final h3{margin-top:0}.case-deduction p{font-size:13px;line-height:1.8;color:#556771}.case-progress{background:#e1e9e9;border-radius:9px;height:9px;overflow:hidden}.case-progress span{display:block;background:#3b8e74;height:100%;transition:width .2s}.case-evidence-list{list-style:none;margin:0;padding:12px 20px;grid-row:span 2}.case-evidence-list li{display:flex;justify-content:space-between;gap:9px;border-bottom:1px solid #e2e8e9;padding:11px 2px;font-size:12px}.case-evidence-list li:last-child{border-bottom:0}.case-evidence-list strong{color:#9a6b23;font-size:11px}.case-evidence-list strong.complete{color:#27816b}.case-resolution{padding:12px 16px;background:#e6f0eb;border:1px solid #b4d4c3;margin-top:15px}.case-resolution strong{color:#2b6750}
@media(max-width:760px){
  .case-page{padding:16px 12px 24px}
  .case-header{align-items:stretch;flex-direction:column;gap:12px}
  .case-header h1{font-size:24px}
  .case-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
  .case-stats span{min-width:0;padding:8px 6px;font-size:10px;white-space:normal}
  .case-stats strong{font-size:18px}
  .case-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
  .case-tabs button{min-width:0;min-height:44px;padding:7px 4px;font-size:11px;line-height:1.4}
  .case-interviews,.case-deduction{grid-template-columns:minmax(0,1fr)}
  .case-roster{display:block;max-height:none;overflow:hidden;padding:8px}
  .case-roster__label{padding:5px 6px 9px}
  .case-roster__list{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(150px,65%);grid-template-columns:none;gap:7px;overflow-x:auto;scroll-snap-type:x proximity;overscroll-behavior-x:contain;padding-bottom:7px}
  .case-person{gap:7px;min-height:66px;scroll-snap-align:start;border-color:#dce3e7}
  .case-person img,.case-person__initial{flex-shrink:0;height:42px;width:42px}
  .case-person__main{min-width:0}
  .case-person small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .case-person b{display:none}
  .case-interview-card{min-height:0}
  .case-evidence-list{grid-row:auto}
  .case-dialogue{max-width:95%}
  .case-quick-commands{flex-wrap:wrap}
  .case-quick-commands button{min-height:44px}
  .case-console{height:min(52dvh,390px);min-height:230px;padding:10px 12px}
  .case-command{display:grid;grid-template-columns:minmax(0,1fr) 64px;gap:5px}
  .case-command label{grid-column:1/-1;font-size:11px}
  .case-command input{min-width:0;width:100%;font-size:16px}
  .case-command button{min-height:44px}
  .case-primary,.case-secondary{min-height:44px}
}
@media(max-width:420px){.case-interview-card__profile img{height:68px;width:68px}}
</style>
