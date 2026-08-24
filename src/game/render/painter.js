// Canvas painter. Draws corridors and rooms in world coordinates; SceneStage
// applies the camera transform before calling renderScene(). Everything is
// drawn procedurally (no external art) and coloured from the edition theme so
// the two editions read as the same building under different light.
//
// The building is a 片廊下型 school: walls are drawn as elevation bands, the
// floor in plan. North = the room block and its sliding doors, south = the
// continuous window wall onto the schoolyard.

import { PX_PER_M, m } from '../data/school.js'

function roundRect(ctx, x, y, w, h, r){
  const rad = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
}

function fillRect(ctx, colour, x, y, w, h){
  ctx.fillStyle = colour
  ctx.fillRect(x, y, w, h)
}

// ------------------------------------------------------------------ surfaces
function floorPalette(t, style){
  return (t.floors && t.floors[style]) || (t.floors && t.floors.tile) || { a: t.floor, b: t.floorAlt, line: t.grout }
}

function drawFloor(ctx, x, y, w, h, t, style = 'tile'){
  const p = floorPalette(t, style)
  ctx.save()
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip()
  fillRect(ctx, p.a, x, y, w, h)

  if(style === 'wood'){
    // 板張り: long planks running along the room, staggered butt joints.
    const plank = m(0.19)
    const seam = m(1.8)
    for(let py = y; py < y + h; py += plank){
      if(Math.round((py - y) / plank) % 2) fillRect(ctx, p.b, x, py, w, plank)
    }
    ctx.strokeStyle = p.line; ctx.lineWidth = 1
    ctx.beginPath()
    for(let py = y; py <= y + h; py += plank){ ctx.moveTo(x, py); ctx.lineTo(x + w, py) }
    ctx.stroke()
    ctx.strokeStyle = p.plank || 'rgba(255,255,255,0.08)'
    ctx.beginPath()
    let row = 0
    for(let py = y; py < y + h; py += plank){
      for(let px = x + (row % 2 ? seam / 2 : 0); px < x + w; px += seam){
        ctx.moveTo(px, py); ctx.lineTo(px, py + plank)
      }
      row += 1
    }
    ctx.stroke()
  } else if(style === 'carpet'){
    fillRect(ctx, p.a, x, y, w, h)
    ctx.fillStyle = p.b
    const tile = m(0.5)
    for(let ty = y; ty < y + h; ty += tile){
      for(let tx = x; tx < x + w; tx += tile){
        if((Math.floor(tx / tile) + Math.floor(ty / tile)) % 2) ctx.fillRect(tx, ty, tile, tile)
      }
    }
    // carpet grain
    ctx.strokeStyle = p.line; ctx.lineWidth = 1
    ctx.beginPath()
    for(let ty = y; ty <= y + h; ty += tile){ ctx.moveTo(x, ty); ctx.lineTo(x + w, ty) }
    ctx.stroke()
  } else if(style === 'concrete'){
    fillRect(ctx, p.a, x, y, w, h)
    ctx.strokeStyle = p.line; ctx.lineWidth = 1
    const slab = m(2.4)
    ctx.beginPath()
    for(let px = x; px <= x + w; px += slab){ ctx.moveTo(px, y); ctx.lineTo(px, y + h) }
    for(let py = y; py <= y + h; py += slab){ ctx.moveTo(x, py); ctx.lineTo(x + w, py) }
    ctx.stroke()
    // patchy staining
    ctx.fillStyle = p.b
    for(let i = 0; i < 14; i += 1){
      const sx = x + ((i * 977) % Math.max(1, w))
      const sy = y + ((i * 613) % Math.max(1, h))
      ctx.globalAlpha = 0.35
      ctx.beginPath(); ctx.ellipse(sx, sy, m(0.9), m(0.5), 0, 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalAlpha = 1
  } else {
    // 45cm vinyl / tile in a checker, the standard school corridor floor.
    const tile = style === 'entrance' ? m(0.3) : m(0.45)
    for(let ty = y; ty < y + h; ty += tile){
      for(let tx = x; tx < x + w; tx += tile){
        const alt = (Math.floor(tx / tile) + Math.floor(ty / tile)) % 2 === 0
        fillRect(ctx, alt ? p.a : p.b, tx, ty, tile, tile)
      }
    }
    ctx.strokeStyle = p.line; ctx.lineWidth = 1
    ctx.beginPath()
    for(let tx = x; tx <= x + w; tx += tile){ ctx.moveTo(tx, y); ctx.lineTo(tx, y + h) }
    for(let ty = y; ty <= y + h; ty += tile){ ctx.moveTo(x, ty); ctx.lineTo(x + w, ty) }
    ctx.stroke()
  }

  // light falling in from the south windows
  const light = ctx.createLinearGradient(0, y + h, 0, y)
  light.addColorStop(0, t.id === 'original' ? 'rgba(120,150,190,0.05)' : 'rgba(255,240,200,0.20)')
  light.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = light; ctx.fillRect(x, y, w, h)
  // wall shadow along the top edge
  const shade = ctx.createLinearGradient(0, y, 0, y + 20)
  shade.addColorStop(0, 'rgba(0,0,0,0.20)'); shade.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = shade; ctx.fillRect(x, y, w, 20)
  ctx.restore()
}

/** A painted wall band: upper plaster, 腰壁 (wainscot), baseboard. */
function drawWallBand(ctx, x, y, w, h, t, { wainscot = true } = {}){
  fillRect(ctx, t.wall, x, y, w, h)
  const grad = ctx.createLinearGradient(0, y, 0, y + h)
  grad.addColorStop(0, 'rgba(0,0,0,0.16)')
  grad.addColorStop(0.45, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad; ctx.fillRect(x, y, w, h)
  if(wainscot && h > 40){
    const wy = y + h * 0.62
    fillRect(ctx, t.wainscot, x, wy, w, h - (wy - y))
    fillRect(ctx, t.wainscotEdge, x, wy - 2, w, 3)
  }
  fillRect(ctx, t.baseboard, x, y + h - 5, w, 5)
}

function drawPilaster(ctx, x, y, h, t){
  fillRect(ctx, t.pilaster, x - 7, y, 14, h)
  fillRect(ctx, t.pilasterEdge, x + 4, y, 3, h)
}

/**
 * Aluminium-sash window band — the school's most repeated element.
 * `inner` glazing is the 廊下側の窓 between a classroom and the hall: the same
 * sash, but what you see through it is the next room, not the sky.
 */
function drawWindowBand(ctx, x, y, w, h, t, { panes = null, sill = true, inner = false } = {}){
  const unit = m(1.7)
  const count = panes || Math.max(1, Math.round(w / unit))
  const cw = w / count
  for(let i = 0; i < count; i += 1){
    if(inner) drawInnerWindow(ctx, x + i * cw + 2, y, cw - 4, h, t)
    else drawSashWindow(ctx, x + i * cw + 2, y, cw - 4, h, t)
  }
  if(sill){
    fillRect(ctx, t.wainscotEdge, x, y + h - 4, w, 4)
  }
}

/** Frosted/plain glass looking into the room next door. No sky, no trees. */
function drawInnerWindow(ctx, x, y, w, h, t){
  if(w <= 4 || h <= 6) return
  fillRect(ctx, t.windowFrame, x, y, w, h)
  const gx = x + 4, gy = y + 4, gw = w - 8, gh = h - 9
  if(gw <= 2 || gh <= 2) return
  const glass = ctx.createLinearGradient(0, gy, 0, gy + gh)
  if(t.id === 'original'){
    glass.addColorStop(0, '#2f3944'); glass.addColorStop(1, '#3b4653')
  } else {
    glass.addColorStop(0, '#dfe7e2'); glass.addColorStop(1, '#c6d2cd')
  }
  ctx.fillStyle = glass; ctx.fillRect(gx, gy, gw, gh)
  // a hint of the room beyond: the top of a blackboard / furniture line
  ctx.fillStyle = t.id === 'original' ? 'rgba(30,44,36,0.5)' : 'rgba(70,100,80,0.28)'
  ctx.fillRect(gx, gy + gh * 0.55, gw, gh * 0.28)
  ctx.strokeStyle = t.windowMullion; ctx.lineWidth = 3
  ctx.strokeRect(gx, gy, gw, gh)
  ctx.beginPath()
  ctx.moveTo(gx + gw / 2, gy); ctx.lineTo(gx + gw / 2, gy + gh)
  ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.13)'
  ctx.beginPath()
  ctx.moveTo(gx, gy + gh); ctx.lineTo(gx + gw * 0.4, gy); ctx.lineTo(gx + gw * 0.62, gy); ctx.lineTo(gx + gw * 0.18, gy + gh)
  ctx.closePath(); ctx.fill()
}

function drawSashWindow(ctx, x, y, w, h, t){
  if(w <= 4 || h <= 6) return
  fillRect(ctx, t.windowFrame, x, y, w, h)
  const gx = x + 4, gy = y + 4, gw = w - 8, gh = h - 9
  if(gw <= 2 || gh <= 2) return
  const sky = ctx.createLinearGradient(0, gy, 0, gy + gh)
  sky.addColorStop(0, t.skyTop); sky.addColorStop(1, t.skyBottom)
  ctx.fillStyle = sky; ctx.fillRect(gx, gy, gw, gh)
  // treeline seen through the glass
  ctx.fillStyle = t.treeLeafDark
  ctx.beginPath()
  ctx.moveTo(gx, gy + gh)
  for(let bx = gx; bx <= gx + gw; bx += 10){
    ctx.lineTo(bx, gy + gh - 5 - Math.abs(((bx / 10) % 3) - 1) * 6)
  }
  ctx.lineTo(gx + gw, gy + gh); ctx.closePath(); ctx.fill()
  ctx.fillStyle = t.cloud
  ctx.beginPath(); ctx.ellipse(gx + gw * 0.36, gy + gh * 0.28, gw * 0.2, gh * 0.1, 0, 0, Math.PI * 2); ctx.fill()
  // sash: two sliding leaves, one horizontal rail
  ctx.strokeStyle = t.windowMullion; ctx.lineWidth = 3
  ctx.strokeRect(gx, gy, gw, gh)
  ctx.beginPath()
  ctx.moveTo(gx + gw / 2, gy); ctx.lineTo(gx + gw / 2, gy + gh)
  ctx.moveTo(gx, gy + gh * 0.52); ctx.lineTo(gx + gw, gy + gh * 0.52)
  ctx.stroke()
  // glass sheen
  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  ctx.beginPath()
  ctx.moveTo(gx, gy + gh); ctx.lineTo(gx + gw * 0.45, gy); ctx.lineTo(gx + gw * 0.72, gy); ctx.lineTo(gx + gw * 0.2, gy + gh)
  ctx.closePath(); ctx.fill()
}

/** 引戸 — the sliding classroom door, with frosted glass and a name plate. */
function drawSlidingDoor(ctx, d, t, opts, { plate = true } = {}){
  const near = opts.highlight === d.id
  const x = d.gx, y = d.gy, w = d.gw, h = d.gh

  // recessed frame
  fillRect(ctx, t.doorDark, x - 5, y - 5, w + 10, h + 10)
  fillRect(ctx, t.door, x, y, w, h)
  // two leaves
  ctx.strokeStyle = t.doorDark; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.stroke()
  // frosted upper glass in each leaf
  for(const lx of [x + 5, x + w / 2 + 3]){
    const lw = w / 2 - 8
    if(lw <= 0) continue
    fillRect(ctx, t.window, lx, y + 7, lw, h * 0.42)
    ctx.strokeStyle = 'rgba(255,255,255,0.20)'; ctx.lineWidth = 1
    ctx.strokeRect(lx, y + 7, lw, h * 0.42)
    // lower kick panel
    fillRect(ctx, t.doorPanel, lx, y + h * 0.56, lw, h * 0.36)
  }
  // recessed pulls, at the meeting stile
  fillRect(ctx, t.doorHandle, x + w / 2 - 9, y + h * 0.5, 4, 12)
  fillRect(ctx, t.doorHandle, x + w / 2 + 5, y + h * 0.5, 4, 12)

  if(plate && d.label && d.primary !== false){
    const sw = Math.max(m(1.6), w + 8)
    const sx = d.cx - sw / 2
    const sy = y - 26
    fillRect(ctx, t.sign, sx, sy, sw, 21)
    ctx.strokeStyle = t.signEdge; ctx.lineWidth = 1; ctx.strokeRect(sx + 0.5, sy + 0.5, sw - 1, 20)
    ctx.fillStyle = t.signText
    ctx.font = '13px "Hiragino Sans","Yu Gothic",sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(d.label, d.cx, sy + 11)
  }
  if(near) drawHighlightRing(ctx, x - 7, y - 7, w + 14, h + 14, t)
}

function drawHighlightRing(ctx, x, y, w, h, t){
  ctx.save()
  ctx.strokeStyle = t.accent
  ctx.lineWidth = 3
  ctx.shadowColor = t.accent
  ctx.shadowBlur = 14
  roundRect(ctx, x, y, w, h, 6); ctx.stroke()
  ctx.restore()
}

// ------------------------------------------------------------------ corridor
function drawCorridor(ctx, scene, t, opts){
  const W = scene.width
  const H = scene.height
  const L = scene.layout
  const basement = scene.floor === 'B1'

  // --- the room block seen in section above the corridor wall ---
  fillRect(ctx, t.roomBlock, 0, L.roomBandY, W, L.roomBandH)
  drawRoomBlockSection(ctx, scene, t)
  fillRect(ctx, 'rgba(0,0,0,0.28)', 0, L.roomBandY + L.roomBandH - 5, W, 5)

  // --- north wall ---
  drawWallBand(ctx, 0, L.wallY, W, L.wallH, t)

  // pilaster at every room boundary — the structural grid you can actually see
  // in a real school corridor.
  const originPx = L.originPx
  drawPilaster(ctx, L.stairW, L.wallY, L.wallH, t)
  let cursor = 0
  for(const entry of L.north){
    cursor = entry.startM + entry.spanM
    drawPilaster(ctx, originPx + m(cursor), L.wallY, L.wallH, t)
  }

  // corridor-side windows (欄間) filling the wall between doorways
  drawCorridorWindows(ctx, scene, t)

  // --- corridor slab ---
  drawFloor(ctx, 0, L.floorY, W, L.floorH, t, basement ? 'concrete' : 'tile')
  // centre line worn into the lino by decades of feet
  ctx.strokeStyle = t.id === 'original' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.10)'
  ctx.lineWidth = m(1.1)
  ctx.beginPath(); ctx.moveTo(0, L.floorY + L.floorH * 0.5); ctx.lineTo(W, L.floorY + L.floorH * 0.5); ctx.stroke()

  // --- south wall ---
  drawWallBand(ctx, 0, L.southWallY, W, L.southWallH, t, { wainscot: false })
  if(scene.windowed){
    // continuous glazing between the two stairwells
    const x0 = L.stairW
    const x1 = W - L.stairW
    fillRect(ctx, t.wainscot, x0, L.southWallY, x1 - x0, 18)
    drawWindowBand(ctx, x0, L.southWallY + 18, x1 - x0, L.southWallH - 24, t)
  }

  // --- fixtures on and against the south wall ---
  for(const f of scene.fixtures || []) drawFixture(ctx, f, t)

  // --- the grounds, on the floor that actually stands on them ---
  if(scene.grounds) drawSchoolGrounds(ctx, 0, L.outsideY, W, H - L.outsideY, t)
  void basement

  // --- stairwells, then doors on top ---
  for(const s of scene.stairs) drawStairwell(ctx, s, t, opts, W)
  if(scene.basement) drawBasementDoor(ctx, scene.basement, t, opts)
  for(const d of scene.doors) drawSlidingDoor(ctx, d, t, opts)
}

/** The way down to B1: a plain service door in the corridor's west bay. */
function drawBasementDoor(ctx, b, t, opts){
  const near = opts.highlight === b.id
  fillRect(ctx, t.doorDark, b.gx - 5, b.gy - 5, b.gw + 10, b.gh + 10)
  fillRect(ctx, t.pilasterEdge, b.gx, b.gy, b.gw, b.gh)
  fillRect(ctx, t.pilaster, b.gx + 3, b.gy + 3, b.gw - 6, b.gh - 6)
  // a single flush leaf, no glazing — clearly not a classroom
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1
  ctx.strokeRect(b.gx + 6, b.gy + 6, b.gw - 12, b.gh - 12)
  fillRect(ctx, t.doorHandle, b.gx + b.gw - 14, b.gy + b.gh / 2 - 2, 6, 14)
  // steps falling away behind the opening
  for(let i = 0; i < 4; i += 1){
    ctx.fillStyle = `rgba(0,0,0,${0.10 + i * 0.09})`
    ctx.fillRect(b.gx + 8, b.gy + 10 + i * ((b.gh - 24) / 4), b.gw - 16, (b.gh - 24) / 4 - 2)
  }
  const label = '▼ 地下'
  ctx.font = '13px "Hiragino Sans","Yu Gothic",sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  const sw = Math.max(74, ctx.measureText(label).width + 18)
  const sy = b.gy - 26
  fillRect(ctx, t.sign, b.cx - sw / 2, sy, sw, 21)
  ctx.strokeStyle = t.signEdge; ctx.lineWidth = 1; ctx.strokeRect(b.cx - sw / 2 + 0.5, sy + 0.5, sw - 1, 20)
  ctx.fillStyle = t.signText
  ctx.fillText(label, b.cx, sy + 11)
  if(near) drawHighlightRing(ctx, b.gx - 7, b.gy - 7, b.gw + 14, b.gh + 14, t)
}

/** A sliver of each room's floor, so the doors visibly lead somewhere. */
function drawRoomBlockSection(ctx, scene, t){
  const L = scene.layout
  const y = L.roomBandY + 6
  const h = L.roomBandH - 14
  for(const entry of L.north){
    const x0 = L.originPx + m(entry.startM)
    const w = m(entry.spanM)
    const style = entry.def.floorStyle === 'wood' ? 'wood' : entry.def.floorStyle
    ctx.save()
    ctx.beginPath(); ctx.rect(x0 + 4, y, Math.max(0, w - 8), h); ctx.clip()
    drawFloor(ctx, x0 + 4, y - h, Math.max(0, w - 8), h * 2, t, style)
    ctx.restore()
    ctx.fillStyle = 'rgba(0,0,0,0.34)'
    ctx.fillRect(x0 + w - 4, y - 6, 8, h + 12)
  }
  // stairwell shafts and the service bays beside them
  fillRect(ctx, 'rgba(0,0,0,0.30)', 0, y - 6, L.originPx, h + 12)
  fillRect(ctx, 'rgba(0,0,0,0.30)', scene.width - L.originPx, y - 6, L.originPx, h + 12)
}

function drawCorridorWindows(ctx, scene, t){
  const L = scene.layout
  const northDoors = scene.doors.filter((d) => d.side === 'north').sort((a, b) => a.gx - b.gx)
  const y = L.wallY + 24
  const h = L.wallH * 0.38
  // 掲示板 live on the corridor's inner wall, under the classroom windows —
  // the strip of wall a school actually pins things to.
  const boardY = L.wallY + L.wallH * 0.64
  const boardH = L.wallH * 0.28
  // Glazing only spans the rooms; the service bays at each end stay solid wall.
  let x = L.originPx
  const end = scene.width - L.stairW - m(L.bayM)

  const fillGap = (from, width) => {
    if(width <= m(0.9)) return
    drawWindowBand(ctx, from, y, width, h, t, { sill: false, inner: true })
    if(width > m(3.0)){
      const bw = Math.min(m(2.6), width - m(0.8))
      drawFixture(ctx, { type: 'board', x: from + (width - bw) / 2, y: boardY, w: bw, h: boardH }, t)
    }
  }

  for(const d of northDoors){
    fillGap(x, d.gx - 12 - x)
    x = d.gx + d.gw + 12
  }
  fillGap(x, end - x)
}

function drawFixture(ctx, f, t){
  if(f.type === 'board'){
    fillRect(ctx, t.boardEdge, f.x - 3, f.y - 3, f.w + 6, f.h + 6)
    fillRect(ctx, t.board, f.x, f.y, f.w, f.h)
    ctx.fillStyle = t.paper
    for(let i = 0; i < Math.floor(f.w / 34); i += 1){
      ctx.fillRect(f.x + 8 + i * 34, f.y + 8, 24, f.h - 20)
    }
  } else if(f.type === 'pipe'){
    fillRect(ctx, t.pilasterEdge, f.x, f.y, f.w, f.h)
    fillRect(ctx, 'rgba(255,255,255,0.10)', f.x + 2, f.y, 3, f.h)
  }
}

/**
 * The grounds outside the ground-floor windows: the concrete apron, the clipped
 * hedge against the glass, flower beds and the trees along the building. Only
 * 1F draws this — from the upper floors the glazing is the whole view.
 */
function drawSchoolGrounds(ctx, x, y, w, h, t){
  ctx.save()
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip()
  // The action bar covers the bottom of the stage, so the planting is packed
  // into the upper part of the band.
  const TAIL = 0.86
  const f = (v) => y + h * v * TAIL

  fillRect(ctx, t.path, x, y, w, h * 0.06 * TAIL)             // 犬走り
  fillRect(ctx, t.grass, x, f(0.06), w, y + h - f(0.06))
  ctx.fillStyle = t.grassLight
  for(let gx = x; gx < x + w; gx += m(1.1)) ctx.fillRect(gx, f(0.06), 2, y + h - f(0.06))

  // clipped hedge running right along the glass
  fillRect(ctx, t.treeLeafDark, x, f(0.06), w, f(0.20) - f(0.06))
  ctx.fillStyle = t.treeLeaf
  for(let hx = x; hx < x + w; hx += 13){
    ctx.beginPath(); ctx.arc(hx, f(0.12), 8, 0, Math.PI * 2); ctx.fill()
  }

  for(let bx = x + m(5); bx < x + w - m(5); bx += m(20)){
    drawFlowerbed(ctx, bx, f(0.26), m(7), f(0.52) - f(0.26), t)
    drawTree(ctx, bx + m(14), f(0.66), m(2.3), t)
  }
  // the ground you would be standing on if you walked out
  fillRect(ctx, t.path, x, f(1.02), w, y + h - f(1.02))
  ctx.restore()
}

function drawFlowerbed(ctx, x, y, w, h, t){
  fillRect(ctx, t.soil, x, y, w, h)
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h)
  const cols = t.flower
  let i = 0
  for(let fy = y + 8; fy < y + h - 5; fy += 12){
    for(let fx = x + 8; fx < x + w - 5; fx += 12){
      ctx.fillStyle = cols[(i++) % cols.length]
      ctx.beginPath(); ctx.arc(fx, fy, 3.2, 0, Math.PI * 2); ctx.fill()
    }
  }
}

