#!/bin/sh
# Run a codex delegate non-interactively on gpt-6.1-sol.
# gpt-6.1-sol needs codex >= 0.160; older clients get model_not_found. The
# codex binary is $CODEX_BIN, else the newest bundled with the VS Code
# extension, else `codex` on PATH. Falls back to gpt-6-astra if the model is
# still rejected.
# Usage: scripts/delegate-codex.sh <worktree> <brief-file> <report-file> [sandbox]
# Extra codex arguments (e.g. --add-dir <path>) can be passed in $CODEX_EXTRA_ARGS.
# Sandbox network access is on so tests that bind localhost sockets can run.
set -u
worktree=$1 brief=$2 report=$3 sandbox=${4:-workspace-write}
codex_bin=${CODEX_BIN:-$(ls -t "$HOME"/.vscode*/extensions/openai.chatgpt-*/bin/linux-x86_64/codex 2>/dev/null | head -1)}
codex_bin=${codex_bin:-codex}
echo "delegate-codex: using $codex_bin ($("$codex_bin" --version 2>/dev/null))" >&2
for model in gpt-6.1-sol gpt-6-astra; do
  log=$(mktemp)
  # shellcheck disable=SC2086 # CODEX_EXTRA_ARGS is a list of words on purpose
  "$codex_bin" exec -m "$model" -C "$worktree" -s "$sandbox" -c sandbox_workspace_write.network_access=true \
    ${CODEX_EXTRA_ARGS:-} -o "$report" - < "$brief" > "$log" 2>&1
  status=$?
  if grep -q '"code":"model_not_found"' "$log"; then
    echo "delegate-codex: $model rejected by this client/account, trying next model" >&2
    rm -f "$log"
    continue
  fi
  cat "$log"; rm -f "$log"
  echo "delegate-codex: ran with $model" >&2
  exit $status
done
echo "delegate-codex: no usable model" >&2
exit 1
