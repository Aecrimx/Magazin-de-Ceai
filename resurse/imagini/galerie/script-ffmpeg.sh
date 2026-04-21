#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob nocaseglob

for f in *.{jpg,jpeg,png,webp,bmp,tif,tiff}; do
  [[ -e "$f" ]] || continue
  [[ "$f" == 500_* ]] && continue

  ffmpeg -hide_banner -loglevel error -y \
    -i "$f" \
    -vf "scale=500:500:force_original_aspect_ratio=increase,crop=500:500" \
    "500_$f"
done

echo "Done."