function drawTree(ctx, cx, cy, r, t){
  ctx.fillStyle = 'rgba(0,0,0,0.20)'
  ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.75, r * 0.9, r * 0.3, 0, 0, Math.PI * 2); ctx.fill()
  fillRect(ctx, t.treeTrunk, cx - 5, cy, 10, r * 0.75)
  ctx.fillStyle = t.treeLeafDark
  ctx.beginPath(); ctx.arc(cx, cy - r * 0.2, r, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = t.treeLeaf
  ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.4, r * 0.68, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + r * 0.35, cy - r * 0.3, r * 0.58, 0, Math.PI * 2); ctx.fill()
}

function drawStairwell(ctx, s, t, opts, corridorW){
  const near = opts.highlight === s.id
  const west = s.side === 'west'

  // the well is an alcove off the corridor; the landing is the corridor slab
  fillRect(ctx, t.doorDark, s.gx, s.gy, s.gw, s.gh)
  // flights: treads running back into the building
  const steps = 9
  const sh = s.gh / steps
  for(let i = 0; i < steps; i += 1){
    const shade = 0.42 + (i / steps) * 0.42
    ctx.fillStyle = t.id === 'original'
      ? `rgba(96,104,114,${shade})`
      : `rgba(168,140,102,${shade})`
    ctx.fillRect(s.gx + 6, s.gy + i * sh + 2, s.gw - 12, sh - 3)
    ctx.fillStyle = 'rgba(0,0,0,0.22)'
    ctx.fillRect(s.gx + 6, s.gy + i * sh + sh - 3, s.gw - 12, 2)
  }
  // handrail down the outer side
  ctx.strokeStyle = t.doorHandle; ctx.lineWidth = 3
  const railX = west ? s.gx + 5 : s.gx + s.gw - 5
  ctx.beginPath(); ctx.moveTo(railX, s.gy + 4); ctx.lineTo(railX, s.gy + s.gh - 4); ctx.stroke()
  // opening onto the corridor
  fillRect(ctx, 'rgba(0,0,0,0.28)', s.gx, s.gy + s.gh - 6, s.gw, 6)

  // sign: which way the flights go
  const parts = []
  for(const target of s.targets) parts.push(`${Number(target.replace('F', '')) > Number((opts.floor || '1F').replace('F', '')) ? '↑' : '↓'}${target}`)
  if(s.toBasement) parts.push('↓B1')
  const label = `${s.label}${parts.length ? '　' + parts.join(' ') : ''}`
  ctx.font = '13px "Hiragino Sans","Yu Gothic",sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  const sw = Math.max(96, ctx.measureText(label).width + 18)
  const sx = s.gx + s.gw / 2 - sw / 2
  const sy = s.gy - 24
  fillRect(ctx, t.sign, sx, sy, sw, 21)
  ctx.strokeStyle = t.signEdge; ctx.lineWidth = 1; ctx.strokeRect(sx + 0.5, sy + 0.5, sw - 1, 20)
  ctx.fillStyle = t.signText
  ctx.fillText(label, s.gx + s.gw / 2, sy + 11)

  // landing marking on the floor, so the trigger area is legible
  ctx.strokeStyle = near ? t.accent : 'rgba(255,255,255,0.16)'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 6])
  ctx.strokeRect(s.trigger.x + 4, s.trigger.y + 4, s.trigger.w - 8, s.trigger.h - 8)
  ctx.setLineDash([])
  if(near) drawHighlightRing(ctx, s.gx, s.gy, s.gw, s.gh, t)
  void corridorW
}

