#!/bin/bash
# 仮想環境付きの起動スクリプト

echo "🐱 Neco Porter × expmt-platform-saas"
echo

# パスの設定
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXPMT_DIR="$SCRIPT_DIR/../expmt-platform-saas"
VENV_PATH="$EXPMT_DIR/.venv"

# expmt-platform-saas の存在確認
if [ ! -d "$EXPMT_DIR" ]; then
    echo "❌ エラー: expmt-platform-saas が見つかりません"
    echo "   パス: $EXPMT_DIR"
    exit 1
fi

# Python仮想環境の確認
if [ ! -d "$VENV_PATH" ]; then
    echo "⚠️  Python仮想環境が見つかりません"
    echo "   expmt-platform-saas ディレクトリで以下を実行してください:"
    echo "   python -m venv .venv"
    echo "   source .venv/bin/activate"
    echo "   pip install -r requirements.txt"
    exit 1
fi

# Neco Porter デーモンの起動確認
if ! curl -s http://localhost:5555/health > /dev/null 2>&1; then
    echo "📦 Neco Porter デーモンを起動中..."
    cd "$SCRIPT_DIR" && node src/necoportd-v2.js > /dev/null 2>&1 &
    sleep 2
    echo "✅ デーモンを起動しました"
fi

echo "🚀 Platform Manager を起動します"
echo
echo "アクセスURL:"
echo "  • Platform Manager: http://localhost:8000"
echo "  • Auth Service API: http://localhost:8001/docs"
echo "  • RBAC Service API: http://localhost:8002/docs"
echo "  • Test App: http://localhost:8003"
echo

# 仮想環境をアクティベートして起動
cd "$EXPMT_DIR" && \
source .venv/bin/activate && \
exec "$SCRIPT_DIR/bin/necoport-client-v2" exec platform \
    --ports main:8000,auth:8001,rbac:8002,testapp:8003 \
    python platform_manager.py