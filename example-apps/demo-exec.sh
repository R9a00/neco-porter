#!/bin/bash
# necoport-client execの動作デモ

echo "=== デモ: necoport-client execの仕組み ==="
echo

echo "1. 通常起動（PORT環境変数なし）:"
echo "   node app.js"
echo "   → デフォルトの3000番ポートを使用"
echo

echo "2. 手動でPORT設定:"
echo "   PORT=8080 node app.js"
echo "   → 8080番ポートを使用"
echo

echo "3. necoport-client exec使用:"
echo "   necoport-client exec myapp node app.js"
echo "   → Neco Porterが自動的に:"
echo "     - 空いているポートを見つける（例: 3001）"
echo "     - PORT=3001 を設定"
echo "     - node app.jsを実行"
echo "     - プロセス終了時にポートを解放"
echo

echo "=== 実際の流れ ==="
echo
echo "$ necoport-client exec web npm run dev"
echo
echo "1. necoportdにリクエスト → 「web」用のポート予約"
echo "2. 空きポート3000を取得"
echo "3. export PORT=3000"
echo "4. npm run dev 実行（PORT=3000が設定された状態）"
echo "5. アプリは process.env.PORT (3000) で起動"
echo "6. Ctrl+C → ポート3000を自動解放"
echo

echo "=== 複数ポートの例 ==="
echo
echo "$ necoport-client exec app --ports main,api,ws npm start"
echo
echo "環境変数:"
echo "  PORT=3001      # メインポート"
echo "  PORT_API=3002  # APIポート"
echo "  PORT_WS=3003   # WebSocketポート"
echo
echo "アプリ側のコード:"
echo "  const mainPort = process.env.PORT || 3000;"
echo "  const apiPort = process.env.PORT_API || 8080;"
echo "  const wsPort = process.env.PORT_WS || 8081;"