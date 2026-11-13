# Herdr mods

Layouts and mods for [Herdr](https://herdr.dev). Each folder is one pack, laid out like Herdr's
home (`layouts/`, `mods/`, `keys.json`), with a `RECIPE.md` brief, a `preview.png`, and an
`install.sh` that links it into `~/.config/herdr-app`.

| Pack | What it does |
|---|---|
| [grouped-spaces](grouped-spaces/) | Work / Personal space groups you switch with a click or a sideways swipe, space descriptions, and custom avatar letters and colors |
| [quiet-alerts](quiet-alerts/) | No sound or note when an agent finishes; agents that need you still alert |

## Adding a pack

1. Make a folder `<pack>/` with `layouts/` and/or `mods/<pack>-*/`. Prefix the mod names with
   the pack's name so they can't clash with Herdr's own mods or other packs.
2. Copy `grouped-spaces/install.sh` and change the layout name in it.
3. Write `RECIPE.md` (what you see, how it behaves, built from, watch out, done when) and save a
   screenshot as `preview.png` (`herdr-app shot`).
4. Run `herdr-app check` on every mod before committing.
