#!/bin/bash
# serve.sh — 로컬 개발 서버 실행
# 마크다운 파일을 fetch로 로드하려면 HTTP 서버가 필요합니다 (CORS 정책).
#
# 사용법:
#   chmod +x serve.sh
#   ./serve.sh
#
# 접속: http://localhost:8080

PORT=${1:-8080}
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 최고의 투자 서버 시작"
echo "📂 경로: $DIR"
echo "🌐 접속: http://localhost:$PORT"
echo "⏹  종료: Ctrl+C"
echo ""

# Python 3 우선, 없으면 Python 2
if command -v python3 &>/dev/null; then
  python3 -m http.server $PORT --directory "$DIR"
elif command -v python &>/dev/null; then
  cd "$DIR" && python -m SimpleHTTPServer $PORT
else
  echo "❌ Python이 설치되어 있지 않습니다."
  echo "   Node.js가 있다면: npx serve $DIR -p $PORT"
  exit 1
fi
