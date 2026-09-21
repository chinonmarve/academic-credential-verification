#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
[ -d backend/node_modules ] || (cd backend && npm install)
[ -d frontend/node_modules ] || (cd frontend && npm install)
[ -f backend/.env ] || cp backend/.env.example backend/.env
cd frontend && npm run build && cd ..
[ -f backend/src/data/db.json ] || (cd backend && node src/seed.js)
(cd backend && npm start) &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
sleep 3
if command -v open >/dev/null 2>&1; then open http://localhost:5000/
elif command -v xdg-open >/dev/null 2>&1; then xdg-open http://localhost:5000/
fi
printf '\nACV Platform is running at http://localhost:5000/\nKeep this terminal open while using the system.\n'
wait $SERVER_PID
