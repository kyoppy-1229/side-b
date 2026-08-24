// Original artwork for the general virtual web, generated as SVG.
//
// No external images are used anywhere in the virtual web: every thumbnail,
// poster, product shot and site logo is drawn here from a seeded random number
// generator, so the same page always renders the same picture while different
// pages differ. Nothing is a grey placeholder box.
//
// Art "kinds" are named after what they depict (station, classroom-old, poster…)
// and map onto a handful of scene builders with their own palettes.

import { GENERATED_ART_KEYS } from './generated.js'

function hashSeed(value){
  let hash = 2166136261
  const text = String(value ?? 'seed')
  for(let index = 0; index < text.length; index += 1){
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createRandom(seed){
  let state = hashSeed(seed) || 1
  return function random(){
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function pick(random, list){
  return list[Math.floor(random() * list.length) % list.length]
}

function range(random, min, max){
  return min + random() * (max - min)
}

const PALETTES = Object.freeze({
  sky: ['#bcdcf3', '#cfe6f6', '#a9d0ee'],
  duskSky: ['#f6c99a', '#f2a97e', '#e08c76'],
  nightSky: ['#152040', '#1d2b52', '#101a34'],
  green: ['#7fb069', '#679a55', '#8fbd76'],
  water: ['#6ea9c9', '#5c96b8', '#83b8d3'],
  concrete: ['#c9ccd2', '#b6bac2', '#dadde2'],
  brick: ['#c98d78', '#b57a68', '#d9a08a'],
  wood: ['#c8a172', '#b98f61', '#d9b98d'],
  interior: ['#f0ebe1', '#e6dfd2', '#f6f2e9'],
  tech: ['#3f6fd8', '#5a8ae8', '#2c53a8', '#7fa6f0'],
  warm: ['#e0a253', '#d98a45', '#efc077'],
  neutral: ['#8e99a8', '#a5aeba', '#77828f']
})

function gradient(id, from, to, vertical = true){
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">`
    + `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>`
}

// --- scene builders -------------------------------------------------------

function outdoorScene(random, options){
  const width = 400
  const height = 260
  const horizon = options.horizon ?? 168
  const skyPalette = options.night ? PALETTES.nightSky : (options.dusk ? PALETTES.duskSky : PALETTES.sky)
  const skyTop = pick(random, skyPalette)
  const skyBottom = options.night ? '#2b3a63' : (options.dusk ? '#fbe0c0' : '#eaf4fb')
  const groundColor = options.groundColor || pick(random, PALETTES.green)
  let body = ''

  // sun / moon
  if(!options.noSun){
    const cx = range(random, 60, 340)
    const cy = range(random, 34, 96)
    const r = options.night ? range(random, 12, 18) : range(random, 16, 26)
    body += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${options.night ? '#f4f1dd' : '#fff6d8'}" opacity="${options.night ? 0.9 : 0.85}"/>`
  }

  // clouds
  const clouds = Math.round(range(random, 1, 4))
  for(let index = 0; index < clouds; index += 1){
    const cx = range(random, 20, 380)
    const cy = range(random, 30, 120)
    const scale = range(random, 0.6, 1.4)
    body += `<g opacity="${options.night ? 0.25 : 0.7}" fill="#ffffff" transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${scale.toFixed(2)})">`
      + '<ellipse cx="0" cy="0" rx="26" ry="10"/><ellipse cx="16" cy="-5" rx="18" ry="9"/><ellipse cx="-16" cy="-3" rx="15" ry="8"/></g>'
  }

  // distant hills
  if(options.hills){
    for(let index = 0; index < 3; index += 1){
      const x = range(random, -60, 340)
      const w = range(random, 150, 280)
      const h = range(random, 30, 62)
      body += `<path d="M${x.toFixed(0)} ${horizon} q ${(w / 2).toFixed(0)} ${-h.toFixed(0)} ${w.toFixed(0)} 0 Z" fill="${pick(random, PALETTES.green)}" opacity="${(0.35 + index * 0.2).toFixed(2)}"/>`
    }
  }

  // buildings
  if(options.buildings){
    const count = Math.round(range(random, 5, 11))
    for(let index = 0; index < count; index += 1){
      const w = range(random, 26, 62)
      const h = range(random, 40, 130)
      const x = range(random, -10, 400)
      const color = pick(random, options.night ? ['#26365e', '#1c2a4c', '#31446f'] : PALETTES.concrete)
      body += `<rect x="${x.toFixed(0)}" y="${(horizon - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${color}"/>`
      // windows
      const rows = Math.floor(h / 16)
      const cols = Math.max(1, Math.floor(w / 14))
      for(let row = 0; row < rows; row += 1){
        for(let col = 0; col < cols; col += 1){
          if(random() > (options.night ? 0.45 : 0.6)) continue
          body += `<rect x="${(x + 5 + col * 13).toFixed(0)}" y="${(horizon - h + 8 + row * 15).toFixed(0)}" width="6" height="8" fill="${options.night ? '#ffe9a8' : '#eef4fa'}" opacity="0.85"/>`
        }
      }
    }
  }

  // ground
  body += `<rect x="0" y="${horizon}" width="${width}" height="${height - horizon}" fill="${groundColor}"/>`

  if(options.water){
    body += `<rect x="0" y="${horizon}" width="${width}" height="${height - horizon}" fill="${pick(random, PALETTES.water)}"/>`
    for(let index = 0; index < 9; index += 1){
      const y = range(random, horizon + 8, height - 6)
      const x = range(random, 10, 300)
      body += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${range(random, 20, 80).toFixed(0)}" height="2" fill="#ffffff" opacity="0.35"/>`
    }
  }

  if(options.road){
    body += `<path d="M150 ${height} L182 ${horizon} L222 ${horizon} L268 ${height} Z" fill="#8e939c"/>`
    for(let index = 0; index < 5; index += 1){
      const t = index / 5
      const y = height - t * (height - horizon)
      body += `<rect x="${(203 - 3 + t * 5).toFixed(0)}" y="${(y - 12).toFixed(0)}" width="5" height="${(12 - t * 6).toFixed(0)}" fill="#f5f2e6" opacity="0.9"/>`
    }
  }

  if(options.trees){
    const count = Math.round(range(random, 3, 8))
    for(let index = 0; index < count; index += 1){
      const x = range(random, 12, 388)
      const y = range(random, horizon + 4, height - 12)
      const scale = range(random, 0.7, 1.5)
      body += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${scale.toFixed(2)})">`
        + `<rect x="-2" y="-14" width="4" height="16" fill="#8a6a49"/>`
        + `<circle cx="0" cy="-20" r="12" fill="${pick(random, ['#4f8f4c', '#5fa259', '#3f7a44'])}"/></g>`
    }
  }

  if(options.tracks){
    body += `<rect x="0" y="${horizon + 14}" width="${width}" height="26" fill="#6f7580"/>`
    for(let index = 0; index < 22; index += 1){
      body += `<rect x="${index * 19}" y="${horizon + 16}" width="8" height="22" fill="#5a5f68"/>`
    }
    body += `<rect x="0" y="${horizon + 20}" width="${width}" height="3" fill="#c8ccd3"/>`
    body += `<rect x="0" y="${horizon + 32}" width="${width}" height="3" fill="#c8ccd3"/>`
  }

  if(options.fireworks){
    for(let index = 0; index < 4; index += 1){
      const cx = range(random, 60, 340)
      const cy = range(random, 30, 120)
      const spokes = 14
      const color = pick(random, ['#ffd66e', '#ff8fa3', '#8fd7ff', '#c5a6ff'])
      let rays = ''
      for(let spoke = 0; spoke < spokes; spoke += 1){
        const angle = (spoke / spokes) * Math.PI * 2
        const r = range(random, 16, 34)
        rays += `<line x1="0" y1="0" x2="${(Math.cos(angle) * r).toFixed(1)}" y2="${(Math.sin(angle) * r).toFixed(1)}" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>`
      }
      body += `<g transform="translate(${cx.toFixed(0)} ${cy.toFixed(0)})" opacity="0.9">${rays}</g>`
    }
  }

  if(options.arcade){
    body += `<rect x="60" y="${horizon - 96}" width="280" height="96" fill="#e7e2d6" opacity="0.5"/>`
    body += `<path d="M52 ${horizon - 96} L348 ${horizon - 96} L330 ${horizon - 118} L70 ${horizon - 118} Z" fill="#cfd6de"/>`
    for(let index = 0; index < 6; index += 1){
      const x = 70 + index * 46
      body += `<rect x="${x}" y="${horizon - 60}" width="36" height="60" fill="${pick(random, PALETTES.warm)}" opacity="0.8"/>`
      body += `<rect x="${x}" y="${horizon - 64}" width="36" height="8" fill="#8f5f4c"/>`
    }
  }

  return {
    width,
    height,
    defs: gradient('sky', skyTop, skyBottom),
    body: `<rect width="${width}" height="${height}" fill="url(#sky)"/>${body}`
  }
}

function interiorScene(random, options){
  const width = 400
  const height = 260
  const wall = options.wallColor || pick(random, PALETTES.interior)
  const floor = options.floorColor || pick(random, PALETTES.wood)
  let body = `<rect width="${width}" height="${height}" fill="${wall}"/>`
  body += `<path d="M0 168 L400 168 L400 260 L0 260 Z" fill="${floor}"/>`
  body += `<path d="M0 168 L400 168" stroke="#00000022" stroke-width="2"/>`

  // windows on the wall
  const windows = Math.round(range(random, 1, 4))
  for(let index = 0; index < windows; index += 1){
    const x = 30 + index * range(random, 90, 130)
    body += `<rect x="${x.toFixed(0)}" y="42" width="86" height="66" fill="#d7ecf7" stroke="#b9c3c9" stroke-width="3"/>`
    body += `<line x1="${(x + 43).toFixed(0)}" y1="42" x2="${(x + 43).toFixed(0)}" y2="108" stroke="#b9c3c9" stroke-width="3"/>`
  }

  if(options.board){
    body += `<rect x="112" y="52" width="176" height="74" rx="3" fill="#3d5a4c" stroke="#8f6a45" stroke-width="5"/>`
    for(let index = 0; index < 4; index += 1){
      body += `<rect x="${126 + (index % 2) * 74}" y="${68 + Math.floor(index / 2) * 20}" width="${range(random, 30, 64).toFixed(0)}" height="3" fill="#e8efe8" opacity="0.6"/>`
    }
  }

  if(options.desks){
    const rows = options.deskRows || 3
    for(let row = 0; row < rows; row += 1){
      const scale = 0.7 + row * 0.16
      const y = 176 + row * 26
      const count = 4
      for(let col = 0; col < count; col += 1){
        const x = 40 + col * (78 * scale) + row * 6
        body += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${scale.toFixed(2)})">`
          + `<rect x="0" y="0" width="58" height="7" rx="2" fill="#d9c39c"/>`
          + `<rect x="4" y="7" width="4" height="20" fill="#9aa1ab"/>`
          + `<rect x="50" y="7" width="4" height="20" fill="#9aa1ab"/>`
        if(options.monitors){
          body += `<rect x="12" y="-22" width="34" height="22" rx="2" fill="#2c3b52"/><rect x="15" y="-19" width="28" height="16" fill="${pick(random, ['#5f8fd0', '#7fa9dd', '#3f6ea8'])}"/><rect x="24" y="0" width="10" height="4" fill="#8c94a1"/>`
        }
        body += '</g>'
      }
    }
  }

  if(options.shelves){
    for(let index = 0; index < 3; index += 1){
      const x = 26 + index * 126
      body += `<rect x="${x}" y="96" width="108" height="72" fill="#b98f61"/>`
      for(let row = 0; row < 3; row += 1){
        body += `<rect x="${x + 4}" y="${100 + row * 24}" width="100" height="18" fill="#e9e1d2"/>`
        for(let book = 0; book < 9; book += 1){
          body += `<rect x="${x + 6 + book * 11}" y="${101 + row * 24}" width="9" height="16" fill="${pick(random, ['#a6435a', '#3f6ea8', '#4f8f4c', '#d0913f', '#6b5aa6'])}"/>`
        }
      }
    }
  }

  if(options.counter){
    body += `<rect x="60" y="132" width="280" height="36" fill="#c3a37a"/><rect x="60" y="126" width="280" height="8" fill="#8f6a45"/>`
    body += `<rect x="150" y="96" width="100" height="30" rx="4" fill="#f3efe4" stroke="#c8c0ae" stroke-width="2"/>`
  }

  if(options.tray){
    body += `<g transform="translate(120 178)"><rect x="0" y="0" width="160" height="70" rx="8" fill="#d8dde3"/>`
      + `<circle cx="42" cy="26" r="20" fill="#f6f3e6"/><circle cx="42" cy="26" r="13" fill="#e7dfc6"/>`
      + `<circle cx="108" cy="24" r="18" fill="#f2e6d2"/><circle cx="108" cy="24" r="11" fill="#cf9b6a"/>`
      + `<rect x="20" y="48" width="120" height="14" rx="4" fill="#eef1f4"/></g>`
  }

  return { width, height, defs: '', body }
}

function abstractScene(random, options){
  const width = 400
  const height = 260
  const base = options.palette || PALETTES.tech
  const from = pick(random, base)
  const to = pick(random, base)
  let body = `<rect width="${width}" height="${height}" fill="url(#bg)"/>`

  if(options.grid){
    for(let x = 0; x <= width; x += 20){
      body += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#ffffff" stroke-width="0.6" opacity="0.18"/>`
    }
    for(let y = 0; y <= height; y += 20){
      body += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#ffffff" stroke-width="0.6" opacity="0.18"/>`
    }
  }

  const shapes = Math.round(range(random, 4, 9))
  for(let index = 0; index < shapes; index += 1){
    const kind = pick(random, ['circle', 'rect', 'ring', 'line'])
    const cx = range(random, 30, 370)
    const cy = range(random, 30, 230)
    const size = range(random, 18, 74)
    const opacity = range(random, 0.2, 0.65).toFixed(2)
    const color = pick(random, ['#ffffff', ...base])
    if(kind === 'circle') body += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(size / 2).toFixed(0)}" fill="${color}" opacity="${opacity}"/>`
    else if(kind === 'rect') body += `<rect x="${cx.toFixed(0)}" y="${cy.toFixed(0)}" width="${size.toFixed(0)}" height="${(size * range(random, 0.4, 1.2)).toFixed(0)}" rx="6" fill="${color}" opacity="${opacity}"/>`
    else if(kind === 'ring') body += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(size / 2).toFixed(0)}" fill="none" stroke="${color}" stroke-width="3" opacity="${opacity}"/>`
    else body += `<line x1="${cx.toFixed(0)}" y1="${cy.toFixed(0)}" x2="${(cx + size).toFixed(0)}" y2="${(cy + range(random, -40, 40)).toFixed(0)}" stroke="${color}" stroke-width="2.4" opacity="${opacity}"/>`
  }

  if(options.nodes){
    const points = []
    for(let index = 0; index < 7; index += 1) points.push([range(random, 40, 360), range(random, 40, 220)])
    for(let index = 0; index < points.length - 1; index += 1){
      body += `<line x1="${points[index][0].toFixed(0)}" y1="${points[index][1].toFixed(0)}" x2="${points[index + 1][0].toFixed(0)}" y2="${points[index + 1][1].toFixed(0)}" stroke="#ffffff" stroke-width="1.4" opacity="0.5"/>`
    }
    for(const [x, y] of points){
      body += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="5" fill="#ffffff" opacity="0.85"/>`
    }
  }

  return { width, height, defs: gradient('bg', from, to, false), body }
}

function posterScene(random, options){
  const width = 300
  const height = 420
  const palettes = [
    ['#1b2a4a', '#4b6ea8'],
    ['#3c1f2e', '#a8556a'],
    ['#132a24', '#3f8f74'],
    ['#2b2333', '#7a5fa8'],
    ['#3a2a16', '#c08a3e']
  ]
  const [from, to] = pick(random, palettes)
  let body = `<rect width="${width}" height="${height}" fill="url(#poster)"/>`

  const style = pick(random, ['sun', 'figure', 'window', 'road'])
  if(style === 'sun'){
    body += `<circle cx="150" cy="150" r="72" fill="#ffe9b0" opacity="0.9"/>`
    body += `<rect x="0" y="222" width="${width}" height="${height - 222}" fill="#0d1424" opacity="0.75"/>`
    for(let index = 0; index < 6; index += 1){
      body += `<rect x="${(index * 52).toFixed(0)}" y="${range(random, 200, 240).toFixed(0)}" width="${range(random, 26, 46).toFixed(0)}" height="${range(random, 60, 140).toFixed(0)}" fill="#070c17" opacity="0.85"/>`
    }
  }else if(style === 'figure'){
    body += `<circle cx="150" cy="132" r="86" fill="#ffffff" opacity="0.1"/>`
    body += `<path d="M150 168 c-30 0 -46 26 -50 78 h100 c-4 -52 -20 -78 -50 -78 Z" fill="#0c1120" opacity="0.85"/>`
    body += `<circle cx="150" cy="140" r="28" fill="#0c1120" opacity="0.85"/>`
    body += `<rect x="0" y="300" width="${width}" height="${height - 300}" fill="#060a14" opacity="0.7"/>`
  }else if(style === 'window'){
    body += `<rect x="52" y="70" width="196" height="200" rx="6" fill="#f2ead6" opacity="0.18" stroke="#f2ead6" stroke-width="3"/>`
    body += `<line x1="150" y1="70" x2="150" y2="270" stroke="#f2ead6" stroke-width="3" opacity="0.5"/>`
    body += `<line x1="52" y1="170" x2="248" y2="170" stroke="#f2ead6" stroke-width="3" opacity="0.5"/>`
  }else{
    body += `<path d="M110 420 L140 180 L170 180 L200 420 Z" fill="#f0e6cd" opacity="0.35"/>`
    body += `<circle cx="155" cy="132" r="44" fill="#ffe9b0" opacity="0.8"/>`
  }

  body += `<rect x="0" y="${height - 92}" width="${width}" height="92" fill="#00000066"/>`
  for(let index = 0; index < 3; index += 1){
    body += `<rect x="24" y="${height - 74 + index * 18}" width="${range(random, 90, 240).toFixed(0)}" height="${index === 0 ? 12 : 5}" rx="2" fill="#ffffff" opacity="${index === 0 ? 0.9 : 0.45}"/>`
  }

  return { width, height, defs: gradient('poster', from, to), body }
}

function jacketScene(random){
  const size = 320
  const palettes = [
    ['#16324f', '#f0efe7', '#e2703a'],
    ['#2b2b3c', '#e8e3d9', '#8ac4c1'],
    ['#3f2a3d', '#f3e6d8', '#d4a24c'],
    ['#123c34', '#eef3ea', '#7fbf7a'],
    ['#40252a', '#f6ece2', '#c85f5f']
  ]
  const [bg, light, accent] = pick(random, palettes)
  let body = `<rect width="${size}" height="${size}" fill="${bg}"/>`
  const style = Math.floor(range(random, 0, 4))

  if(style === 0){
    body += `<circle cx="160" cy="150" r="96" fill="none" stroke="${accent}" stroke-width="10"/>`
    body += `<circle cx="160" cy="150" r="42" fill="${light}"/>`
    body += `<circle cx="160" cy="150" r="10" fill="${bg}"/>`
  }else if(style === 1){
    for(let index = 0; index < 7; index += 1){
      body += `<rect x="${28 + index * 38}" y="${range(random, 60, 190).toFixed(0)}" width="22" height="${range(random, 50, 170).toFixed(0)}" fill="${index % 2 ? accent : light}" opacity="0.9"/>`
    }
  }else if(style === 2){
    let path = 'M0 190'
    for(let x = 0; x <= size; x += 32) path += ` Q ${x + 16} ${range(random, 130, 240).toFixed(0)} ${x + 32} 190`
    body += `<path d="${path} L${size} ${size} L0 ${size} Z" fill="${accent}" opacity="0.85"/>`
    body += `<circle cx="${range(random, 90, 230).toFixed(0)}" cy="96" r="36" fill="${light}"/>`
  }else{
    body += `<rect x="46" y="46" width="228" height="228" fill="none" stroke="${light}" stroke-width="4"/>`
    body += `<path d="M46 274 L274 46" stroke="${accent}" stroke-width="14"/>`
    body += `<circle cx="110" cy="110" r="26" fill="${accent}"/>`
  }

  body += `<rect x="28" y="262" width="${range(random, 80, 180).toFixed(0)}" height="8" fill="${light}" opacity="0.85"/>`
  return { width: size, height: size, defs: '', body }
}

function productScene(random, options){
  const width = 340
  const height = 260
  const shell = pick(random, ['#8f98a4', '#5f6a78', '#c9ced6', '#3f4652'])
  const accent = pick(random, PALETTES.tech)
  let body = `<rect width="${width}" height="${height}" fill="#f4f6f9"/>`
  body += `<ellipse cx="170" cy="228" rx="118" ry="14" fill="#00000012"/>`
  const style = options.product || pick(random, ['laptop', 'monitor', 'mouse', 'keyboard', 'ssd', 'bag'])

  if(style === 'laptop'){
    body += `<path d="M92 74 h156 a6 6 0 0 1 6 6 v96 h-168 v-96 a6 6 0 0 1 6 -6 Z" fill="${shell}"/>`
    body += `<rect x="100" y="82" width="140" height="86" fill="#1d2635"/>`
    body += `<rect x="108" y="90" width="124" height="70" fill="${accent}" opacity="0.85"/>`
    body += `<path d="M64 176 h212 l14 24 h-240 Z" fill="${shell}"/>`
    body += `<rect x="146" y="184" width="48" height="5" rx="2" fill="#00000033"/>`
  }else if(style === 'monitor'){
    body += `<rect x="70" y="48" width="200" height="126" rx="6" fill="${shell}"/>`
    body += `<rect x="78" y="56" width="184" height="110" fill="#101827"/>`
    body += `<rect x="86" y="64" width="168" height="94" fill="${accent}" opacity="0.8"/>`
    body += `<rect x="158" y="174" width="24" height="34" fill="${shell}"/>`
    body += `<rect x="120" y="206" width="100" height="10" rx="5" fill="${shell}"/>`
  }else if(style === 'mouse'){
    body += `<path d="M170 66 c40 0 62 34 62 78 c0 40 -26 62 -62 62 c-36 0 -62 -22 -62 -62 c0 -44 22 -78 62 -78 Z" fill="${shell}"/>`
    body += `<path d="M170 66 c-20 0 -34 10 -44 26 h88 c-10 -16 -24 -26 -44 -26 Z" fill="#ffffff" opacity="0.25"/>`
    body += `<rect x="166" y="80" width="8" height="30" rx="4" fill="${accent}"/>`
  }else if(style === 'keyboard'){
    body += `<rect x="46" y="96" width="248" height="90" rx="8" fill="${shell}"/>`
    for(let row = 0; row < 4; row += 1){
      for(let col = 0; col < 13; col += 1){
        body += `<rect x="${56 + col * 18}" y="${106 + row * 20}" width="14" height="15" rx="3" fill="#f1f3f6" opacity="0.92"/>`
      }
    }
    body += `<rect x="120" y="166" width="110" height="14" rx="3" fill="#f1f3f6"/>`
  }else if(style === 'ssd'){
    body += `<rect x="96" y="86" width="148" height="102" rx="10" fill="${shell}"/>`
    body += `<rect x="112" y="104" width="116" height="34" rx="4" fill="#151d2b"/>`
    body += `<rect x="112" y="148" width="60" height="10" rx="3" fill="${accent}"/>`
    body += `<circle cx="216" cy="160" r="7" fill="#7dd2a0"/>`
  }else{
    body += `<path d="M96 96 h148 l14 96 h-176 Z" fill="${shell}"/>`
    body += `<path d="M132 96 c0 -24 12 -34 38 -34 c26 0 38 10 38 34" fill="none" stroke="${shell}" stroke-width="10"/>`
    body += `<rect x="120" y="130" width="100" height="26" rx="4" fill="${accent}" opacity="0.85"/>`
  }

  return { width, height, defs: '', body }
}

function diagramScene(random){
  const width = 400
  const height = 240
  let body = `<rect width="${width}" height="${height}" fill="#f7f9fc"/>`
  const boxes = [
    { x: 26, y: 44, w: 96, h: 52 },
    { x: 152, y: 44, w: 96, h: 52 },
    { x: 278, y: 44, w: 96, h: 52 },
    { x: 90, y: 148, w: 96, h: 52 },
    { x: 214, y: 148, w: 96, h: 52 }
  ]
  const accent = pick(random, PALETTES.tech)
  for(const [index, box] of boxes.entries()){
    body += `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="8" fill="#ffffff" stroke="${index % 2 ? accent : '#9aa6b8'}" stroke-width="2"/>`
    body += `<rect x="${box.x + 12}" y="${box.y + 16}" width="${box.w - 40}" height="6" rx="3" fill="${accent}" opacity="0.7"/>`
    body += `<rect x="${box.x + 12}" y="${box.y + 30}" width="${box.w - 24}" height="5" rx="2.5" fill="#c7cfdc"/>`
  }
  body += `<path d="M122 70 h30" stroke="#9aa6b8" stroke-width="2" marker-end="url(#arrow)"/>`
  body += `<path d="M248 70 h30" stroke="#9aa6b8" stroke-width="2" marker-end="url(#arrow)"/>`
  body += `<path d="M74 96 v34 h64" stroke="${accent}" stroke-width="2" fill="none" marker-end="url(#arrow)"/>`
  body += `<path d="M326 96 v34 h-64" stroke="${accent}" stroke-width="2" fill="none" marker-end="url(#arrow)"/>`
  const defs = '<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#7d8ba0"/></marker>'
  return { width, height, defs, body }
}

function mapScene(random, options){
  const width = 400
  const height = 260
  let body = `<rect width="${width}" height="${height}" fill="#eef3ea"/>`
  // blocks
  for(let x = 0; x < 400; x += 74){
    for(let y = 0; y < 260; y += 62){
      body += `<rect x="${x + 8}" y="${y + 8}" width="58" height="46" rx="3" fill="${pick(random, ['#dfe6da', '#e6e9df', '#d9e2d6'])}"/>`
    }
  }
  // roads
  for(let x = 66; x < 400; x += 74) body += `<rect x="${x}" y="0" width="12" height="${height}" fill="#ffffff"/>`
  for(let y = 54; y < 260; y += 62) body += `<rect x="0" y="${y}" width="${width}" height="12" fill="#ffffff"/>`
  // water or rail
  if(options.water) body += `<path d="M0 210 q 100 -30 200 0 q 100 30 200 0 L400 260 L0 260 Z" fill="#9fc6dd"/>`
  if(options.rail){
    body += `<rect x="0" y="128" width="${width}" height="10" fill="#b9bfc8"/>`
    for(let index = 0; index < 40; index += 1) body += `<rect x="${index * 10}" y="128" width="4" height="10" fill="#8d949e"/>`
  }
  // pin
  const px = range(random, 90, 310)
  const py = range(random, 80, 180)
  body += `<g transform="translate(${px.toFixed(0)} ${py.toFixed(0)})"><path d="M0 0 c-13 -18 -20 -26 -20 -38 a20 20 0 1 1 40 0 c0 12 -7 20 -20 38 Z" fill="#d9534f"/><circle cx="0" cy="-38" r="7" fill="#ffffff"/></g>`
  return { width, height, defs: '', body }
}

function weatherScene(random, options){
  const width = 400
  const height = 200
  const condition = options.condition || pick(random, ['sunny', 'cloudy', 'rain'])
  const from = condition === 'rain' ? '#8fa3b8' : (condition === 'cloudy' ? '#a8bccd' : '#7fb8e0')
  const to = condition === 'rain' ? '#c6d2dc' : '#e7f2fb'
  let body = `<rect width="${width}" height="${height}" fill="url(#wsky)"/>`
  body += `<circle cx="${condition === 'sunny' ? 200 : 150}" cy="80" r="40" fill="#ffdf7e" opacity="${condition === 'sunny' ? 1 : 0.6}"/>`
  if(condition !== 'sunny'){
    body += '<g fill="#ffffff" opacity="0.95"><ellipse cx="210" cy="92" rx="66" ry="26"/><ellipse cx="164" cy="84" rx="42" ry="22"/><ellipse cx="258" cy="84" rx="40" ry="20"/></g>'
  }
  if(condition === 'rain'){
    for(let index = 0; index < 26; index += 1){
      const x = range(random, 130, 300)
      const y = range(random, 112, 178)
      body += `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x - 4).toFixed(0)}" y2="${(y + 12).toFixed(0)}" stroke="#5f7f9f" stroke-width="2" opacity="0.7"/>`
    }
  }
  return { width, height, defs: gradient('wsky', from, to), body }
}

