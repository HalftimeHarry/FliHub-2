#!/usr/bin/env bash
set -e

PORT="8083"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required to open the forwarded port."
  exit 1
fi

python3 - <<'PY'
import os
import subprocess
import sys

port = "8083"
url = f"http://localhost:{port}"

try:
    # Try to open the local preview in the browser automatically.
    if sys.platform == "darwin":
        subprocess.run(["open", url], check=False)
    elif sys.platform.startswith("linux"):
        subprocess.run(["xdg-open", url], check=False)
    elif sys.platform == "win32":
        subprocess.run(["cmd", "/c", "start", "", url], check=False)
    else:
        print(f"Open this in your browser: {url}")
except Exception:
    print(f"Open this in your browser: {url}")
PY

npx expo start --web --port "$PORT"
