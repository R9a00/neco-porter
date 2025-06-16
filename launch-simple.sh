#!/bin/bash
# シンプルな起動スクリプト（bash互換性向上版）

echo "🐱 expmt-platform-saas を起動します"

# パス設定
NECO_DIR="$(cd "$(dirname "$0")" && pwd)"
EXPMT_DIR="$NECO_DIR/../expmt-platform-saas"

# デーモン確認
echo "✅ Neco Porter デーモン確認中..."
curl -s http://localhost:5555/list > /dev/null || {
    echo "❌ デーモンが起動していません"
    exit 1
}

# 仮想環境の確認とアクティベート
if [ -f "$EXPMT_DIR/.venv/bin/activate" ]; then
    echo "✅ Python仮想環境を検出"
    cd "$EXPMT_DIR"
    source .venv/bin/activate
else
    echo "⚠️  仮想環境が見つかりません。直接実行します"
    cd "$EXPMT_DIR"
fi

echo
echo "🚀 起動中..."
echo "   Platform Manager: http://localhost:8000"
echo

# シンプルにv1互換モードで起動（単一ポート）
exec "$NECO_DIR/bin/necoport-client" exec platform python platform_manager.py