function screenshotScene(random){
  const width = 400
  const height = 250
  const accent = pick(random, PALETTES.tech)
  let body = `<rect width="${width}" height="${height}" fill="#dfe4ea"/>`
  body += `<rect x="24" y="26" width="352" height="198" rx="6" fill="#f7f9fb" stroke="#b9c1cc" stroke-width="2"/>`
  body += `<rect x="24" y="26" width="352" height="26" rx="6" fill="${accent}"/>`
  body += '<circle cx="42" cy="39" r="5" fill="#ffffff" opacity="0.85"/><circle cx="58" cy="39" r="5" fill="#ffffff" opacity="0.6"/><circle cx="74" cy="39" r="5" fill="#ffffff" opacity="0.4"/>'
  body += `<rect x="36" y="64" width="90" height="148" rx="4" fill="#e8edf3"/>`
  for(let index = 0; index < 7; index += 1){
    body += `<rect x="44" y="${74 + index * 19}" width="${range(random, 40, 74).toFixed(0)}" height="7" rx="3" fill="#c4cdd8"/>`
  }
  for(let index = 0; index < 9; index += 1){
    body += `<rect x="138" y="${72 + index * 16}" width="${range(random, 90, 220).toFixed(0)}" height="6" rx="3" fill="${index % 3 === 0 ? accent : '#cbd3dd'}" opacity="${index % 3 === 0 ? 0.7 : 1}"/>`
  }
  return { width, height, defs: '', body }
}

