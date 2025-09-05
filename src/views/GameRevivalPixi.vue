<template>
  <div class="wrap">
    <div class="stageWrap">
      <canvas ref="cv" class="stage" :width="W" :height="H"/>
    </div>
    <div class="hint">
      ← →：移動 ／ E：調べる（カードはEで開閉・保持／再調査可）
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../store'

const router = useRouter()
const store = useGameStore()

// ========= 解像度設計 =========
const LO_W = 450, LO_H = 300
const INT_SCALE = 1
const W = LO_W * INT_SCALE
const H = LO_H * INT_SCALE
const CSS_SCALE = 2

// ========= 入力 =========
const keys = new Set()
const kd = (e)=> keys.add(e.key.toLowerCase())
const ku = (e)=> keys.delete(e.key.toLowerCase())
const prev = { e:false }
const justPressed = (k)=> keys.has(k) && !prev[k]

// ========= 状態 =========
const GROUND_Y = 250
const SPEED = 1.25
const cv = ref(null)
let ctx, lo, loctx, raf
let FX = {}
let lastTs = 0, dt = 1

const state = {
  mode: 'title',            // 'title' | 'play' | 'clear'
  level: 1,
  doorLocked: true,
  inspecting: false,
  cleared: false,
  vx: 0,
  // 男子高校生（ブレザー強調・透け対策）
  player: { x: 22, y: GROUND_Y, w: 16, h: 24, t:0 },
  evidenceFound: 0,
  evidenceNeed: { 1:2, 2:2, 3:2 },
  evidenceBook: {},
  message: null,
}

// ========= ステージ別パレット =========
const BG = {
  1: { sky:['#3b1d2b','#63303d','#a95b3f','#f3a15a'], ground:'#4c3b2e', soil:'#3b2a20', grass:'#6a513c', water:'#2b3d63', rail:'#d5b38a', concrete:'#6b5a49', tape:'#e6e0b8' },
  2: { sky:['#0b1220','#132036','#1e3054','#263a6b'], ground:'#1d2235', soil:'#131a2b', grass:'#2a3459', metal:'#6b7a93', wood:'#3b2c1f', lamp:'#ffe59a', sign:'#0e1728', cork:'#6b4f2a', paper:'#e9eef7' },
  3: { sky:['#06101b','#0c1a2a','#11263f','#173452'], ground:'#0f1726', soil:'#0a1220', grass:'#1c2e4a', puddle:'#0d2036', window:'#7fb0ff', cloud:'#0c1a2a' },
}
const P = {
  sign:'#0b0f18', signTxt:'#cfe5ff', blue:'#6fa5ff',
  bench:'#20304f', bag:'#2a3553', white:'#ffffff', black:'#000000',
  hair:'#202226', skin:'#ffe1c9', blazer:'#0d1524', blazerDark:'#0a111d', shirt:'#f2f6ff', tie:'#2b69ff', pants:'#152036', emblem:'#c0d4ff', button:'#ffd36a',
  door:'#2d3b63', doorGlow:'#6fa5ff', outline:'#0b1524', gold:'#ffdc62', red:'#ff8b8b'
}

// ========= インタラクト対象 =========
let inspectables = []
function buildStage(){
  state.evidenceFound = 0
  state.doorLocked = true
  state.inspecting = false
  state.cleared = false
  state.message = null
  state.player.x = 22; state.vx = 0

  FX = {
    time:0, wind:0,
    lamps:[],
    rainNear:[], rainMid:[], rainFar:[], splashes:[],
    rainTargets:{ far:90, mid:120, near:140 },
    rainSpawnT:0,
    lightning:{on:false,t:0,path:[],count:0,pulses:0,pulseT:0},
    rooftopMan:{x:210, y:GROUND_Y-102, visible:false, permaGone:false},
    monitor:{x:270+3, y:GROUND_Y-24+3, w:24, h:12},
    clouds:[],
    stars:[],
    brokenSparks:[],
    riverPhase1:0, riverPhase2:0, riverPhase3:0,
    riverFoam:[]
  }

  if(state.level===1){
    // ふわっとした雲（影なし・サブピクセル走査＋縦の微揺れ）
    for(let i=0;i<8;i++) FX.clouds.push({ x: Math.random()*LO_W, y: 18+Math.random()*56, w: 28+Math.random()*40, h: 10+Math.random()*10, v: 0.04+Math.random()*0.05, seed: Math.random()*1000 })
    // 川：泡粒
    for(let i=0;i<28;i++) FX.riverFoam.push({ x: Math.random()*LO_W, life: 60+Math.random()*80, vx: 0.25+Math.random()*0.45 })
  }

  if(state.level===2){
    // 星（ランダム点滅・移動しない）
    for(let i=0;i<90;i++) FX.stars.push({ x: Math.random()*LO_W|0, y: (10+Math.random()*120)|0, p: Math.random()*6, s: 0.5+Math.random()*1.2 })
    FX.lamps = [ {x:70, y:GROUND_Y-48, p:Math.random()*6}, {x:160,y:GROUND_Y-48,p:Math.random()*6}, {x:260,y:GROUND_Y-48,p:Math.random()*6} ]
  }

  if(state.level===3){
    // 雨は段階的に湧かせる（自然な立ち上がり）
    FX.rainFar.length = FX.rainMid.length = FX.rainNear.length = 0
  }

  if(state.level===1){
    inspectables = [
      { id:'sign',  label:'張り紙', r:{x: 50,  y: GROUND_Y-28, w: 64, h: 16}, lines:['津波注意','最終下校17:00'] },
      { id:'bag',   label:'古いカバン', r:{x: 178, y: GROUND_Y-14, w: 20,  h: 14}, lines:['水色のキーホルダー','タグにTS5Iと刻印されている'] },
    ]
  }else if(state.level===2){
    inspectables = [
      { id:'board', label:'電光掲示', r:{x: 36,  y: GROUND_Y-18, w: 56, h: 18}, lines:['何か文字が出ている'] },
      { id:'news',  label:'掲示板の紙', r:{x: 250, y: GROUND_Y-40, w: 88, h: 44}, lines:['新聞の切り抜き','市内の男子高校生が自宅で変死体として発見。','死亡推定時刻は昨夜20:20ごろ——'] },
    ]
  }else{
    inspectables = [
      { id:'broken',label:'壊れた掲示', r:{x: 62,  y: GROUND_Y-26, w: 96, h: 20}, lines:['この掲示板は壊れているようだ'] },
      { id:'pc',    label:'古いPC',   r:{x: 270, y: GROUND_Y-24, w: 64,  h: 26}, lines:['ただの古いPCだ'] },
    ]
  }
}

