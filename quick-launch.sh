#!/bin/bash
# クイック起動スクリプト

echo "🐱 expmt-platform-saas をすぐに起動します！"
echo

# Neco Porter デーモンが起動していなければ起動
if ! curl -s http://localhost:5555/health > /dev/null 2>&1; then
    echo "📦 Neco Porter デーモンを起動中..."
    node "$(dirname "$0")/src/necoportd-v2.js" > /dev/null 2>&1 &
    sleep 2
fi

# 起動
echo "🚀 Platform Manager を起動中..."
echo "   Platform Manager: http://localhost:8000"
echo "   Auth Service: http://localhost:8001"
echo "   RBAC Service: http://localhost:8002"
echo "   Test App: http://localhost:8003"
echo

cd "$(dirname "$0")/../expmt-platform-saas" && \
exec "$(dirname "$0")/bin/necoport-client-v2" exec platform \
    --ports main:8000,auth:8001,rbac:8002,testapp:8003 \
    python platform_manager.py