// ------------------------------------------------------------------ room
function drawRoom(ctx, scene, t, opts){
  const W = scene.width
  const H = scene.height
  const i = scene.interior
  const walls = scene.walls
  const basement = scene.room.floor === 'B1'

  // --- floor ---
  drawFloor(ctx, i.x, i.y, i.w, i.h, t, scene.floorStyle)

  // --- north wall (corridor side): doors + 廊下側の窓 ---
  drawWallBand(ctx, 0, 0, W, i.y, t, { wainscot: false })
  drawRoomCorridorWindows(ctx, scene, t)
  for(const ex of scene.exits) drawRoomDoor(ctx, ex, t, opts)

  // --- side walls ---
  fillRect(ctx, t.wallShade, 0, 0, walls.side, H)
  fillRect(ctx, t.wallShade, W - walls.side, 0, walls.side, H)
  fillRect(ctx, t.wainscotEdge, walls.side - 3, i.y, 3, i.h)
  fillRect(ctx, t.wainscotEdge, W - walls.side, i.y, 3, i.h)

  // --- south wall: the exterior window wall ---
  fillRect(ctx, t.wallShade, 0, H - walls.south, W, walls.south)
  if(scene.windowed){
    drawWindowBand(ctx, walls.side + 4, H - walls.south + 3, i.w - 8, walls.south - 6, t)
  } else {
    // basement / windowless: bare wall with service pipes
    fillRect(ctx, t.wall, walls.side, H - walls.south + 3, i.w, walls.south - 6)
    for(let px = walls.side + m(0.6); px < W - walls.side - m(0.4); px += m(1.1)){
      fillRect(ctx, t.pilasterEdge, px, H - walls.south + 5, 8, walls.south - 11)
    }
  }
  fillRect(ctx, t.baseboard, walls.side, H - walls.south - 4, i.w, 4)

  // --- teaching wall accent on the west side of a classroom ---
  if(scene.room.kind === 'ordinary-classroom' || scene.room.kind === 'empty-classroom'){
    fillRect(ctx, t.wainscot, walls.side, i.y, 5, i.h)
  }
  void basement

  // --- furniture: floor-standing first, back to front; anything hung on a
  // wall goes last so it always reads as being above the room. ---
  const sorted = [...scene.objects].sort((a, b) => {
    const wall = Number(isWallMounted(a)) - Number(isWallMounted(b))
    if(wall) return wall
    return (a.position.y + a.size.height) - (b.position.y + b.size.height)
  })
  for(const obj of sorted) drawProp(ctx, obj, t, opts)
}

