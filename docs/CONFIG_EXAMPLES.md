# Neco Porter 設定ファイル例

## 基本形式

```yaml
version: 1
services:
  <サービス名>:
    command: <実行コマンド>
    ports:
      <ポート名>:
        hint: <希望ポート番号>
    env:
      <環境変数名>: <値>
```

## 例1: シンプルなNode.jsアプリ

```yaml
version: 1
services:
  web:
    command: "npm run dev"
    ports:
      main:
        hint: 3000
```

## 例2: Python Flask アプリ

```yaml
version: 1
services:
  api:
    command: "flask run"
    ports:
      main:
        hint: 5000
    env:
      FLASK_ENV: "development"
      FLASK_DEBUG: "1"
```

## 例3: フロントエンド + バックエンド

```yaml
version: 1
services:
  frontend:
    command: "npm run dev"
    ports:
      main:
        hint: 3000
      hmr:
        hint: 3001
        
  backend:
    command: "python api.py"
    ports:
      main:
        hint: 8000
    env:
      DATABASE_URL: "postgresql://localhost/myapp"
```

## 例4: マイクロサービス構成

```yaml
version: 1
services:
  gateway:
    command: "node gateway.js"
    ports:
      main:
        hint: 3000
        
  auth:
    command: "python auth_service.py"
    ports:
      main:
        hint: 8001
        
  api:
    command: "go run api/main.go"
    ports:
      main:
        hint: 8002
```

## 例5: Ruby on Rails

```yaml
version: 1
services:
  rails:
    command: "bundle exec rails server"
    ports:
      main:
        hint: 3000
    env:
      RAILS_ENV: "development"
```

## 例6: Docker Compose との併用

```yaml
version: 1
services:
  app:
    command: "docker-compose up"
    # Dockerが自分でポート管理するので、Neco Porterでは予約しない
```

## ポート指定の方法

### 1. ヒント付き（推奨）
```yaml
ports:
  main:
    hint: 3000  # 3000が使えれば3000、ダメなら他の空きポート
```

### 2. 名前付きポート
```yaml
ports:
  http:
    hint: 8080
  grpc:
    hint: 8081
  metrics:
    hint: 9090
```

### 3. 環境変数へのマッピング
```yaml
# 自動的に以下の環境変数が設定される：
# PORT=<mainポート>
# PORT_HTTP=<httpポート>
# PORT_GRPC=<grpcポート>
# PORT_METRICS=<metricsポート>
```