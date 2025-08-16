#!/bin/bash
set -euo pipefail

LANG="${1:-}"

if [[ -z "${LANG}" ]]; then
  echo "Unsupported language: (empty)" >&2
  exit 1
fi

if [[ -z "${CODE_TO_EXECUTE_B64:-}" ]]; then
  echo "No code provided" >&2
  exit 1
fi

# Get code from base64 encoded environment variable to avoid shell escaping issues
CODE=$(echo "$CODE_TO_EXECUTE_B64" | base64 -d)

TMP_DIR=$(mktemp -d)
cd "$TMP_DIR"

run_with_timeout() {
  timeout 25s bash -lc "$*"
}

case "$LANG" in
  python)
    echo "$CODE" > script.py
    run_with_timeout "python3 script.py"
    ;;

  java)
    echo "$CODE" > Main.java
    run_with_timeout "javac Main.java"
    run_with_timeout "java Main"
    ;;

  ballerina)
    echo "$CODE" > main.bal
    run_with_timeout "bal run main.bal"
    ;;

  *)
    echo "Unsupported language: $LANG" >&2
    exit 1
    ;;
esac
