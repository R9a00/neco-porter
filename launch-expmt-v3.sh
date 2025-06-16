#!/bin/bash
# necoport-v3を使ってexpmt-platform-saasを起動

echo "🐱 Neco Porter v3 で expmt-platform-saas を起動"
echo

# 設定ファイルをコピー
cp expmt-platform.yaml .necoport.yaml

echo "📋 利用可能なサービス:"
echo "  platform   - 全体プラットフォーム (ポート: 8000-8003)"
echo "  auth-only  - 認証サービスのみ (ポート: 8001)" 
echo "  rbac-only  - RBAC管理のみ (ポート: 8002)"
echo

echo "🚀 起動方法:"
echo "  ./necoport-v3 run platform    # プラットフォーム全体"
echo "  ./necoport-v3 run auth-only   # 認証サービスのみ"
echo "  ./necoport-v3 status          # 実行状況確認"
echo "  ./necoport-v3 stop            # 全停止"
echo

echo "準備完了！上記コマンドで起動してください。"