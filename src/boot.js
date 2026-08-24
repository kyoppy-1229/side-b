// Runs before anything else in the app (it is main.js's first import, so it is
// evaluated before the router or any store module).
//
// Three things have to be settled while the page is still blank:
//   1. a pending reboot target, parked by the router when the tab crossed the
//      /debug or /trial boundary, is written back into the URL;
//   2. which edition of the game this tab runs — the whole work, or the trial
//      (#/trial) — because screens and data ask for it from their first render
//      (公開中は入口が体験版なので、ハッシュなしのアクセスも #/trial に寄せる);
//   3. the storage scope is chosen from the resulting URL, so the debug console
//      and the trial each persist into their own namespace and can never touch a
//      real playthrough.

import { DEBUG_STORAGE_SCOPE, consumePendingBootPath, isDebugLocation } from './debug/scope.js'
import { GAME_MODES, TRIAL_STORAGE_SCOPE, applyDefaultEntry, normalizeTrialLocation, resolveGameMode, setGameMode } from './trial/mode.js'
import { setStorageScope } from './store/storage.js'

consumePendingBootPath()
// `<base>/trial` (the dev server's fallback, or the deployed 404 redirect) has to
// become `#/trial` before the router looks at the location.
normalizeTrialLocation()
// 【暫定】ハッシュなしの入口（`<base>/`）は体験版へ。本編は `#/` で開く。
applyDefaultEntry()

const debug = isDebugLocation()
// The debug console is a space of its own and always inspects the full game.
const mode = setGameMode(debug ? GAME_MODES.FULL : resolveGameMode())

setStorageScope(debug ? DEBUG_STORAGE_SCOPE : (mode === GAME_MODES.TRIAL ? TRIAL_STORAGE_SCOPE : ''))