function drawRoomCorridorWindows(ctx, scene, t){
  const i = scene.interior
  const y = 8
  const h = i.y - 18
  if(h < 12) return
  const doors = [...scene.exits].sort((a, b) => a.gx - b.gx)
  let x = i.x + 4
  const end = i.x + i.w - 4
  for(const d of doors){
    const gap = d.gx - 8 - x
    if(gap > m(0.8)) drawWindowBand(ctx, x, y, gap, h, t, { sill: false, inner: true })
    x = d.gx + d.gw + 8
  }
  if(end - x > m(0.8)) drawWindowBand(ctx, x, y, end - x, h, t, { sill: false, inner: true })
}

function drawRoomDoor(ctx, ex, t, opts){
  drawSlidingDoor(ctx, { ...ex, label: null }, t, opts, { plate: false })
  // Label sits on the door itself so it never collides with what is hung on
  // the wall just inside the room.
  const tw = 70
  fillRect(ctx, t.sign, ex.cx - tw / 2, ex.gy + ex.gh - 20, tw, 17)
  ctx.fillStyle = t.signText
  ctx.font = '11px "Hiragino Sans","Yu Gothic",sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('▲ 廊下へ', ex.cx, ex.gy + ex.gh - 11)
}

// ------------------------------------------------------------------ props
// Things that hang on a wall rather than stand on the floor. They must not get
// the ground contact shadow — with one, a clock reads as lying on the floor.
const WALL_ARTS = new Set(['clock', 'poster', 'board', 'map', 'portraits', 'screen', 'blackboard', 'whiteboard', 'curtain', 'lamp'])

function isWallMounted(obj){
  if(obj.mount) return obj.mount === 'wall'
  return WALL_ARTS.has(propArt(obj))
}