// ========= ピクセル描画ユーティリティ =========
function px(x,y,w=1,h=1,color=P.white){ loctx.fillStyle=color; loctx.fillRect(x|0,y|0,w|0,h|0) }
function box(x,y,w,h, color, border=P.outline){
  px(x+1,y+1,w-2,h-2,color)
  loctx.fillStyle=border
  loctx.fillRect(x,y,w,1); loctx.fillRect(x,y+h-1,w,1)
  loctx.fillRect(x,y,1,h); loctx.fillRect(x+w-1,y,1,h)
}
function line(x1,y1,x2,y2,color='#ffffff', lw=1){ loctx.strokeStyle=color; loctx.lineWidth=lw; loctx.beginPath(); loctx.moveTo(x1+0.5,y1+0.5); loctx.lineTo(x2+0.5,y2+0.5); loctx.stroke() }
function setFont(pxSize){ loctx.font = `${pxSize}px monospace`; loctx.textBaseline='top' }
function textTiny(s,x,y,color=P.signTxt){ loctx.fillStyle=color; setFont(10); loctx.fillText(s,x,y) }
function textMid(s,x,y,color=P.signTxt){ loctx.fillStyle=color; setFont(14); loctx.fillText(s,x,y) }
function textCenter(s,y,size=18,color=P.signTxt){ setFont(size); loctx.fillStyle=color; const w=loctx.measureText(s).width; loctx.fillText(s,(LO_W-w)/2,y) }
function scribble(x,y,w,h,c1='#cfd6e6',c2='#96a7c9',density=3){ for(let i=0;i<h-4;i+=density){ px(x+4,y+3+i,w-8,1, i%6?c1:c2) } }
function pixelate(canvas){ canvas.style.width=`${W*CSS_SCALE}px`; canvas.style.height=`${H*CSS_SCALE}px`; canvas.style.imageRendering='pixelated'; canvas.style.border='1px solid #27305c'; canvas.style.borderRadius='12px' }

// ========= タイトル／クリア画面 =========
function drawTitleScreen(){
  // 背景グラデ＋スキャンライン
  for(let i=0;i<LO_H;i++) px(0,i,LO_W,1, i<150?`rgba(20,28,46,1)`:`rgba(12,18,30,1)`)
  for(let y=0;y<LO_H;y+=3) if(((y+Date.now()*0.06)|0)%6<3) px(0,y,LO_W,1,'#0f203322')
  // タイトルロゴ風
  textCenter('SIDE-B［復刻版］', 78, 24, '#cfe5ff')
  textCenter('— The Second Hand of the Bell —', 104, 10, '#9bb7ff')
  // シルエット（プレイヤ＆扉）
  box(160, 170, 20, 28, '#0b0f18', '#1a2236') // door
  px(169,178,2,6,'#8faeff')
  // player silhouette
  px(120,184,18,22,'#0b0f18'); px(126,180,6,4,'#0b0f18')
  // 操作ヒント
  textCenter('← →：移動　／　E：調べる', 210, 12, '#98b3ff')
  // プレススタート
  const a = 0.4 + 0.6*(0.5+0.5*Math.sin(Date.now()*0.006))
  setFont(16); loctx.fillStyle=`rgba(200,230,255,${a})`
  const s = 'E：はじめる'
  const w = loctx.measureText(s).width
  loctx.fillText(s,(LO_W-w)/2, 238)
}

