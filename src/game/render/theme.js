// Edition-aware colour themes for the canvas renderer.
// Revival = warm daylight, nostalgic. Original = cold, dim, late-day / night.
// Every scene element pulls its colours from here so the two editions read as
// the *same building* under different light rather than two different games.

export const THEMES = Object.freeze({
  revival: Object.freeze({
    id: 'revival',
    // outside
    skyTop: '#bfe4f4', skyBottom: '#eaf6fb',
    cloud: 'rgba(255,255,255,0.9)',
    grass: '#7fae57', grassDark: '#6c9a49', grassLight: '#8fbb66',
    soil: '#7a5334', path: '#cbb488',
    treeLeaf: '#5f974a', treeLeafDark: '#4d8039', treeTrunk: '#7a5433',
    // building
    floor: '#d8c7a4', floorAlt: '#d0be98', grout: 'rgba(120,92,55,0.28)',
    floorEdge: '#b79b6f',
    // Floor materials, by room. A classroom is wood, a corridor and the wet
    // rooms are vinyl tile, the PC room is carpet, the basement bare concrete.
    floors: Object.freeze({
      wood: Object.freeze({ a: '#cda878', b: '#c39c69', line: 'rgba(122,86,48,0.30)', plank: 'rgba(255,255,255,0.10)' }),
      vinyl: Object.freeze({ a: '#d9d1bb', b: '#d1c8b0', line: 'rgba(120,105,78,0.24)' }),
      tile: Object.freeze({ a: '#d8c7a4', b: '#d0be98', line: 'rgba(120,92,55,0.28)' }),
      carpet: Object.freeze({ a: '#9aa7a2', b: '#93a09b', line: 'rgba(60,74,70,0.16)' }),
      concrete: Object.freeze({ a: '#b3ada0', b: '#aba496', line: 'rgba(80,76,66,0.26)' }),
      entrance: Object.freeze({ a: '#b8ab92', b: '#ad9f86', line: 'rgba(88,74,52,0.34)' })
    }),
    wainscot: '#b9a781', wainscotEdge: '#9d8a64',
    ceilingBand: '#8c7a5d', roomBlock: '#a08a67',
    wall: '#ded7c3', wallShade: '#cabfa4', pilaster: '#c8bfa4', pilasterEdge: '#b3a884',
    baseboard: '#b09873',
    door: '#8a5a34', doorDark: '#6f4526', doorPanel: '#7a4d2c', doorHandle: '#e8c874',
    sign: '#f6f1e2', signText: '#4a3628', signEdge: '#cbb48c',
    window: '#cfe9f5', windowFrame: '#e9e2cf', windowMullion: '#c7bfa6',
    board: '#3f6b4a', boardEdge: '#2e5138', paper: '#f4efe0',
    flower: ['#e46b73', '#f0b24a', '#f2e06a', '#c98bd0', '#8fb6e6', '#ef8fb0'],
    // characters / ui
    playerHair: '#4a3527', playerSkin: '#e8c3a0', playerShirt: '#3f5f86', playerPants: '#37414f',
    shadow: 'rgba(60,42,26,0.22)',
    accent: '#a26743', accentText: '#fff6e6',
    hudBg: 'rgba(28,20,14,0.82)', hudText: '#f6ecd9', hudEdge: 'rgba(255,239,200,0.28)',
    ambient: 'rgba(255,241,197,0.0)', vignette: 'rgba(60,40,20,0.16)',
    promptBg: 'rgba(255,247,225,0.96)', promptText: '#5a3c2a', promptEdge: '#caa06a'
  }),
  original: Object.freeze({
    id: 'original',
    skyTop: '#243247', skyBottom: '#3a4b60',
    cloud: 'rgba(120,140,165,0.4)',
    grass: '#41503f', grassDark: '#374534', grassLight: '#4a5a46',
    soil: '#40342a', path: '#5c5648',
    treeLeaf: '#3d5540', treeLeafDark: '#324733', treeTrunk: '#4a3a2f',
    floor: '#6d6858', floorAlt: '#645f50', grout: 'rgba(20,26,34,0.4)',
    floorEdge: '#4d4a40',
    floors: Object.freeze({
      wood: Object.freeze({ a: '#5f5648', b: '#584f42', line: 'rgba(18,22,28,0.42)', plank: 'rgba(255,255,255,0.05)' }),
      vinyl: Object.freeze({ a: '#63625b', b: '#5b5a54', line: 'rgba(18,22,28,0.38)' }),
      tile: Object.freeze({ a: '#6d6858', b: '#645f50', line: 'rgba(20,26,34,0.4)' }),
      carpet: Object.freeze({ a: '#4f5a5b', b: '#495354', line: 'rgba(14,20,24,0.3)' }),
      concrete: Object.freeze({ a: '#55534c', b: '#4e4c46', line: 'rgba(16,20,24,0.42)' }),
      entrance: Object.freeze({ a: '#4f4b42', b: '#48453d', line: 'rgba(14,18,22,0.46)' })
    }),
    wainscot: '#464a50', wainscotEdge: '#383c42',
    ceilingBand: '#2b3038', roomBlock: '#333a43',
    wall: '#565a5f', wallShade: '#484c52', pilaster: '#4c5157', pilasterEdge: '#3c4046',
    baseboard: '#3a3d42',
    door: '#41352b', doorDark: '#2c241d', doorPanel: '#372c24', doorHandle: '#8a7c53',
    sign: '#c9cdd2', signText: '#2a2f36', signEdge: '#7f8790',
    window: '#28323f', windowFrame: '#464b52', windowMullion: '#363b42',
    board: '#33473c', boardEdge: '#243329', paper: '#b9bcae',
    flower: ['#6d6a52', '#5f6b55', '#726a58', '#5a6270', '#4f5b66', '#6b5f5a'],
    playerHair: '#332a24', playerSkin: '#b79c86', playerShirt: '#3a4552', playerPants: '#2b323b',
    shadow: 'rgba(0,0,0,0.35)',
    accent: '#496d8f', accentText: '#eaf3fb',
    hudBg: 'rgba(9,15,23,0.85)', hudText: '#cfe0ef', hudEdge: 'rgba(120,160,196,0.3)',
    ambient: 'rgba(20,40,64,0.12)', vignette: 'rgba(2,6,12,0.5)',
    promptBg: 'rgba(16,26,38,0.95)', promptText: '#cadcec', promptEdge: '#4f7ba9'
  })
})

export function getTheme(edition){
  return THEMES[edition] || THEMES.revival
}