function propArt(obj){
  if(obj.art) return obj.art
  const key = (obj.id || '') + (obj.label || '')
  if(obj.type === 'clock') return 'clock'
  if(obj.type === 'computer') return 'pc'
  if(obj.type === 'document') return 'board'
  if(/piano|ピアノ/.test(key)) return 'piano'
  if(/bed|ベッド/.test(key)) return 'bed'
  if(/locker|ロッカー|靴箱/.test(key)) return 'lockers'
  if(/cabinet|戸棚|収納|保管庫/.test(key)) return 'cabinet'
  if(/棚|shelf|shelves|rack/.test(key)) return 'shelf'
  if(/blackboard|黒板/.test(key)) return 'blackboard'
  if(/whiteboard|ホワイトボード/.test(key)) return 'whiteboard'
  if(/screen|スクリーン/.test(key)) return 'screen'
  if(/sink|流し|洗面|シンク/.test(key)) return 'sink'
  if(/desk|机/.test(key)) return 'desk'
  if(/table|台|counter|カウンター/.test(key)) return 'table'
  if(/skeleton|骨格|statue|石膏|模型/.test(key)) return 'figure'
  if(/boiler|ボイラー|操作盤|設備|machine|機/.test(key)) return 'machine'
  if(/pipe|配管/.test(key)) return 'pipes'
  if(/lamp|灯/.test(key)) return 'lamp'
  if(/box|箱|備品/.test(key)) return 'boxes'
  return 'prop'
}

