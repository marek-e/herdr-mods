# Quiet Alerts

Agents that finish stop interrupting you. Herdr normally plays a chime and pops a note in the
corner when an agent finishes while you're looking elsewhere; with Quiet Alerts neither happens.
Finished agents still show as finished in the agents list, so you get to them when you choose.
An agent that needs you (a permission prompt, a question) still chimes and pops a note, and so
do errors and update notices.

## What you see

Nothing new. When an agent finishes, no note appears and no sound plays. Everything else looks
and sounds like Herdr's own: the same 2-line notes (title 13px semibold, body 12px muted, an 8px
status dot or the program icon on the left) for every other notification.

## How it behaves

- **done** (finished while you weren't looking): no note, no sound. The agent shows `done` in
  the agents list and turns `idle` once you look at it, as usual.
- **blocked** (needs you): Herdr's sound and note, unchanged. Clicking the note focuses the agent.
- **working**, **idle**: no notes, as in Herdr.
- Any other notification (`notify()` from a mod, errors, login hints, updates): shown unchanged.

## Built from

- **`quiet-alerts-toast`**: a clone of Herdr's shipped `toast` mod (`mod.json`:
  `{ "place": "none" }`). In `init` it reads `props()`; if the note's title or body contains the
  word `finished` and its `level` isn't `error`, it calls `closeOverlay(props().overlay)` at once
  and renders an empty `div()`. Otherwise it draws exactly as `toast` does. Herdr's finished note
  looks like `{ title: "Claude Code finished", body: "~ / 1", level: "info",
  action: { name: "agent.focus", args: { terminal: "t1" } } }`.
- **The layout:** the layout's root node gets `"toast": "quiet-alerts-toast"`. That field is per
  layout, so set it on every layout you use.
- **`sounds/silent.mp3`**: 0.2s of silence (`ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.2
  -q:a 9 silent.mp3`). `settings.json` points `sounds.done` at it (absolute path). `sounds.blocked`
  and `sounds.enabled` stay as they were.

## Watch out

- Read the note from `props()` inside `init`. The first argument of `init` is not the note's
  props for an overlay toast: matching on it never hides anything.
- The match is on Herdr's English wording ("<Program> finished"). If a Herdr update rewords it,
  finished notes show again; check one note's `props()` and update the regex.
- Turning off `sounds.enabled` would also silence agents that need you. Point only `sounds.done`
  at a silent file instead.
- A layout without the `toast` field keeps Herdr's own notes. An unknown `toast` mod name logs a
  warning and falls back to `toast`.

## Done when

- `herdr-app check mods/quiet-alerts-toast` passes and `herdr-app status` shows `"errors": []`.
- An agent finishing in a space you aren't looking at plays no sound and shows no note, and the
  agents list shows it as finished.
- An agent asking for permission still plays the blocked sound and shows its note.
