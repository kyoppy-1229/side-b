import { ARCHIVE_FILES } from './data.js'

const INTRO = [
  'ASANAGI SCHOOL / READ-ONLY ARCHIVE',
  '最終バックアップ: 2015-03-02 08:30',
  '外部通信: 無効 / シミュレーター内の保存資料のみ',
  'コマンド一覧を見るには HELP を入力してください。'
].join('\n')

function fileName(value){
  return String(value || '').replace(/^.*[\\/]/, '').toUpperCase()
}

function linesForQuery(file, phrase){
  const lines = file.split('\n').filter((line) => line.toLowerCase().includes(phrase.toLowerCase()))
  return lines.length ? lines.join('\n') : '一致する行はありません。'
}

export function runArchiveCommand(rawCommand){
  const input = String(rawCommand || '').trim().slice(0, 240)
  const [command = '', ...parts] = input.split(/\s+/)
  const verb = command.toLowerCase()
  const args = parts.join(' ')
  if(!input) return { output: '', file: null }

  if(verb === 'help' || verb === '?') return {
    output: 'HELP               この説明\nDIR                保存ファイル一覧\nTYPE <file>        ファイルの表示\nFINDSTR <語> <file> 文字列の検索\nFC <file1> <file2>  2資料の比較\nTIMELINE           調査対象時刻の確認\nCLS                画面のクリア\n\n例: TYPE ACCESS.LOG',
    file: null
  }
  if(verb === 'dir') return {
    output: `C:\\ARCHIVE\\20150301\\\n${Object.keys(ARCHIVE_FILES).map((name) => `  ${name}`).join('\n')}\n${Object.keys(ARCHIVE_FILES).length} files`,
    file: null
  }
  if(verb === 'timeline') return {
    output: '調査基準時刻: 2015-03-01 19:44:12\n提出された証言は、時刻・場所・別資料の裏付けで照合してください。',
    file: null
  }
  if(verb === 'cls') return { output: INTRO, file: null, clear: true }
  if(verb === 'type'){
    const file = fileName(args)
    return ARCHIVE_FILES[file]
      ? { output: ARCHIVE_FILES[file], file }
      : { output: '指定したファイルが見つかりません。DIRで一覧を確認してください。', file: null }
  }
  if(verb === 'findstr'){
    const match = args.match(/^"([^"]+)"\s+(.+)$/) || args.match(/^(\S+)\s+(.+)$/)
    if(!match) return { output: '使い方: FINDSTR <語> <file>', file: null }
    const file = fileName(match[2])
    if(!ARCHIVE_FILES[file]) return { output: '指定したファイルが見つかりません。', file: null }
    return { output: linesForQuery(ARCHIVE_FILES[file], match[1]), file }
  }
  if(verb === 'fc'){
    if(parts.length < 2) return { output: '使い方: FC <file1> <file2>', file: null }
    const [left, right] = parts.map(fileName)
    if(!ARCHIVE_FILES[left] || !ARCHIVE_FILES[right]) return { output: '比較する資料が見つかりません。', file: null }
    return {
      output: `比較対象: ${left} / ${right}\n--- ${left} ---\n${ARCHIVE_FILES[left]}\n--- ${right} ---\n${ARCHIVE_FILES[right]}\n\n時刻・端末番号が対応するか確認してください。`,
      files: [left, right], file: null
    }
  }
  return {
    output: `'${command}' はこの保存端末では使用できません。HELPで利用可能なコマンドを確認してください。`,
    file: null
  }
}

export function terminalIntro(){
  return INTRO
}