function drawGameClearScreen(){
  // 暗転背景
  loctx.fillStyle='rgba(0,0,0,0.6)'; loctx.fillRect(0,0,LO_W,LO_H)
  const cw = 340, ch = 150
  const cx = Math.floor((LO_W-cw)/2), cy = Math.floor((LO_H-ch)/2)
  box(cx,cy,cw,ch,'#0f1626','#1b2944')
  textCenter('GAME CLEAR', cy+20, 20, '#cfe5ff')
  // 成果サマリ
  const needTotal = Object.values(state.evidenceNeed).reduce((a,b)=>a+b,0)
  const foundTotal = Object.keys(state.evidenceBook).length
  textCenter(`EVIDENCE: ${foundTotal} / ${needTotal}`, cy+54, 12, '#9bb7ff')
  textCenter('E：タイトルへ', cy+86, 12, '#9bb7ff')
}

// ========= 背景 =========
let t=0
function drawSky(){
  const pal = BG[state.level]
  const bands = pal.sky
  const bandH = Math.ceil((LO_H-36)/bands.length)
  for(let i=0;i<bands.length;i++) px(0,i*bandH,LO_W,bandH,bands[i])

  if(state.level===1){
    // 太陽反射（夕焼け）
    const sunX=340, sunY=120
    for(let r=18;r>0;r--) px(sunX-r,sunY-r, r*2, r*2, `rgba(255,200,120,${0.05+0.02*r})`)
    // 雲（サブピクセル位相＋縦の微揺れ、dt対応で滑らか）
    FX.clouds.forEach(c=>{
      const wob = Math.sin((t*0.002)+c.seed)*1.2
      const cx = c.x; const cy = c.y + wob
      px(cx, cy, c.w, c.h, '#f3f7ff')
      px(cx+2, cy+2, c.w-4, c.h-3, '#e9f2ff')
      px(cx+6, cy+3, c.w-12, 2, '#dbe9ff')
      c.x += c.v * dt; if(c.x>LO_W+50) c.x=-50
    })
  }
  if(state.level===2){
    // 星（ランダム点滅）
    FX.stars.forEach(s=>{
      const a = 0.2 + 0.8 * (0.5+0.5*Math.sin(t*0.005*s.s + s.p))
      px(s.x, s.y, 1,1, `rgba(220,240,255,${a})`)
      if(Math.random()<0.002) px(s.x+1, s.y, 1,1, `rgba(200,220,255,${a*0.6})`)
    })
  }
  if(state.level===3){
    // 雨雲（横流れ）
    for(let i=0;i<5;i++){
      const w=120+(i%3)*40, h=24+(i%2)*10
      const x=(i*70 + ((t*0.04)|0))% (LO_W+60) - 60
      const y=8 + (i%2)*10
      box(x,y,w,h,BG[3].cloud,'#0a1422')
    }
    // 走査線
    for(let y=0;y<LO_H;y+=3) if(((y+t*0.12)|0)%6<3) px(0,y,LO_W,1,'#1a335544')
  }
}

function drawFar(){
  if(state.level===1){
    const y0=160
    const ridge=[0,y0, 40,150, 90,158, 140,146, 200,152, 260,149, 320,155, 380,158, 450,162, 450,LO_H, 0,LO_H]
    loctx.beginPath(); loctx.moveTo(ridge[0],ridge[1])
    for(let i=2;i<ridge.length;i+=2) loctx.lineTo(ridge[i],ridge[i+1])
    loctx.closePath(); loctx.fillStyle='#2b1f1aaa'; loctx.fill()
  }
  if(state.level===2){
    // 前景ホームの屋根梁
    px(0,GROUND_Y-64,LO_W,8,'#0f1726')
    for(let x=8;x<LO_W;x+=36) px(x,GROUND_Y-64,2,46,'#0b1524')
    // 奥側ホーム（床・屋根・支柱）
    const by = GROUND_Y-34
    px(0,by,LO_W,4,'#202a40')
    px(0,by-18,LO_W,6,'#172236')
    for(let x=12;x<LO_W;x+=40) px(x,by-18,2,18,'#0d1526')
    for(let x=0;x<LO_W;x+=12) px(x,GROUND_Y-56,8,1,'#122038')
    // 吊鎖（表示）
    line(80,GROUND_Y-64,80,GROUND_Y-58,'#2a3a55'); line(90,GROUND_Y-64,90,GROUND_Y-58,'#2a3a55')
  }
  if(state.level===3){
    // 校舎（段差屋根＋窓）
    px(30,GROUND_Y-88,300,64,'#0b1424')
    px(30,GROUND_Y-92,120,6,'#0a1322'); px(150,GROUND_Y-96,100,6,'#0a1322')
    for(let x=40;x<320;x+=18){
      for(let y=GROUND_Y-80;y<GROUND_Y-24;y+=14){ const on = ((x+y+(t|0))%37)<24; px(x,y,12,6, on? '#3a5588':'#233a5f') }
    }
    // 屋上の人影（小さめ）
    if(FX.rooftopMan.visible && !FX.rooftopMan.permaGone){ const mx=FX.rooftopMan.x, my=FX.rooftopMan.y; px(mx-3,my-9,6,9,'#0f1522'); px(mx-2,my-11,4,2,'#0f1522') }
  }
}