const ART = {
  blackboard(ctx, x, y, w, h, t){
    fillRect(ctx, '#20301f', x, y, w, h)
    fillRect(ctx, '#2c4029', x + 2, y + 2, w - 4, h - 4)
    ctx.strokeStyle = 'rgba(240,240,225,0.18)'; ctx.lineWidth = 1
    for(let i = 1; i < 5; i += 1){
      ctx.beginPath()
      ctx.moveTo(x + 3, y + (h / 5) * i); ctx.lineTo(x + w - 3, y + (h / 5) * i - 4); ctx.stroke()
    }
    void t
  },
  whiteboard(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    fillRect(ctx, '#f2f2ee', x + 2, y + 2, w - 4, h - 4)
    ctx.strokeStyle = 'rgba(80,110,150,0.35)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(x + 5, y + h * 0.4); ctx.lineTo(x + w - 6, y + h * 0.4); ctx.stroke()
  },
  screen(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    fillRect(ctx, '#e9e6dc', x + 2, y + 3, w - 4, h - 6)
  },
  // A school wall clock: dark rim, pale face, hour marks. Drawn with the
  // wall-mounted shadow so it reads as hung, not lying on the floor.
  clock(ctx, x, y, w, h, t, obj){
    const cx = x + w / 2
    const cy = y + h / 2
    const r = Math.min(w, h) / 2
    ctx.fillStyle = t.id === 'original' ? '#20262e' : '#3a2c22'
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = t.id === 'original' ? '#cdd6de' : '#f6f1e2'
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2); ctx.fill()
    // hour marks
    ctx.strokeStyle = t.id === 'original' ? '#5a6672' : '#8a7660'
    ctx.lineWidth = Math.max(1, r * 0.09)
    for(let i = 0; i < 12; i += 1){
      const a = (Math.PI * 2 * i) / 12
      const inner = i % 3 === 0 ? 0.52 : 0.64
      ctx.beginPath()
      ctx.moveTo(cx + Math.sin(a) * r * inner, cy - Math.cos(a) * r * inner)
      ctx.lineTo(cx + Math.sin(a) * r * 0.74, cy - Math.cos(a) * r * 0.74)
      ctx.stroke()
    }
    const reverse = obj.clockState === 'reverse' || obj.state === 'clock-reverse'
    ctx.strokeStyle = reverse ? '#b6635d' : (t.id === 'original' ? '#2b333c' : '#3a2c22')
    ctx.lineCap = 'round'
    ctx.lineWidth = Math.max(1.5, r * 0.12)
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + r * 0.42 * (reverse ? -1 : 1), cy - r * 0.26); ctx.stroke()
    ctx.lineWidth = Math.max(1, r * 0.09)
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - r * 0.6); ctx.stroke()
    ctx.lineCap = 'butt'
    ctx.fillStyle = reverse ? '#b6635d' : (t.id === 'original' ? '#2b333c' : '#3a2c22')
    ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, r * 0.1), 0, Math.PI * 2); ctx.fill()
  },
  poster(ctx, x, y, w, h, t){
    fillRect(ctx, t.paper, x, y, w, h)
    ctx.strokeStyle = t.signEdge; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)
    ctx.fillStyle = 'rgba(80,70,55,0.35)'
    for(let ly = y + 4; ly < y + h - 3; ly += 5) ctx.fillRect(x + 4, ly, w - 8, 2)
  },
  board(ctx, x, y, w, h, t){
    fillRect(ctx, t.boardEdge, x, y, w, h)
    fillRect(ctx, t.board, x + 2, y + 2, w - 4, h - 4)
    ctx.fillStyle = t.paper
    const pw = Math.max(9, Math.min(22, w / 5))
    const ph = Math.max(7, Math.min(26, h - 8))
    for(let px = x + 5; px < x + w - pw; px += pw + 4) ctx.fillRect(px, y + 4, pw, ph)
  },
  portraits(ctx, x, y, w, h, t){
    const n = Math.max(1, Math.round(w / m(1.1)))
    const cw = w / n
    for(let i = 0; i < n; i += 1){
      fillRect(ctx, t.doorDark, x + i * cw + 2, y, cw - 4, h)
      fillRect(ctx, t.paper, x + i * cw + 4, y + 2, cw - 8, h - 4)
    }
  },
  map(ctx, x, y, w, h, t){
    fillRect(ctx, t.doorDark, x, y, w, h)
    fillRect(ctx, '#e6e0c9', x + 2, y + 2, w - 4, h - 4)
    ctx.strokeStyle = 'rgba(90,110,90,0.55)'; ctx.lineWidth = 1
    ctx.strokeRect(x + 6, y + 5, w - 12, h - 10)
    ctx.beginPath(); ctx.moveTo(x + 6, y + h / 2); ctx.lineTo(x + w - 6, y + h / 2); ctx.stroke()
  },
  desk(ctx, x, y, w, h, t){
    fillRect(ctx, t.doorDark, x, y + h - 3, w, 3)
    fillRect(ctx, t.door, x, y, w, h - 2)
    fillRect(ctx, 'rgba(255,255,255,0.12)', x + 2, y + 2, w - 4, 2)
  },
  // 生徒机: the desk plus its chair tucked in behind. Students face the
  // blackboard on the west wall, so the chair sits on the east side.
  'school-desk'(ctx, x, y, w, h, t){
    const cw = m(0.34)
    fillRect(ctx, t.doorDark, x + w + 1, y + h * 0.14, cw, h * 0.72)
    fillRect(ctx, t.door, x + w + 2, y + h * 0.18, cw - 2, h * 0.64)
    fillRect(ctx, t.doorDark, x, y + h - 3, w, 3)
    fillRect(ctx, t.door, x, y, w, h - 2)
    fillRect(ctx, 'rgba(255,255,255,0.14)', x + 1, y + 1, w - 2, 2)
    // the hook on the side where the school bag hangs
    fillRect(ctx, t.doorHandle, x - 2, y + h * 0.5, 3, 4)
  },
  table(ctx, x, y, w, h, t){
    fillRect(ctx, t.doorDark, x, y, w, h)
    fillRect(ctx, t.door, x + 2, y + 2, w - 4, h - 5)
    ctx.strokeStyle = 'rgba(0,0,0,0.14)'; ctx.lineWidth = 1
    for(let gx = x + m(0.9); gx < x + w - 4; gx += m(0.9)){
      ctx.beginPath(); ctx.moveTo(gx, y + 3); ctx.lineTo(gx, y + h - 4); ctx.stroke()
    }
  },
  counter(ctx, x, y, w, h, t){
    fillRect(ctx, t.doorDark, x, y, w, h)
    fillRect(ctx, t.door, x + 2, y + 2, w - 4, h - 6)
    fillRect(ctx, t.wainscotEdge, x, y + h - 4, w, 4)
  },
  chair(ctx, x, y, w, h, t){
    fillRect(ctx, t.doorDark, x, y, w, h)
    fillRect(ctx, t.door, x + 1, y + 1, w - 2, h * 0.65)
  },
  cart(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    fillRect(ctx, t.pilaster, x + 2, y + 2, w - 4, h - 4)
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.beginPath(); ctx.arc(x + 4, y + h - 2, 2.5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + w - 4, y + h - 2, 2.5, 0, Math.PI * 2); ctx.fill()
  },
  lockers(ctx, x, y, w, h, t){
    fillRect(ctx, t.doorDark, x, y, w, h)
    const cols = Math.max(1, Math.round(w / m(0.32)))
    const rows = Math.max(1, Math.round(h / m(0.34)))
    const cw = (w - 4) / cols
    const ch = (h - 4) / rows
    for(let r = 0; r < rows; r += 1){
      for(let c = 0; c < cols; c += 1){
        ctx.fillStyle = (r + c) % 2 ? t.door : t.doorPanel
        ctx.fillRect(x + 2 + c * cw, y + 2 + r * ch, cw - 1, ch - 1)
        // name tag
        ctx.fillStyle = 'rgba(245,240,225,0.55)'
        ctx.fillRect(x + 3 + c * cw, y + 3 + r * ch, Math.max(2, cw * 0.42), Math.max(1.5, ch * 0.2))
      }
    }
  },
  cabinet(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    fillRect(ctx, t.pilaster, x + 2, y + 2, w - 4, h - 4)
    ctx.strokeStyle = t.pilasterEdge; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(x + w / 2, y + 2); ctx.lineTo(x + w / 2, y + h - 2); ctx.stroke()
    ctx.fillStyle = t.doorHandle
    ctx.fillRect(x + w / 2 - 4, y + h / 2 - 1, 3, 6)
    ctx.fillRect(x + w / 2 + 2, y + h / 2 - 1, 3, 6)
  },
  shelf(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    const rows = Math.max(2, Math.round(Math.max(w, h) / m(0.5)))
    ctx.fillStyle = t.pilaster
    if(h >= w){
      const ch = (h - 4) / rows
      for(let r = 0; r < rows; r += 1) ctx.fillRect(x + 2, y + 2 + r * ch, w - 4, ch - 2)
    } else {
      const cw = (w - 4) / rows
      for(let c = 0; c < rows; c += 1) ctx.fillRect(x + 2 + c * cw, y + 2, cw - 2, h - 4)
    }
  },
  'shelf-books'(ctx, x, y, w, h, t){
    fillRect(ctx, t.doorDark, x, y, w, h)
    // book spines packed along the long axis
    const along = h >= w
    const len = along ? h : w
    const thick = along ? w : h
    let p = 3
    let i = 0
    const spines = ['#8d5a48', '#4f6f8c', '#6d7f52', '#8b7440', '#7a5480', '#5c6b74']
    while(p < len - 4){
      const s = 3 + ((i * 7) % 5)
      ctx.fillStyle = spines[i % spines.length]
      if(along) ctx.fillRect(x + 2, y + p, thick - 4, s)
      else ctx.fillRect(x + p, y + 2, s, thick - 4)
      p += s + 1.5
      i += 1
    }
    ctx.strokeStyle = t.doorDark; ctx.lineWidth = 2
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2)
  },
  'shelf-files'(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    const along = h >= w
    const rows = Math.max(2, Math.round((along ? h : w) / m(0.42)))
    for(let r = 0; r < rows; r += 1){
      const rx = along ? x + 2 : x + 2 + r * ((w - 4) / rows)
      const ry = along ? y + 2 + r * ((h - 4) / rows) : y + 2
      const rw = along ? w - 4 : (w - 4) / rows - 1.5
      const rh = along ? (h - 4) / rows - 1.5 : h - 4
      fillRect(ctx, t.paper, rx, ry, rw, rh)
      ctx.fillStyle = 'rgba(90,80,60,0.4)'
      ctx.fillRect(rx + 1, ry + 1, Math.max(2, rw * 0.9), Math.max(1.5, rh * 0.22))
    }
  },
  'shelf-glass'(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    fillRect(ctx, 'rgba(190,215,225,0.42)', x + 2, y + 2, w - 4, h - 4)
    ctx.strokeStyle = t.pilasterEdge; ctx.lineWidth = 1
    const rows = Math.max(2, Math.round(h / m(0.55)))
    for(let r = 1; r < rows; r += 1){
      ctx.beginPath(); ctx.moveTo(x + 2, y + (h / rows) * r); ctx.lineTo(x + w - 2, y + (h / rows) * r); ctx.stroke()
    }
    void t
  },
  bed(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    fillRect(ctx, '#eef2f4', x + 2, y + 2, w - 4, h - 4)
    fillRect(ctx, '#cfdae0', x + 2, y + 2, Math.max(8, w * 0.24), h - 4)
    fillRect(ctx, '#b9c6ce', x + w * 0.3, y + 3, w * 0.66, h - 6)
  },
  curtain(ctx, x, y, w, h, t){
    ctx.fillStyle = t.id === 'original' ? '#7e8894' : '#cfd8dd'
    for(let px = x; px < x + w; px += 7){
      ctx.globalAlpha = ((px / 7) % 2) ? 0.95 : 0.7
      ctx.fillRect(px, y, 6, Math.max(4, h))
    }
    ctx.globalAlpha = 1
  },
  sink(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    fillRect(ctx, '#c9d5d8', x + 2, y + 2, w - 4, h - 4)
    ctx.strokeStyle = 'rgba(60,80,90,0.4)'; ctx.lineWidth = 1
    const n = Math.max(1, Math.round(w / m(0.6)))
    for(let i = 0; i < n; i += 1){
      const cx = x + (w / n) * (i + 0.5)
      ctx.beginPath(); ctx.ellipse(cx, y + h / 2, Math.min(w / n, h) * 0.28, h * 0.26, 0, 0, Math.PI * 2); ctx.stroke()
    }
  },
  stove(ctx, x, y, w, h, t){
    fillRect(ctx, '#4a4a4c', x, y, w, h)
    ctx.strokeStyle = '#8e8e90'; ctx.lineWidth = 1.5
    const n = Math.max(1, Math.round(w / m(0.45)))
    for(let i = 0; i < n; i += 1){
      const cx = x + (w / n) * (i + 0.5)
      ctx.beginPath(); ctx.arc(cx, y + h / 2, Math.min(w / n, h) * 0.3, 0, Math.PI * 2); ctx.stroke()
    }
    void t
  },
  fridge(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    fillRect(ctx, '#dfe3e4', x + 2, y + 2, w - 4, h - 4)
    ctx.strokeStyle = t.pilasterEdge; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(x + 2, y + h * 0.36); ctx.lineTo(x + w - 2, y + h * 0.36); ctx.stroke()
  },
  'lab-bench'(ctx, x, y, w, h, t){
    fillRect(ctx, t.doorDark, x, y, w, h)
    fillRect(ctx, '#3b3f42', x + 2, y + 2, w - 4, h - 5)
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 1
    ctx.strokeRect(x + 4, y + 4, w - 8, h - 9)
    void t
  },
  workbench(ctx, x, y, w, h, t){
    fillRect(ctx, t.doorDark, x, y, w, h)
    fillRect(ctx, t.door, x + 2, y + 2, w - 4, h - 5)
    ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 1
    for(let gx = x + m(0.5); gx < x + w - 3; gx += m(0.5)){
      ctx.beginPath(); ctx.moveTo(gx, y + 3); ctx.lineTo(gx, y + h - 4); ctx.stroke()
    }
  },
  pc(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    fillRect(ctx, t.pilaster, x + 2, y + 2, w - 4, h - 4)
    const mw = Math.min(m(0.42), w - 8)
    const mh = Math.min(m(0.3), h - 6)
    const n = Math.max(1, Math.floor((w - 6) / (mw + 5)))
    for(let i = 0; i < n; i += 1){
      const mx = x + 4 + i * (mw + 5)
      fillRect(ctx, '#20303f', mx, y + 3, mw, mh)
      fillRect(ctx, t.id === 'original' ? '#3b5670' : '#8fd0e8', mx + 2, y + 5, mw - 4, mh - 4)
    }
  },
  machine(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    fillRect(ctx, t.pilaster, x + 3, y + 3, w - 6, h - 6)
    ctx.fillStyle = '#c25b4d'; ctx.beginPath(); ctx.arc(x + w - 10, y + 10, 3.5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#e0c86a'; ctx.beginPath(); ctx.arc(x + w - 20, y + 10, 3.5, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 1
    ctx.strokeRect(x + 6, y + h * 0.45, w - 12, h * 0.42)
  },
  panel(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    fillRect(ctx, '#2f3740', x + 2, y + 2, w - 4, h - 4)
    const cols = Math.max(2, Math.round(w / 12))
    const rows = Math.max(2, Math.round(h / 14))
    for(let r = 0; r < rows; r += 1){
      for(let c = 0; c < cols; c += 1){
        ctx.fillStyle = (r * cols + c) % 5 === 0 ? '#d0a24a' : 'rgba(140,160,180,0.35)'
        ctx.fillRect(x + 5 + c * ((w - 10) / cols), y + 5 + r * ((h - 10) / rows), 4, 4)
      }
    }
  },
  pipes(ctx, x, y, w, h, t){
    const along = h >= w
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    if(along) ctx.fillRect(x + 2, y, Math.max(2, w * 0.24), h)
    else ctx.fillRect(x, y + 2, w, Math.max(2, h * 0.24))
    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    const step = m(1.0)
    if(along) for(let py = y + step; py < y + h; py += step) ctx.fillRect(x - 1, py, w + 2, 3)
    else for(let px = x + step; px < x + w; px += step) ctx.fillRect(px, y - 1, 3, h + 2)
  },
  piano(ctx, x, y, w, h, t){
    // grand piano: body curve + keyboard on the long side
    ctx.fillStyle = '#17171b'
    ctx.beginPath()
    ctx.moveTo(x, y + h * 0.18)
    ctx.lineTo(x + w * 0.62, y)
    ctx.quadraticCurveTo(x + w, y + h * 0.1, x + w, y + h * 0.55)
    ctx.quadraticCurveTo(x + w * 0.95, y + h, x + w * 0.5, y + h)
    ctx.lineTo(x, y + h * 0.82)
    ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#f2efe6'; ctx.fillRect(x + 2, y + h * 0.24, m(0.28), h * 0.54)
    ctx.fillStyle = '#17171b'
    for(let ky = y + h * 0.26; ky < y + h * 0.76; ky += 5) ctx.fillRect(x + 2, ky, m(0.17), 2)
    void t
  },
  podium(ctx, x, y, w, h, t){
    fillRect(ctx, t.doorDark, x, y, w, h)
    fillRect(ctx, t.door, x + 3, y + 3, w - 6, h - 6)
  },
  mic(ctx, x, y, w, h, t){
    ctx.fillStyle = t.pilasterEdge
    ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = t.pilaster
    ctx.fillRect(x + w / 2 - 1, y, 2, h)
  },
  figure(ctx, x, y, w, h, t){
    ctx.fillStyle = t.id === 'original' ? '#c7c2b4' : '#e9e4d6'
    roundRect(ctx, x + w * 0.22, y + h * 0.24, w * 0.56, h * 0.76, 4); ctx.fill()
    ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.2, Math.min(w, h) * 0.19, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    ctx.fillRect(x + w * 0.3, y + h * 0.5, w * 0.4, 2)
  },
  easel(ctx, x, y, w, h, t){
    ctx.strokeStyle = t.door; ctx.lineWidth = 3
    const n = Math.max(1, Math.round(w / m(0.6)))
    for(let i = 0; i < n; i += 1){
      const cx = x + (w / n) * (i + 0.5)
      ctx.beginPath()
      ctx.moveTo(cx - m(0.2), y + h); ctx.lineTo(cx, y); ctx.lineTo(cx + m(0.2), y + h)
      ctx.stroke()
      fillRect(ctx, t.paper, cx - m(0.2), y + h * 0.28, m(0.4), h * 0.36)
    }
  },
  boxes(ctx, x, y, w, h, t){
    fillRect(ctx, t.id === 'original' ? '#6f5c43' : '#b08a5a', x, y, w, h)
    ctx.strokeStyle = 'rgba(60,40,16,0.5)'; ctx.lineWidth = 2
    const n = Math.max(1, Math.round(w / m(0.8)))
    for(let i = 0; i < n; i += 1){
      const bx = x + (w / n) * i
      ctx.strokeRect(bx + 2, y + 2, w / n - 4, h - 4)
      ctx.beginPath(); ctx.moveTo(bx + w / n / 2, y + 2); ctx.lineTo(bx + w / n / 2, y + h - 2); ctx.stroke()
    }
    void t
  },
  stack(ctx, x, y, w, h, t){
    fillRect(ctx, t.doorDark, x, y, w, h)
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1
    for(let ly = y + 4; ly < y + h - 2; ly += 5){
      ctx.beginPath(); ctx.moveTo(x + 2, ly); ctx.lineTo(x + w - 2, ly); ctx.stroke()
    }
    fillRect(ctx, t.door, x + 3, y + 3, w - 6, 4)
  },
  bin(ctx, x, y, w, h, t){
    ctx.fillStyle = t.pilaster
    roundRect(ctx, x + 1, y + 2, w - 2, h - 2, 3); ctx.fill()
    fillRect(ctx, t.pilasterEdge, x, y, w, 3)
  },
  tools(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    ctx.strokeStyle = t.doorHandle; ctx.lineWidth = 2
    const cols = Math.max(2, Math.round(w / m(0.28)))
    for(let c = 0; c < cols; c += 1){
      const cx = x + (w / cols) * (c + 0.5)
      ctx.beginPath(); ctx.moveTo(cx, y + 3); ctx.lineTo(cx, y + h - 4); ctx.stroke()
    }
  },
  lamp(ctx, x, y, w, h, t){
    const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 1, x + w / 2, y + h / 2, Math.max(w, h))
    g.addColorStop(0, t.id === 'original' ? 'rgba(220,200,130,0.75)' : 'rgba(255,246,205,0.95)')
    g.addColorStop(1, 'rgba(255,240,190,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, Math.max(w, h), 0, Math.PI * 2); ctx.fill()
    fillRect(ctx, t.id === 'original' ? '#8a7c4a' : '#fff3c4', x, y, w, h)
  },
  ledger(ctx, x, y, w, h, t){
    fillRect(ctx, '#8a6a44', x, y, w, h)
    fillRect(ctx, t.paper, x + 2, y + 2, w - 5, h - 4)
    ctx.fillStyle = 'rgba(90,80,60,0.4)'
    for(let ly = y + 5; ly < y + h - 3; ly += 4) ctx.fillRect(x + 5, ly, w - 11, 1.5)
  },
  newspaper(ctx, x, y, w, h, t){
    fillRect(ctx, t.doorDark, x, y, w, h)
    for(let i = 0; i < 3; i += 1){
      fillRect(ctx, t.paper, x + 3 + i * 3, y + 3 + i * 2, w - 8, h - 10)
    }
    ctx.fillStyle = 'rgba(70,65,55,0.5)'
    for(let ly = y + 8; ly < y + h - 8; ly += 4) ctx.fillRect(x + 8, ly, w - 18, 1.5)
  },
  sofa(ctx, x, y, w, h, t){
    fillRect(ctx, t.id === 'original' ? '#3f4a53' : '#8d7f6c', x, y, w, h)
    ctx.fillStyle = t.id === 'original' ? '#4b5762' : '#a3927c'
    ctx.fillRect(x + 4, y + 4, w - 8, h * 0.42)
    ctx.fillRect(x + 4, y + h * 0.54, w - 8, h * 0.36)
  },
  booth(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    const n = Math.max(1, Math.round(h / m(0.9)))
    for(let i = 0; i < n; i += 1){
      fillRect(ctx, t.door, x + 3, y + 3 + i * (h / n), w - 6, h / n - 5)
    }
  },
  scale(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x + w * 0.3, y, w * 0.16, h)
    fillRect(ctx, t.pilaster, x, y + h * 0.72, w, h * 0.28)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1
    for(let ly = y + 4; ly < y + h * 0.7; ly += 5){
      ctx.beginPath(); ctx.moveTo(x + w * 0.3, ly); ctx.lineTo(x + w * 0.46, ly); ctx.stroke()
    }
  },
  umbrella(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    const n = Math.max(3, Math.round(w / 8))
    for(let i = 0; i < n; i += 1){
      ctx.fillStyle = t.flower[i % t.flower.length]
      ctx.fillRect(x + 3 + i * ((w - 6) / n), y + 2, Math.max(2, (w - 6) / n - 2), h - 4)
    }
  },
  mat(ctx, x, y, w, h, t){
    fillRect(ctx, t.id === 'original' ? '#2e3a33' : '#4a5a4a', x, y, w, h)
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1
    for(let px = x + 4; px < x + w; px += 6){
      ctx.beginPath(); ctx.moveTo(px, y + 2); ctx.lineTo(px, y + h - 2); ctx.stroke()
    }
  },
  step(ctx, x, y, w, h, t){
    fillRect(ctx, t.door, x, y, w, Math.max(3, h))
    fillRect(ctx, 'rgba(0,0,0,0.3)', x, y + Math.max(3, h), w, 3)
  },
  'glass-door'(ctx, x, y, w, h, t){
    fillRect(ctx, t.windowFrame, x, y, w, Math.max(6, h))
    fillRect(ctx, t.window, x + 3, y + 2, w - 6, Math.max(2, h - 4))
    ctx.fillStyle = t.windowFrame
    ctx.fillRect(x + w / 2 - 1.5, y, 3, Math.max(6, h))
  },
  phone(ctx, x, y, w, h, t){
    fillRect(ctx, t.pilasterEdge, x, y, w, h)
    fillRect(ctx, '#2c3138', x + 2, y + 2, w - 4, h * 0.45)
    void t
  },
  prop(ctx, x, y, w, h, t){
    fillRect(ctx, t.doorDark, x, y, w, h)
    fillRect(ctx, t.door, x + 2, y + 2, w - 4, h - 4)
  }
}

