#!/bin/sh
# Install Quiet Alerts into Herdr. Links by default, so the files Herdr runs are this
# repo's (edit, commit, pull: Herdr reloads). --copy copies instead. Never overwrites.
set -eu
mode=link
[ "${1:-}" = "--copy" ] && mode=copy
repo=$(cd "$(dirname "$0")" && pwd)
home=${HERDR_APP_HOME:-$HOME/.config/herdr-app}
[ -d "$home" ] || { echo "No Herdr home at $home (start Herdr once, or set HERDR_APP_HOME)." >&2; exit 1; }

put() { # put <repo path> <home path>
  if [ -L "$2" ] && [ "$(readlink "$2")" = "$1" ]; then echo "already linked: $2"; return; fi
  if [ -e "$2" ] || [ -L "$2" ]; then echo "exists, left alone: $2" >&2; failed=1; return; fi
  if [ "$mode" = link ]; then ln -s "$1" "$2"; else cp -R "$1" "$2"; fi
  echo "${mode}ed: $2"
}

failed=0
for m in "$repo"/mods/*/; do m=${m%/}; put "$m" "$home/mods/$(basename "$m")"; done

echo
echo "1. Silence the finished sound: in $home/settings.json set"
echo "     \"sounds\": { \"done\": \"$repo/sounds/silent.mp3\" }"
echo "   (keep your other \"sounds\" fields)."
echo "2. Hide finished notes: add this to the root node of each layout you use"
echo "   (clone a shipped one first: herdr-app do layout.clone '{\"name\":\"main\"}'):"
echo "     \"toast\": \"quiet-alerts-toast\""
exit $failed