function drawGround(){
  const pal = BG[state.level]

  if(state.level===1){
    const slopeTop = GROUND_Y-28
    for(let y=slopeTop;y<GROUND_Y;y++){
      for(let x=(y%4); x<LO_W; x+=8) px(x,y,6,1,BG[1].concrete)
      if(y%6===0) for(let x=0;x<LO_W;x+=12) px(x+(y%12),y,2,1,'#5a4b3b')
    }
    // 階段（緩斜）
    let sx=120; for(let k=0;k<10;k++){ px(sx, slopeTop+2+k*2, 30,1,'#3b2a20') }
    // 遊歩道
    px(0,GROUND_Y-2,LO_W,2,'#7a5b44'); px(0,GROUND_Y,LO_W,2,'#4a2f23')
    // ガードレール支柱
    for(let x=10;x<LO_W;x+=24){ px(x,GROUND_Y-18,2,16,'#cbb090'); px(x+2,GROUND_Y-18,10,1,'#cbb090') }
    // 河川（スムーズ波：ポリライン×2＋点スペキュラ＋泡）
    const ry = GROUND_Y+10
    px(0,ry,LO_W,LO_H-ry, pal.water)
    FX.riverPhase1 += 0.35*dt; FX.riverPhase2 += 0.22*dt; FX.riverPhase3 += 0.16*dt
    // ハイライト波（連続線で滑らか）
    const wave = (x)=> (Math.sin((x+FX.riverPhase1)*0.05)*2.0 + Math.sin((x*0.33+FX.riverPhase2)*0.035)*1.2 + Math.sin((x*0.12+FX.riverPhase3)*0.06)*0.7)
    loctx.strokeStyle='rgba(140,180,240,0.55)'; loctx.lineWidth=1; loctx.beginPath();
    for(let x=0;x<LO_W;x+=2){ const y = ry + 2 + wave(x); loctx.lineTo(x+0.5, y+0.5) }
    loctx.stroke()
    loctx.strokeStyle='rgba(200,220,255,0.25)'; loctx.beginPath();
    for(let x=0;x<LO_W;x+=3){ const y = ry + 6 + wave(x*0.9); loctx.lineTo(x+0.5, y+0.5) }
    loctx.stroke()
    // 点スペキュラ
    for(let x=0;x<LO_W;x+=1){ if(((x+t*0.02)|0)%37===0){ px(x, ry+4+(x%3),1,1,'#b9d2ff55') } }
    // 泡粒（流下）
    FX.riverFoam.forEach(b=>{ const yy = ry + 5 + Math.sin((b.x*0.15 + t*0.02))*2; px(b.x,yy,1,1,'rgba(230,240,255,0.6)'); b.x += b.vx*dt; if(b.x>LO_W) b.x= -Math.random()*60 })
  }

  if(state.level===2){
    // 線路（明確に）
    px(0,GROUND_Y-6,LO_W,2,'#d0d9ea'); px(0,GROUND_Y-2,LO_W,2,'#b3c1d9')
    for(let x=0;x<LO_W;x+=10) px(x,GROUND_Y-1,6,1,'#4a5b77')
    for(let x=4;x<LO_W;x+=14) px(x,GROUND_Y,10,2,'#6b5138')
    px(0,GROUND_Y-8,LO_W,1,'#e8c64a88')
  }

  if(state.level===3){
    // 校庭の地面
    px(0,GROUND_Y,LO_W,LO_H-GROUND_Y, pal.ground)
    for(let x=0;x<LO_W;x+=2) px(x,GROUND_Y-1,1,1,'#26476666')
  }
}

// ========= プレイヤ（ブレザー寄り・6コマ・上下ボブ無効） =========
function drawStudent(x,y, moving){
  const frame = moving ? (Math.floor(state.player.t/4)%6) : 2
  const legShift = [1,0,-1,-1,0,1][frame]
  const armSwing = [2,3,2,-2,-3,-2][frame]
  const ox = x, oy = y

  // ベースシルエット（透け防止）
  px(ox-2,oy-20,20,22,'#0b0f18')

  // 髪
  box(ox+3,oy-25,10,7,P.hair,'#14171b'); px(ox+4,oy-24,8,1,'#2b3138')
  // 顔
  px(ox+6,oy-23,4,3,P.skin); px(ox+7,oy-22,1,1,'#333'); px(ox+9,oy-22,1,1,'#333')
  px(ox+6,oy-20,4,1,'#ffd5b9')
  // シャツ＆ネクタイ
  px(ox+6,oy-19,4,1,P.shirt); px(ox+7,oy-18,2,5,P.tie)
  // ブレザー（肩広・濃い目・ラペル＆ボタン）
  box(ox-2,oy-18,20,14,P.blazer,P.blazerDark)
  line(ox+6,oy-18,ox+2,oy-8,'#091120') // 左ラペル
  line(ox+9,oy-18,ox+13,oy-8,'#091120') // 右ラペル
  px(ox+8,oy-8,1,1,P.button); px(ox+8,oy-6,1,1,P.button)
  // 校章
  px(ox+12,oy-12,3,3,P.emblem)
  // 腕（スイング）
  px(ox-1,oy-13+armSwing,3,7,P.blazer); px(ox+14,oy-13-armSwing,3,7,P.blazer)
  // パンツ
  box(ox+3+legShift,oy,4,6,P.pants,'#0b1524'); box(ox+9-legShift,oy,4,6,P.pants,'#0b1524')
  // 靴
  box(ox+3+legShift,oy+6,4,2,'#2d3b63','#1a2744'); box(ox+9-legShift,oy+6,4,2,'#2d3b63','#1a2744')
}