function drawProp(ctx, obj, t, opts){
  const { x, y } = obj.position
  const w = obj.size.width
  const h = obj.size.height
  const near = opts.highlight === obj.id
  const art = propArt(obj)
  const mounted = isWallMounted(obj)
  ctx.save()

  if(mounted){
    // Hung on the wall: the shadow falls away from it, not under it.
    ctx.save()
    ctx.shadowColor = t.id === 'original' ? 'rgba(0,0,0,0.55)' : 'rgba(60,42,26,0.42)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetX = 3
    ctx.shadowOffsetY = 4
    ;(ART[art] || ART.prop)(ctx, x, y, w, h, t, obj)
    ctx.restore()
  } else {
    // Contact shadow only for things that stand on the floor.
    if(obj.collision){
      ctx.fillStyle = t.shadow
      roundRect(ctx, x + 2, y + h - 3, w, 6, 3); ctx.fill()
    }
    ;(ART[art] || ART.prop)(ctx, x, y, w, h, t, obj)
  }

  // Only badge what the player can genuinely examine. `examinable` comes from
  // the same list the interaction check uses, so a "?" can never appear on
  // something that refuses to respond.
  const examinable = opts.examinable ? opts.examinable.has(obj.id) : obj.interactable
  if(examinable){
    if(near) drawHighlightRing(ctx, x - 3, y - 3, w + 6, h + 6, t)
    const bx = x + w - 5
    const by = y + 5
    ctx.fillStyle = t.accent
    ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = t.accentText
    ctx.font = 'bold 9px ui-monospace,monospace'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('?', bx, by + 0.5)
  }
  ctx.restore()
}

