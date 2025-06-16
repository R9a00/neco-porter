#!/bin/bash
# expmt-platform-saas を Neco Porter で起動するスクリプト

echo "🐱 Neco Porter で expmt-platform-saas を起動します"
echo

# カラー定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# expmt-platform-saas のパスを確認
EXPMT_PATH="../expmt-platform-saas"
if [ ! -d "$EXPMT_PATH" ]; then
    echo "❌ エラー: $EXPMT_PATH が見つかりません"
    echo "   正しいパスを指定してください"
    exit 1
fi

echo -e "${BLUE}=== ステップ1: Neco Porter デーモンの確認 ===${NC}"
# デーモンが起動しているか確認
if ! curl -s http://localhost:5555/health > /dev/null 2>&1; then
    echo "⚠️  Neco Porter デーモンが起動していません"
    echo "   起動中..."
    node src/necoportd-v2.js &
    sleep 2
    echo "✅ デーモンを起動しました"
else
    echo "✅ デーモンは既に起動しています"
fi
echo

echo -e "${BLUE}=== ステップ2: 現在のポート予約状況 ===${NC}"
necoport-client list
echo

echo -e "${BLUE}=== ステップ3: Platform Manager の起動 ===${NC}"
echo "以下のコマンドで起動します:"
echo

# 起動コマンドを表示
cat << 'EOF'
cd ../expmt-platform-saas && \
necoport-client exec platform-manager \
  --ports main:8000,auth:8001,rbac:8002,testapp:8003 \
  python platform_manager.py
EOF

echo
echo -e "${YELLOW}このコマンドにより:${NC}"
echo "  • PORT=8000 (Platform Manager メイン)"
echo "  • PORT_AUTH=8001 (認証サービス)"
echo "  • PORT_RBAC=8002 (RBAC管理)"
echo "  • PORT_TESTAPP=8003 (テストアプリ)"
echo "  が自動的に設定されます"
echo

echo -e "${GREEN}準備ができたら Enter キーを押して起動してください...${NC}"
read -r

# 実際に起動
echo "🚀 起動中..."
cd "$EXPMT_PATH" && \
exec ../neco-porter/bin/necoport-client-v2 exec platform-manager \
  --ports main:8000,auth:8001,rbac:8002,testapp:8003 \
  python platform_manager.py