// ========= ステージ小物 =========
function drawStageObjects(){
  if(state.level===1){
    // 張り紙（幅狭・内容差し替え）
    const pxs=50, pys=GROUND_Y-28, pw=64, ph=16
    box(pxs+Math.floor(pw/2)-2, pys+ph, 4, 12, '#7f8fa8', '#2a3e66')
    box(pxs,pys,pw,ph,'#f4f7ff','#b7c6dd')
    px(pxs+3,pys-2,8,2,BG[1].tape); px(pxs+pw-11,pys-2,8,2,BG[1].tape)
    px(pxs+3,pys+ph,8,2,BG[1].tape); px(pxs+pw-11,pys+ph,8,2,BG[1].tape)
    // 中身の落書き風を控えめに（内容はカードで出す）
    scribble(pxs+5,pys+4,pw-10,ph-8,'#a3aec2','#c5cfdd',3)

    // カバン（接地＆影）
    const kx=178, ky=GROUND_Y-14
    box(kx,ky,20,14,'#2a3553','#1b2238')
    px(kx+5,ky-3,10,3,'#4c5e85') // 持ち手
    px(kx+3,GROUND_Y-1,14,1,'#0b0f18') // 接地影
    box(kx+9,ky+5,3,4,'#1b2238','#0e1424'); px(kx+10,ky+6,1,1,'#d9e2ff') // 留め具
    px(kx+17,ky+6,2,4,P.blue) // 水色キーホルダー
  }

  if(state.level===2){
    // 電光掲示（天井左上・小型）
    const ex=20, ey=GROUND_Y-58, ew=120, eh=22
    line(ex+60,GROUND_Y-64,ex+60,ey,'#2a3a55'); line(ex+70,GROUND_Y-64,ex+70,ey,'#2a3a55')
    box(ex,ey,ew,eh,P.sign,'#151921')
    for(let x=ex+4;x<ex+ew-4;x+=6) for(let y=ey+2;y<ey+eh-2;y+=6) px(x,y,1,1,'#1e2a45')
    const phase = Math.floor((t/600)%3); const msg = phase===0?'2015':(phase===1?'.school':'.local')
    textTiny(msg,ex+6,ey+5,P.blue)

    // ニュース掲示板（幅狭・縦長紙）
    const nx=250, ny=GROUND_Y-40, nw=88, nh=44
    box(nx+8,GROUND_Y-8,4,10,'#805f3a','#4a3320'); box(nx+nw-12,GROUND_Y-8,4,10,'#805f3a','#4a3320')
    box(nx,ny,nw,nh,BG[2].wood,'#1f140c'); px(nx+3,ny+3,nw-6,nh-6,BG[2].cork)
    const sheets = [ {w:18,h:nh-20,dx:8}, {w:16,h:nh-22,dx:34}, {w:18,h:nh-18,dx:58} ]
    sheets.forEach((s,i)=>{ const px0=nx+s.dx, py0=ny+9+(i%2?1:0); box(px0,py0,s.w,s.h,BG[2].paper,'#c9d4e6'); scribble(px0+3,py0+3,s.w-6,s.h-6,'#9aa7c2','#bfc9de',2) })
  }

  if(state.level===3){
    // 壊れた電光掲示板（幅さらに狭く・リアル寄りグリッチ）
    const bx=62, by=GROUND_Y-26, bw=96, bh=20
    box(bx+6,GROUND_Y-8,3,14,'#2a3e66','#15253f'); box(bx+bw-9,GROUND_Y-8,3,14,'#2a3e66','#15253f')
    box(bx,by,bw,bh,'#09111e','#101826')
    const sx=bx+4, sy=by+3, sw=bw-8, sh=bh-6
    // 背面
    px(sx,sy,sw,sh,'#0b1322')
    // ひび割れ
    line(sx+6,sy+2,sx+24,sy+6,'#2a4066'); line(sx+24,sy+6,sx+48,sy+3,'#2a4066'); line(sx+18,sy+sh-4,sx+36,sy+sh-10,'#2a4066')
    // スキャンラインずれ（細かく）
    for(let y=0;y<sh;y+=2){ const off = ((Math.sin((t*0.03)+y*0.7)+1)/2)*3|0; px(sx+off, sy+y, sw-off,1,'#1a2946') }
    // 縦ティア（垂直スライス）
    for(let i=0;i<3;i++){ const cx = sx + 6 + ((t*0.5+i*37)% (sw-12)); px(cx|0, sy, 1, sh, 'rgba(170,220,255,0.25)') }
    // RGB分離
    for(let y=0;y<sh;y+=4){ px(sx+1,sy+y, sw-2,1,'rgba(255,80,80,0.08)'); px(sx,sy+y+1, sw-2,1,'rgba(80,255,80,0.08)'); px(sx+2,sy+y+2, sw-2,1,'rgba(80,80,255,0.08)') }
    // ノイズ点滅
    for(let i=0;i<28;i++){ const rx=(sx+Math.random()*sw)|0, ry=(sy+Math.random()*sh)|0; px(rx,ry,1,1,'#9fb7ff88') }
    // 常時スパーク
    FX.brokenSparks.push({x:sx+6+Math.random()*(sw-12), y:sy+2+Math.random()*(sh-4), vy:0.4+Math.random()*0.6, life:16})
    while(FX.brokenSparks.length>24) FX.brokenSparks.shift()
    FX.brokenSparks = FX.brokenSparks.filter(s=>s.life>0)
    FX.brokenSparks.forEach(s=>{ const a=s.life/16; px(s.x|0,s.y|0,1,1,`rgba(200,230,255,${0.9*a})`); s.y+=s.vy; s.life-- })

    // 机＋小屋の屋根
    const deskX=260, deskY=GROUND_Y-10, deskW=100
    box(deskX,deskY,deskW,6,'#2a3e66','#16263f')
    px(deskX+6,deskY+6,4,10,'#1a2a44'); px(deskX+deskW-10,deskY+6,4,10,'#1a2a44')
    const roofX=deskX-6, roofY=deskY-16, roofW=deskW+12
    box(roofX,roofY,roofW,6,'#283a5a','#16263f'); px(roofX+2,roofY+6,roofW-4,2,'#3b567f')

    // モニター（砂嵐は画面サイズに合わせる）
    const mfx=270, mfy=GROUND_Y-24
    box(mfx, mfy, 30,18,'#203053','#101826')
    FX.monitor.x = mfx+3; FX.monitor.y = mfy+3; FX.monitor.w = 24; FX.monitor.h = 12
    for(let i=0;i<80;i++){ const rx=(FX.monitor.x+((Math.random()*FX.monitor.w)|0))|0; const ry=(FX.monitor.y+((Math.random()*FX.monitor.h)|0))|0; const a=0.3+Math.random()*0.7; px(rx,ry,1,1,`rgba(200,220,255,${a})`) }
    // タワー
    box(306,GROUND_Y-18,16,12,'#1a2a44','#0b1524'); px(318,GROUND_Y-12,2,2,'#79ff9a')
  }
}