// ------------------------------------------------------------------ player
export function drawPlayer(ctx, player, t){
  const { x, y, dir, moving, animTime } = player
  const bob = moving ? Math.sin(animTime * 11) * 1.6 : 0
  ctx.fillStyle = t.shadow
  ctx.beginPath(); ctx.ellipse(x, y + 2, 12, 5, 0, 0, Math.PI * 2); ctx.fill()

  const bx = x
  const by = y - 26 + bob
  const legSwing = moving ? Math.sin(animTime * 11) * 3 : 0
  ctx.fillStyle = t.playerPants
  ctx.fillRect(bx - 6 + legSwing, by + 18, 5, 9)
  ctx.fillRect(bx + 1 - legSwing, by + 18, 5, 9)
  ctx.fillStyle = t.playerShirt
  roundRect(ctx, bx - 8, by + 6, 16, 15, 4); ctx.fill()
  ctx.fillRect(bx - 10, by + 7, 3, 10)
  ctx.fillRect(bx + 7, by + 7, 3, 10)
  ctx.fillStyle = t.playerSkin
  ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = t.playerHair
  if(dir === 'up'){
    ctx.beginPath(); ctx.arc(bx, by, 8.5, 0, Math.PI * 2); ctx.fill()
  } else if(dir === 'down'){
    ctx.beginPath(); ctx.arc(bx, by - 2, 8, Math.PI, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#2a2016'
    ctx.fillRect(bx - 4, by + 1, 2, 2); ctx.fillRect(bx + 2, by + 1, 2, 2)
  } else {
    ctx.beginPath(); ctx.arc(bx, by - 1, 8.2, Math.PI * 0.9, Math.PI * 2.1); ctx.fill()
    ctx.fillStyle = '#2a2016'
    ctx.fillRect(dir === 'left' ? bx - 4 : bx + 2, by + 1, 2, 2)
  }
}

// ------------------------------------------------------------------ entry
export function renderScene(ctx, scene, t, opts = {}){
  if(!scene) return
  ctx.fillStyle = t.id === 'original' ? '#080e16' : '#c7a06d'
  ctx.fillRect(-80, -80, scene.width + 160, scene.height + 160)

  if(scene.kind === 'corridor') drawCorridor(ctx, scene, t, { ...opts, floor: scene.floor })
  else drawRoom(ctx, scene, t, opts)

  if(opts.player) drawPlayer(ctx, opts.player, t)

  if(t.vignette && t.vignette !== 'rgba(0,0,0,0)'){
    const g = ctx.createRadialGradient(
      scene.width / 2, scene.height / 2, Math.min(scene.width, scene.height) * 0.35,
      scene.width / 2, scene.height / 2, Math.max(scene.width, scene.height) * 0.62
    )
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, t.vignette)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, scene.width, scene.height)
  }
}

export { PX_PER_M }