// --- art kind registry ----------------------------------------------------

const ART_KINDS = Object.freeze({
  city: (random) => outdoorScene(random, { buildings: true, road: true }),
  'city-night': (random) => outdoorScene(random, { buildings: true, night: true, road: true }),
  station: (random) => outdoorScene(random, { buildings: true, tracks: true, groundColor: '#b9bfc8' }),
  'shopping-street': (random) => outdoorScene(random, { arcade: true, groundColor: '#b9b3a6' }),
  park: (random) => outdoorScene(random, { trees: true, hills: true }),
  seaside: (random) => outdoorScene(random, { water: true, hills: true, horizon: 150 }),
  festival: (random) => outdoorScene(random, { night: true, fireworks: true, buildings: true, noSun: true }),
  sunset: (random) => outdoorScene(random, { dusk: true, buildings: true }),
  stadium: (random) => outdoorScene(random, { groundColor: '#5fa259', buildings: true, horizon: 150 }),
  bus: (random) => outdoorScene(random, { road: true, buildings: true, groundColor: '#a8aeb8' }),
  classroom: (random) => interiorScene(random, { board: true, desks: true, deskRows: 3 }),
  'classroom-desk': (random) => interiorScene(random, { desks: true, monitors: true, deskRows: 2 }),
  'classroom-old': (random) => interiorScene(random, { board: true, desks: true, monitors: true, deskRows: 2, wallColor: '#e8e2d2' }),
  library: (random) => interiorScene(random, { shelves: true }),
  'community-center': (random) => interiorScene(random, { counter: true }),
  'school-lunch': (random) => interiorScene(random, { tray: true, desks: false }),
  cafe: (random) => interiorScene(random, { counter: true, wallColor: '#efe4d6', floorColor: '#a97f55' }),
  'abstract-tech': (random) => abstractScene(random, { nodes: true }),
  'abstract-grid': (random) => abstractScene(random, { grid: true }),
  abstract: (random) => abstractScene(random, {}),
  'abstract-warm': (random) => abstractScene(random, { palette: PALETTES.warm }),
  poster: (random) => posterScene(random, {}),
  jacket: (random) => jacketScene(random),
  product: (random) => productScene(random, {}),
  'product-laptop': (random) => productScene(random, { product: 'laptop' }),
  'product-monitor': (random) => productScene(random, { product: 'monitor' }),
  'product-mouse': (random) => productScene(random, { product: 'mouse' }),
  'product-keyboard': (random) => productScene(random, { product: 'keyboard' }),
  'product-ssd': (random) => productScene(random, { product: 'ssd' }),
  'product-bag': (random) => productScene(random, { product: 'bag' }),
  diagram: (random) => diagramScene(random),
  map: (random) => mapScene(random, {}),
  'map-water': (random) => mapScene(random, { water: true }),
  'map-rail': (random) => mapScene(random, { rail: true }),
  weather: (random) => weatherScene(random, {}),
  'weather-sunny': (random) => weatherScene(random, { condition: 'sunny' }),
  'weather-cloudy': (random) => weatherScene(random, { condition: 'cloudy' }),
  'weather-rain': (random) => weatherScene(random, { condition: 'rain' }),
  screenshot: (random) => screenshotScene(random)
})