// ========= 扉 =========
function drawDoor(){
  const d={ x: LO_W-34, y: GROUND_Y-26, w: 20, h: 26 }
  box(d.x,d.y,d.w,d.h,P.door,'#19253f')
  box(d.x+6,d.y+4,8,6,'#16263f','#0b1524'); px(d.x+15,d.y+14,2,2,'#9db7ff')
  const glow = state.doorLocked ? 0.08 : (0.15 + 0.12*((Math.sin(t/400)+1)/2))
  loctx.globalAlpha = glow; box(d.x-3,d.y-3,d.w+6,d.h+6,P.doorGlow,'#2a3e66'); loctx.globalAlpha = 1
  return d
}

// ========= HUD =========
function drawHUD(){
  const daysMap={1:3,2:2,3:0}; const daysLeft=daysMap[state.level]??0
  textTiny(`Stage ${state.level}`, 8,8)
  textTiny(`閉校まで：${daysLeft}日`, 8,22)
  const need = state.evidenceNeed[state.level]||0
  textTiny(`調査：${state.evidenceFound}/${need}`, LO_W-120,8,P.blue)
  textTiny(state.doorLocked?'扉：施錠中':'扉：解錠', LO_W-120,22, state.doorLocked?'#ffadad':'#b9ffb0')
  const insp = currentInspectable()
  const hint = state.inspecting? 'E：閉じる' : (insp? `E：${insp.label} を調べる` : (state.doorLocked? '調査を続けよう' : '扉に入ると次へ'))
  textTiny(hint, 8, LO_H-18, '#9bb7ff')
}

