# 🐱 Neco Porter 使用ガイド

## インストール

### 方法1: npm（推奨）
```bash
cd ~/neco-porter
npm link

# これで、どこからでも 'neco' コマンドが使える！
```

### 方法2: 手動インストール
```bash
cd ~/neco-porter
./install.sh
```

## 使い方

### 基本原則
**`neco` コマンドは、実行したいアプリのディレクトリで使います**

### 例1: Pythonアプリ
```bash
cd ~/my-python-project    # Pythonプロジェクトのディレクトリへ
neco .                    # 自動検出して起動
# または
neco python app.py        # 明示的に指定
```

### 例2: Node.jsアプリ
```bash
cd ~/my-node-app         # Node.jsプロジェクトのディレクトリへ
neco .                   # package.jsonから自動検出
# または
neco npm run dev         # 明示的に指定
```

### 例3: expmt-platform-saas
```bash
cd ~/expmt-platform-saas
neco python3 platform_manager.py
```

### より簡単な方法（専用ランチャー）
```bash
cd ~/expmt-platform-saas
~/neco-porter/run-expmt   # 専用ランチャーを使用
```

## コマンド実行場所の整理

| コマンド | 実行場所 | 用途 |
|---------|---------|------|
| `neco .` | アプリのルートディレクトリ | 自動検出して起動 |
| `neco python app.py` | アプリのルートディレクトリ | 指定したコマンドを実行 |
| `neco status` | どこでも | 実行中のサービス確認 |
| `neco stop` | どこでも | 全サービス停止 |
| `necoportd` | どこでも | デーモン起動（通常は自動） |

## 設定ファイル（.necoport.yaml）

アプリのルートディレクトリに置きます：

```yaml
# ~/my-app/.necoport.yaml
version: 1
services:
  web:
    command: "npm run dev"
    ports:
      main: 3000
  api:
    command: "python api.py"
    ports:
      main: 8000
```

使用方法：
```bash
cd ~/my-app
neco web    # webサービスだけ起動
neco api    # apiサービスだけ起動
neco start  # 全サービス起動
```

## よくある質問

**Q: neco コマンドが見つからない**
```bash
# インストールを確認
cd ~/neco-porter
npm link
# または
./install.sh
```

**Q: どのディレクトリで実行すればいい？**
- 起動したいアプリのルートディレクトリで実行
- `neco status` や `neco stop` はどこからでもOK

**Q: ポートが既に使われている**
```bash
neco status  # 何が実行中か確認
neco stop    # 全部停止
```

## まとめ

1. **インストール**: `npm link` を一度だけ実行
2. **使用**: アプリのディレクトリで `neco .` を実行
3. **管理**: どこからでも `neco status` や `neco stop`

シンプル！ 🐱