export const ART_KIND_NAMES = Object.freeze([...Object.keys(ART_KINDS), ...GENERATED_ART_KEYS])

export function buildArtwork(kind, seed, options = {}){
  const builder = ART_KINDS[kind] || ART_KINDS.abstract
  const random = createRandom(`${kind}:${seed}`)
  const scene = builder(random)
  // Old pages get their pictures degraded on purpose: a warmer cast and a hard
  // border, the way a 2010s page's small JPEG looked.
  const tint = options.era === '2010s'
    ? '<rect width="100%" height="100%" fill="#c98f3f" opacity="0.14"/><rect width="100%" height="100%" fill="none" stroke="#8d8577" stroke-width="6"/>'
    : ''

  return {
    kind: ART_KINDS[kind] ? kind : 'abstract',
    width: scene.width,
    height: scene.height,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${scene.width} ${scene.height}" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true" focusable="false">`
      + `<defs>${scene.defs}</defs>`
      + `${scene.body}${tint}</svg>`
  }
}

// --- site logos -----------------------------------------------------------

export function buildLogo(site){
  const random = createRandom(`logo:${site.id}`)
  const accent = site.theme.accent
  const initial = (site.shortName || site.name).trim().slice(0, 1)
  const style = site.theme.logo || 'mark'
  const size = 34

  if(style === 'square'){
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-hidden="true"><rect width="${size}" height="${size}" rx="4" fill="${accent}"/>`
      + `<text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="17" font-weight="700" font-family="sans-serif">${initial}</text></svg>`
  }

  if(style === 'retro'){
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-hidden="true"><rect x="1" y="1" width="${size - 2}" height="${size - 2}" fill="#fff" stroke="${accent}" stroke-width="2"/>`
      + `<rect x="5" y="5" width="${size - 10}" height="6" fill="${accent}"/>`
      + `<text x="50%" y="66%" text-anchor="middle" fill="${accent}" font-size="13" font-weight="700" font-family="monospace">${initial}</text></svg>`
  }

  if(style === 'wordmark'){
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-hidden="true">`
      + `<rect x="2" y="6" width="${size - 4}" height="22" rx="2" fill="${accent}"/>`
      + `<rect x="6" y="10" width="${size - 12}" height="3" fill="#ffffff" opacity="0.8"/>`
      + `<text x="50%" y="70%" text-anchor="middle" fill="#fff" font-size="12" font-weight="800" font-family="serif">${initial}</text></svg>`
  }

  if(style === 'circle'){
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-hidden="true">`
      + `<circle cx="17" cy="17" r="16" fill="${accent}"/>`
      + `<circle cx="17" cy="17" r="9" fill="none" stroke="#fff" stroke-width="2.4"/>`
      + `<circle cx="17" cy="17" r="2.6" fill="#fff"/></svg>`
  }

  // default: generated geometric mark
  const shapes = []
  for(let index = 0; index < 3; index += 1){
    const x = range(random, 4, 20)
    const y = range(random, 4, 20)
    const s = range(random, 8, 15)
    shapes.push(index % 2
      ? `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${s.toFixed(0)}" height="${s.toFixed(0)}" rx="2" fill="${accent}" opacity="${(0.5 + index * 0.2).toFixed(2)}"/>`
      : `<circle cx="${(x + s / 2).toFixed(0)}" cy="${(y + s / 2).toFixed(0)}" r="${(s / 2).toFixed(0)}" fill="${accent}" opacity="${(0.45 + index * 0.25).toFixed(2)}"/>`)
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-hidden="true">${shapes.join('')}</svg>`
}