// ========= エフェクト更新（雨＆稲光） =========
function updateFX(){
  if(state.level===3){
    // 雨：段階的にスポーン → 常時維持（縦方向のみ）
    const spawnOne = (arr, vy,len)=>{ arr.push({x: (Math.random()*LO_W)|0, y: (-40 - Math.random()*160)|0, vy, len}) }
    FX.rainSpawnT += dt
    if(FX.rainFar.length < FX.rainTargets.far && FX.rainSpawnT>1){ spawnOne(FX.rainFar,1.6,6) }
    if(FX.rainMid.length < FX.rainTargets.mid && FX.rainSpawnT>0.7){ spawnOne(FX.rainMid,2.6,9) }
    if(FX.rainNear.length< FX.rainTargets.near && FX.rainSpawnT>0.4){ spawnOne(FX.rainNear,4.1,12) }

    ;['rainFar','rainMid','rainNear'].forEach(layer=>{
      const arr = FX[layer]
      arr.forEach(r=>{ r.y += r.vy*dt; if(r.y>LO_H){ FX.splashes.push({x:r.x, y:GROUND_Y-1, life:12}); r.y = (-120 - Math.random()*200)|0; r.x = (Math.random()*LO_W)|0 } })
    })

    // 稲光：頻度アップ＆ランダム（1〜3パルス）
    if(!FX.lightning.on && Math.random()<0.012){
      FX.lightning.on = true; FX.lightning.t = 0; FX.lightning.count++; FX.lightning.pulses = 1 + (Math.random()*3|0); FX.lightning.pulseT = 0
      const startX = 40 + Math.random()*360
      let x = startX, y = 10
      FX.lightning.path = []
      while(y<GROUND_Y-10){ const nx = x + (-10 + Math.random()*20); const ny = y + (6 + Math.random()*14); FX.lightning.path.push({x:nx,y:ny}); x=nx; y=ny }
      if(FX.lightning.count===1) FX.rooftopMan.visible = true
      if(FX.lightning.count>=3){ FX.rooftopMan.visible = false; FX.rooftopMan.permaGone = true }
    }
    if(FX.lightning.on){ FX.lightning.t += dt; FX.lightning.pulseT += dt; if(FX.lightning.pulseT>8){ FX.lightning.pulses--; FX.lightning.pulseT=0 } if(FX.lightning.pulses<=0){ FX.lightning.on=false } }

    FX.splashes = FX.splashes.filter(s=> (s.life-=dt)>0)
  }
}

// ========= 雨・スプラッシュ・稲光 =========
function drawRain(){
  if(state.level!==3) return
  const drawLayer=(arr,alpha)=>{ loctx.strokeStyle=`rgba(127,170,220,${alpha})`; loctx.lineWidth=1; arr.forEach(r=>{ loctx.beginPath(); loctx.moveTo(r.x+0.5,r.y-r.len+0.5); loctx.lineTo(r.x+0.5,r.y+0.5); loctx.stroke() }) }
  drawLayer(FX.rainFar,0.45); drawLayer(FX.rainMid,0.65); drawLayer(FX.rainNear,0.9)
  FX.splashes.forEach(s=>{ const a = s.life/12; loctx.strokeStyle=`rgba(180,210,255,${0.5*a})`; loctx.beginPath(); loctx.moveTo(s.x-2,s.y); loctx.lineTo(s.x+2,s.y); loctx.stroke(); loctx.beginPath(); loctx.moveTo(s.x,s.y-2); loctx.lineTo(s.x,s.y+1); loctx.stroke(); px(s.x-2,s.y-1,4,1,`rgba(160,200,255,${0.2*a})`) })
  if(FX.lightning.on){ const flicker = 0.12 + 0.4*Math.random(); loctx.strokeStyle=`rgba(240,248,255,${0.7+0.3*Math.random()})`; loctx.lineWidth=1; let prev = {x: FX.lightning.path[0]?.x||200, y: 10}; FX.lightning.path.forEach(p=>{ loctx.beginPath(); loctx.moveTo(prev.x+0.5,prev.y+0.5); loctx.lineTo(p.x+0.5,p.y+0.5); loctx.stroke(); prev=p }); loctx.fillStyle = `rgba(255,255,255,${flicker})`; loctx.fillRect(0,0,LO_W,LO_H) }
}

// ========= 判定 =========
const AABB=(ax,ay,aw,ah,bx,by,bw,bh)=> ax<bx+bw && ax+aw>bx && ay<by+bh && ay+ah>by
function currentInspectable(){ const p = state.player; return inspectables.find(it=> AABB(p.x-2,p.y-22,16,22, it.r.x,it.r.y,it.r.w,it.r.h)) }

// ========= メッセージカード（小さめ・中央） =========
function drawCard(){
  if(!state.message) return
  const cw = Math.min(320, Math.floor(LO_W*0.7))
  const linesH = 18 + (state.message.lines?.length||0)*12
  const ch = Math.max(70, Math.min(150, 40 + linesH))
  const cx = Math.floor((LO_W - cw)/2)
  const cy = Math.floor((LO_H - ch)/2)
  box(cx,cy, cw,ch, P.sign, '#151921')
  textMid(state.message.title, cx+10, cy+8)
  let y=cy+28
  state.message.lines.forEach(line=>{ textTiny(line,cx+10,y); y+=12 })
  textTiny('E：閉じる', cx+cw-68, cy+ch-18, P.blue)
}

// ========= クリアオーバーレイ（旧） =========
function drawClearOverlay(){
  if(!state.cleared) return
  loctx.fillStyle = 'rgba(0,0,0,0.45)'; loctx.fillRect(0,0,LO_W,LO_H)
  const cw = 340, ch = 130
  const cx = Math.floor((LO_W - cw)/2)
  const cy = Math.floor((LO_H - ch)/2)
  box(cx,cy,cw,ch,'#0f1626','#1b2944')
  textCenter('GAME CLEAR', cy+22, 18, '#cfe5ff')
  textCenter('ARCHIVE TRANSFER: SUCCESS', cy+60, 10, '#9bb7ff')
  textCenter('PURPOSE: MEMORIAL', cy+76, 10, '#9bb7ff')
}

