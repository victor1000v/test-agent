#!/bin/bash
# Assemble report parts -> artifact.html (for Artifact publish) and standalone.html (for repo)
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_A="$DIR/artifact.html"
OUT_S="$DIR/standalone.html"

cat "$DIR"/parts/*.html > "$OUT_A"

{
  echo '<!DOCTYPE html>'
  echo '<html lang="en">'
  echo '<head>'
  echo '<meta charset="UTF-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
  echo '</head>'
  echo '<body>'
  cat "$OUT_A"
  echo '</body>'
  echo '</html>'
} > "$OUT_S"

echo "artifact:   $(wc -c < "$OUT_A") bytes"
echo "standalone: $(wc -c < "$OUT_S") bytes"
