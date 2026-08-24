// Display helpers shared by the virtual site templates.

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function parts(value){
  const match = String(value ?? '').match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/)
  if(!match) return null
  return {
    year: Number(match[1]),
    month: match[2] ? Number(match[2]) : null,
    day: match[3] ? Number(match[3]) : null
  }
}

// style: 'ja' 2026年8月19日 / 'slash' 2026/08/19 / 'dot' 2026.08.19 / 'short' 8/19
export function formatDate(value, style = 'ja'){
  const date = parts(value)
  if(!date) return ''
  const month = date.month ? String(date.month).padStart(2, '0') : ''
  const day = date.day ? String(date.day).padStart(2, '0') : ''

  if(style === 'slash') return [date.year, month, day].filter(Boolean).join('/')
  if(style === 'dot') return [date.year, month, day].filter(Boolean).join('.')
  if(style === 'short') return date.month && date.day ? `${date.month}/${date.day}` : String(date.year)
  if(style === 'iso') return [date.year, month, day].filter(Boolean).join('-')

  let text = `${date.year}年`
  if(date.month) text += `${date.month}月`
  if(date.day) text += `${date.day}日`
  return text
}

export function weekdayOf(value){
  const date = parts(value)
  if(!date || !date.month || !date.day) return ''
  const parsed = new Date(Date.UTC(date.year, date.month - 1, date.day))
  return WEEKDAYS[parsed.getUTCDay()] || ''
}

export function formatCount(value){
  if(value === null || value === undefined) return ''
  const number = Number(value)
  if(!Number.isFinite(number)) return ''
  if(number >= 10000) return `${(number / 10000).toFixed(1)}万`
  return number.toLocaleString('ja-JP')
}

export function formatPrice(value){
  const number = Number(value)
  if(!Number.isFinite(number)) return ''
  return `${number.toLocaleString('ja-JP')}円`
}

export function eraLabel(era){
  if(era === '2020s') return '2020年代'
  if(era === '2010s') return '2010年代'
  if(era === '2000s') return '2000年代'
  return ''
}
