#!/bin/zsh

set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOG_FILE="$PROJECT_DIR/.devtodo-launcher.log"
PID_FILE="$PROJECT_DIR/.devtodo-vite.pid"
APP_URL="http://127.0.0.1:5173/"
LOCALHOST_URL="http://localhost:5173/"

export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.local/bin:$PATH"

show_error() {
  /usr/bin/osascript -e "display dialog \"$1\" with title \"DevTodo IDE\" buttons {\"확인\"} default button \"확인\" with icon stop"
}

show_notice() {
  /usr/bin/osascript -e "display notification \"$1\" with title \"DevTodo IDE\""
}

if /usr/bin/curl --silent --fail --max-time 1 "$APP_URL" >/dev/null 2>&1; then
  /usr/bin/open "$APP_URL"
  exit 0
fi

if /usr/bin/curl --silent --fail --max-time 1 "$LOCALHOST_URL" >/dev/null 2>&1; then
  /usr/bin/open "$LOCALHOST_URL"
  exit 0
fi

NPM_BIN="$(command -v npm 2>/dev/null || true)"

if [[ -z "$NPM_BIN" && -x "/usr/local/bin/npm" ]]; then
  NPM_BIN="/usr/local/bin/npm"
fi

if [[ -z "$NPM_BIN" && -x "/opt/homebrew/bin/npm" ]]; then
  NPM_BIN="/opt/homebrew/bin/npm"
fi

if [[ -z "$NPM_BIN" ]]; then
  NVM_NPM="$(ls -t "$HOME"/.nvm/versions/node/*/bin/npm 2>/dev/null | head -n 1 || true)"
  if [[ -n "$NVM_NPM" ]]; then
    NPM_BIN="$NVM_NPM"
    export PATH="$(dirname "$NPM_BIN"):$PATH"
  fi
fi

if [[ -z "$NPM_BIN" ]]; then
  show_error "Node.js를 찾을 수 없습니다. Node.js를 먼저 설치한 뒤 다시 실행해 주세요."
  exit 1
fi

if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
  show_error "프로젝트 파일을 찾을 수 없습니다. DevTodo IDE.app을 프로젝트 폴더 안에 두어 주세요."
  exit 1
fi

cd "$PROJECT_DIR" || exit 1

if [[ ! -d "$PROJECT_DIR/node_modules" ]]; then
  show_notice "처음 실행을 준비하고 있습니다. 잠시 기다려 주세요."
  if ! "$NPM_BIN" install --no-audit --no-fund >>"$LOG_FILE" 2>&1; then
    show_error "필요한 파일 설치에 실패했습니다. 인터넷 연결을 확인해 주세요. 자세한 내용은 .devtodo-launcher.log에 있습니다."
    exit 1
  fi
fi

: >"$LOG_FILE"
/usr/bin/nohup "$NPM_BIN" run dev -- --host 127.0.0.1 --port 5173 --strictPort >>"$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" >"$PID_FILE"

for _ in {1..80}; do
  if /usr/bin/curl --silent --fail --max-time 1 "$APP_URL" >/dev/null 2>&1; then
    /usr/bin/open "$APP_URL"
    show_notice "DevTodo IDE를 실행했습니다."
    exit 0
  fi

  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    break
  fi

  sleep 0.25
done

show_error "DevTodo IDE를 실행하지 못했습니다. 자세한 내용은 프로젝트 폴더의 .devtodo-launcher.log를 확인해 주세요."
exit 1
