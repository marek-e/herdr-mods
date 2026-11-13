# Herdr mods

Packs of layouts and mods for the Herdr desktop app, published at github.com/marek-e/herdr-mods.
Each top-level folder is one **pack**, laid out like Herdr's home (`layouts/`, `mods/`,
`keys.json`) plus `RECIPE.md`, `preview.png` and `install.sh`. Herdr runs the packs through
symlinks in `~/.config/herdr-app`, so a saved edit here is live in the app within a second.

## Before building

Read `~/.config/herdr-app/AGENTS.md` in full: it's Herdr's manual for the installed version
(layouts, keys, commands, the mod API), rewritten on every Herdr update. Its type files are the
API truth: `~/.config/herdr-app/herdr.d.ts` and `gpui-kit.d.ts` in any mod folder. Then read
the shipped mod closest to the task in `~/.config/herdr-app/mods/` (`spaces`, `agents`, `menu`,
`tabs`, `prompt`, `worktree`, ...). Where this file and AGENTS.md disagree, AGENTS.md wins.

## Building a pack

1. **Folder:** create `<pack>/`. Prefix every mod name with the pack name (`grouped-spaces`,
   `grouped-menu`, ...) so it can't clash with shipped mods or other packs.
2. **Start from Herdr's own mods and layouts** when changing them: they're read-only and replaced
   on start. Clone in the app, then move the clone into the pack:
   `herdr-app do mod.clone '{"name":"agents","as":"<pack>-agents"}'` (same for `layout.clone`).
   A mod that a layout or another mod places gets `mod.json` `{ "place": "none" }`; otherwise
   Herdr docks it into the shown layout the first time it sees the folder.
3. **Rewire names** after renaming: a layout's `content.mod`, `openOverlay({ mod })` (including a
   mod opening itself), asset paths `mods/<name>/...`, and `<mod>.<command>` key actions.
4. **Link** with `<pack>/install.sh`: copy `grouped-spaces/install.sh` and change its layout
   name. Add the pack's keys to the user's `~/.config/herdr-app/keys.json` with a JSON-aware edit,
   after confirming the key is free. Then `herdr-app do layout.switch --name <layout>`.
5. **Verify every edit:** `herdr-app check <mod folder>` passes, `herdr-app status` shows
   `"errors": []`, and a screenshot shows the change (see Gotchas). Done means all three.
6. **Ship:** write `RECIPE.md` (sections: what you see, how it behaves, built from, watch out,
   done when; AGENTS.md describes them), save `preview.png`, add a row to the root `README.md`
   table, commit, `git push`.

## Gotchas

- **`check` is shallow:** it renders once without live props, so rows, dialogs opened with props
  and later states go unchecked. `herdr-app status` after the reload catches runtime errors.
- **Cloned code reuses names:** a `const` you add can collide with one declared later in the same
  function ("invalid redefinition of lexical identifier"). Give added names a distinct prefix.
- **Stale screenshots:** `herdr-app shot <file>` saves the last frame, and Herdr stops redrawing
  in the background, so a shot can predate the edit. Confirm it shows something you changed; if
  not, ask the user to bring Herdr to the front. Crop with
  `sips -c <h> <w> --cropOffset <y> <x> in.png --out out.png`.
- **The user's view is theirs:** selecting a space or switching groups to get a better
  screenshot moves the user's focus. Ask them instead.
- **Test keys without pressing them:** `herdr-app do <mod>.<command>` delivers to the mod's
  `nextCommand()`; `herdr-app do overlay.close` closes the dialog it opened.
- **Links resolve on load:** Herdr watches a linked mod's real path. After moving or renaming a
  pack folder, relink, then `layout.switch` away and back to reload from the new path.
- **Missed reloads:** a save sometimes doesn't reload a linked mod, with `check` passing and
  `status` clean (seen on `grouped-spaces`). If a change doesn't show, `layout.switch` away and
  back before debugging the code.
- **Generated builders:** style methods like `border_2`, `font_medium`, `max_w` and `flex_shrink`
  are generated, so grepping `gpui-kit.d.ts` misses them. Grep the shipped mods for usage.
- **Shared state** lives in `~/.config/herdr-app/shared.json`, written by Herdr. Read it to
  inspect; change it from a mod (`setShared`). `grouped-spaces/RECIPE.md` lists the keys that
  pack owns (`space.groups`, `space.descriptions`, `space.letters`, ...): reuse them in new mods.
- **`keys.json` ownership:** any edit makes the whole file the user's, and Herdr stops adding its
  new default shortcuts. Back it up before the first edit.

## Public repo

Everything here is public. Keep work names, client names and work paths out of code, docs and
previews; take `preview.png` from the Personal group, and make personal values (like
`WORK_FOLDERS`) empty settings that each user fills in.
