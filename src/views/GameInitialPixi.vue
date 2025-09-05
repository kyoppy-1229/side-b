<template>
  <div class="card">
    <h2>初期版（呪い版） <span class="badge"><span class="dot"></span>PixiJS</span></h2>
    <div class="hr"></div>
    <div ref="mountRef" style="width:960px;max-width:100%;margin:auto;border:1px solid #27305c;border-radius:12px;overflow:hidden;"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js'

const mountRef = ref(null)
let app, scene, t=0
const W = 320, H = 180, SCALE = 3

function makeDitherBG(){
  const g = new Graphics()
  g.beginFill(0x0b0d12).drawRect(0,0,W,H).endFill()
  // subtle scanlines
  for(let y=0;y<H;y+=2){
    g.beginFill(0x0a0f18).drawRect(0,y,W,1).endFill()
  }
  return g
}

function makeClock(centerX, centerY){
  const c = new Graphics()
  c.beginFill(0x1b2340).drawCircle(centerX,centerY,20).endFill()
  c.beginFill(0x141b31).drawCircle(centerX,centerY,18).endFill()
  // hands are updated in ticker
  c.hx = centerX; c.hy = centerY
  c.hands = new Graphics()
  c.addChild(c.hands)
  return c
}

onMounted(async () => {
  app = new Application()
  await app.init({ width: W, height: H, background: '#0b0d12', antialias: false })
  app.renderer.canvas.style.width = (W*SCALE)+'px'
  app.renderer.canvas.style.height = (H*SCALE)+'px'
  app.renderer.canvas.style.imageRendering = 'pixelated'
  mountRef.value.appendChild(app.canvas)

  scene = new Container()
  scene.addChild(makeDitherBG())

  // glitch veil
  const veil = new Graphics()
  veil.beginFill(0x67a6ff, 0.06).drawRect(0,0,W,H).endFill()
  scene.addChild(veil)

  // reverse clock
  const clock = makeClock(W/2, H/2-10)
  scene.addChild(clock)

  const label = new Text('SIDE-B [初期版]', new TextStyle({fill:'#9fb6ff', fontSize: 10, fontFamily:'monospace'}))
  label.x = 8; label.y = 8
  scene.addChild(label)

  app.stage.addChild(scene)

  app.ticker.add(()=>{
    t++
    const hands = clock.hands
    hands.clear()
    const sec = -t * 0.1 // 逆行
    const min = -t * 0.01
    const sx = clock.hx, sy = clock.hy
    const r1 = 16, r2 = 12
    // minute hand
    hands.lineStyle(1, 0x7dc0ff).moveTo(sx,sy).lineTo(sx + Math.cos(min)*r2, sy + Math.sin(min)*r2)
    // second hand
    hands.lineStyle(1, 0xff7c9a).moveTo(sx,sy).lineTo(sx + Math.cos(sec)*r1, sy + Math.sin(sec)*r1)
    // random glitch flicker
    veil.alpha = 0.04 + Math.abs(Math.sin(t*0.07))*0.06
  })
})

onBeforeUnmount(()=>{
  if(app){
    app.destroy(true, { children: true, texture: true, baseTexture: true })
  }
})
</script>
