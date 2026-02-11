#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BASELINE_DIR=".visual-baseline"
CURRENT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/kaomoji-visual-XXXXXX")"

TARGETS=(
  "home|http://localhost:8000/|home.png"
  "explore|http://localhost:8000/explore/|explore.png"
  "category-anger|http://localhost:8000/explore/categories/anger/|category-anger.png"
)

cleanup() {
  rm -rf "$CURRENT_DIR"
}
trap cleanup EXIT

capture_screenshots() {
  local output_dir="$1"
  mkdir -p "$output_dir"

  for target in "${TARGETS[@]}"; do
    IFS='|' read -r name url filename <<<"$target"
    echo "[visual-check] Capturing ${name}: ${url}"
    npx playwright screenshot "$url" "$output_dir/$filename" >/dev/null
  done
}

compare_against_baseline() {
  local failed=0
  for target in "${TARGETS[@]}"; do
    IFS='|' read -r name _url filename <<<"$target"
    local baseline_file="$BASELINE_DIR/$filename"
    local current_file="$CURRENT_DIR/$filename"

    if [[ ! -f "$baseline_file" ]]; then
      echo "[visual-check] Missing baseline file: $baseline_file"
      failed=1
      continue
    fi

    if ! cmp -s "$baseline_file" "$current_file"; then
      echo "[visual-check] Mismatch: $name"
      failed=1
    fi
  done

  if [[ "$failed" -ne 0 ]]; then
    echo "[visual-check] Visual comparison failed."
    exit 1
  fi
}

capture_screenshots "$CURRENT_DIR"

if [[ "${UPDATE_VISUAL_BASELINE:-0}" == "1" ]]; then
  mkdir -p "$BASELINE_DIR"
  for target in "${TARGETS[@]}"; do
    IFS='|' read -r _name _url filename <<<"$target"
    cp "$CURRENT_DIR/$filename" "$BASELINE_DIR/$filename"
  done
  echo "[visual-check] Baseline updated in $BASELINE_DIR"
  exit 0
fi

if [[ ! -d "$BASELINE_DIR" ]]; then
  echo "[visual-check] Baseline directory not found: $BASELINE_DIR"
  echo "[visual-check] Run with UPDATE_VISUAL_BASELINE=1 to create baseline."
  exit 1
fi

compare_against_baseline
echo "[visual-check] PASS"