// ========= 進行 =========
function inspectObject(obj){
  const key=`L${state.level}-${obj.id}`
  const first = !state.evidenceBook[key]
  if(first){ state.evidenceBook[key]=true; state.evidenceFound++; if(state.evidenceFound >= (state.evidenceNeed[state.level]||0)) state.doorLocked=false }
  state.message = { title: obj.label, lines: obj.lines }
  state.inspecting = true
}
function resetRun(){
  state.level = 1
  state.doorLocked = true
  state.inspecting = false
  state.cleared = false
  state.vx = 0
  state.player.x = 22
  state.evidenceBook = {}
  state.evidenceFound = 0
  buildStage()
}
async function nextLevel(){
  if(state.level<3){
    state.level++
    buildStage()
  } else {
    state.cleared = true
    state.mode='clear'
    state.message = null
    store.revivalCleared = true
  }
}

function startGame(){ state.mode='play'; resetRun() }

// ========= ループ =========
function loop(ts){
  dt = Math.min(2, (ts - (lastTs||ts)) / 16.67) || 1; lastTs = ts
  t = ts; FX.time = ts
  loctx.clearRect(0,0,LO_W,LO_H)

  // 画面別描画
  if(state.mode==='title'){
    drawTitleScreen()
    if(justPressed('e')) startGame()
    // 転送
    ctx.imageSmoothingEnabled=false
    ctx.clearRect(0,0,W,H)
    ctx.drawImage(lo, 0,0,LO_W,LO_H, 0,0, W, H)
    prev.e = keys.has('e')
    raf = requestAnimationFrame(loop)
    return
  }

  if(state.mode==='clear'){
    // 背景に最後のステージをうっすら（任意：ここでは暗転のみ）
    drawGameClearScreen()
    if(justPressed('e')){
      store.dmIndex = 0
      router.push('/')
      return
    }
    ctx.imageSmoothingEnabled=false
    ctx.clearRect(0,0,W,H)
    ctx.drawImage(lo, 0,0,LO_W,LO_H, 0,0, W, H)
    prev.e = keys.has('e')
    raf = requestAnimationFrame(loop)
    return
  }

  // ========== ゲームプレイ中 ==========
  drawSky(); drawFar(); drawGround(); drawStageObjects()

  if(!state.inspecting && !state.cleared){
    state.vx=0
    if(keys.has('arrowleft')||keys.has('a')) state.vx=-SPEED
    if(keys.has('arrowright')||keys.has('d')) state.vx=+SPEED
  }
  state.player.x = Math.max(0, Math.min(LO_W- state.player.w, state.player.x + state.vx*dt))
  state.player.t += Math.abs(state.vx*dt)

  const doorRect = drawDoor()
  const hitDoor = AABB(state.player.x, state.player.y-22, state.player.w, state.player.h, doorRect.x,doorRect.y,doorRect.w,doorRect.h)
  if(hitDoor && !state.inspecting && !state.cleared && !state.doorLocked){ nextLevel() }

  drawStudent(state.player.x, state.player.y, Math.abs(state.vx)>0 && !state.cleared)

  const insp = currentInspectable()
  if(!state.inspecting && !state.cleared){ if(insp && justPressed('e')) inspectObject(insp) }
  else { if(justPressed('e') && state.message){ state.inspecting=false; state.message=null } }

  drawHUD(); updateFX(); drawRain(); drawCard();

  ctx.imageSmoothingEnabled=false
  ctx.clearRect(0,0,W,H)
  ctx.drawImage(lo, 0,0,LO_W,LO_H, 0,0, W, H)

  prev.e = keys.has('e')
  raf = requestAnimationFrame(loop)
}

onMounted(()=>{
  const canvas = cv.value
  ctx = canvas.getContext('2d')
  lo = document.createElement('canvas'); lo.width=LO_W; lo.height=LO_H
  loctx = lo.getContext('2d', { alpha: false })
  pixelate(canvas)
  window.addEventListener('keydown', kd)
  window.addEventListener('keyup', ku)
  // タイトルから開始
  buildStage() // 資材初期化だけしておく
  raf = requestAnimationFrame(loop)
})

onBeforeUnmount(()=>{ window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); cancelAnimationFrame(raf) })
</script>

<style scoped>
.wrap { display: grid; place-items: center; gap: 8px; padding: 16px; }
.stageWrap { width: 900px; height: 600px; display:flex; align-items:center; justify-content:center; margin: 0 auto; }
.stage { width: 900px; height: 600px; display: block; margin: 0 auto; border-radius: 12px; overflow: hidden; background:#0b0d12; box-shadow: 0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05); }
.hint  { color: #98b3ff; margin-top: 4px; font-size: 12px; font-family: ui-monospace, Menlo, monospace; text-align: center; }
</style>
