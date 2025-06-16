# expmt-platform-saas 起動コマンド

## 方法1: Node.jsスクリプトを使用（推奨）

```bash
# 1. expmt-platform-saasディレクトリに移動
cd ../expmt-platform-saas

# 2. Python仮想環境をアクティベート
source .venv/bin/activate

# 3. neco-porterディレクトリに戻る
cd ../neco-porter

# 4. 起動スクリプトを実行
node launch-platform.js
```

## 方法2: 直接コマンドで起動

```bash
# 1. expmt-platform-saasディレクトリで実行
cd ../expmt-platform-saas
source .venv/bin/activate

# 2. Neco Porter経由で起動（単一ポート）
../neco-porter/bin/necoport-client exec platform python platform_manager.py
```

## 方法3: 環境変数を手動設定して起動

```bash
# 1. expmt-platform-saasディレクトリで実行
cd ../expmt-platform-saas
source .venv/bin/activate

# 2. ポートを手動で設定して起動
PORT=8000 \
AUTH_SERVICE_PORT=8001 \
RBAC_SERVICE_PORT=8002 \
TEST_APP_PORT=8003 \
python platform_manager.py
```

## 起動確認

起動後、以下のURLにアクセスできます：

- Platform Manager: http://localhost:8000
- Auth Service API: http://localhost:8001/docs
- RBAC Service API: http://localhost:8002/docs
- Test App: http://localhost:8003

## トラブルシューティング

### Neco Porterデーモンが起動していない場合
```bash
# neco-porterディレクトリで実行
node src/necoportd-v2.js &
```

### ポート5555が既に使用されている場合
```bash
# 既存のプロセスを確認
lsof -i:5555

# プロセスを終了
kill <PID>
```

### Python仮想環境がない場合
```bash
cd ../expmt-platform-saas
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```