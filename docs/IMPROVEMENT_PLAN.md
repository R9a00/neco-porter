# Neco Porter 改善計画

## 現状の課題

### 1. シェルスクリプトの互換性問題
**問題**: macOSのデフォルトbash（3.2）で連想配列が使えない

**解決策**:
- Option A: POSIXシェル準拠のスクリプトに書き直す
- Option B: Node.js製のCLIツールに完全移行
- Option C: 最小限のbash + Node.jsヘルパーの組み合わせ

### 2. 実行環境の検出と対応
**問題**: Python/Ruby/Node.jsなど、各言語の実行環境が複雑

**解決策**:
```yaml
# .necoportrc.yaml - プロジェクト設定ファイル
runtime:
  type: python
  command: .venv/bin/python  # または python3
  
services:
  - name: platform
    ports:
      main: 8000
      auth: 8001
      rbac: 8002
```

### 3. より賢いポート管理
**現在**: 環境変数 `$PORT` に依存

**改善**:
- プロキシサーバーモード（ポートフォワーディング）
- 設定ファイルの自動書き換え
- コマンドライン引数の自動注入

## 提案する新しいアーキテクチャ

### 1. Node.js CLIツール（完全版）
```bash
# インストール
npm install -g neco-porter

# 初期設定（プロジェクトごと）
necoport init

# 実行
necoport run "python app.py"
necoport run --config .necoportrc.yaml
```

### 2. 言語別アダプター
```javascript
// Python用
class PythonAdapter {
  detectRuntime(projectPath) {
    // .venv, venv, virtualenv, pipenv, poetry を検出
    // python vs python3 を判定
  }
  
  injectPorts(command, ports) {
    // 環境変数または引数でポートを注入
  }
}
```

### 3. 設定ファイルサポート
```yaml
# .necoportrc.yaml
version: 2
apps:
  platform:
    runtime: python3
    virtualenv: .venv
    command: python platform_manager.py
    ports:
      - name: main
        env: PLATFORM_PORT
        default: 8000
      - name: auth
        env: AUTH_SERVICE_PORT
        default: 8001
```

### 4. プロキシモード（究極の互換性）
```
[Client] → [Neco Proxy :3000] → [App :random_port]
```
- アプリは任意のポートで起動
- Neco Proxyが3000番でリクエストを受けて転送
- アプリ側の変更が一切不要

## 実装優先順位

1. **Phase 1**: bashスクリプトの修正（互換性向上）
2. **Phase 2**: Node.js CLIへの完全移行
3. **Phase 3**: 設定ファイルサポート
4. **Phase 4**: 言語別アダプター
5. **Phase 5**: プロキシモード

## まとめ

現在のNeco Porterは「シンプルさ」を重視した結果、複雑な環境では課題があります。
しかし、これらの改善により、真に「どんなアプリでも対応できる」ツールに進化できます。

優先すべきは：
1. **互換性**: より多くの環境で動作
2. **柔軟性**: 様々なアプリの要件に対応
3. **簡単さ**: 初期設定は必要でも、使用は簡単に