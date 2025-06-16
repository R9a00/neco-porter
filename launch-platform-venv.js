#!/usr/bin/env node
// expmt-platform-saas 起動スクリプト（仮想環境対応版）

import { reserve } from './lib/necoport-v2.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const expmt_path = path.join(__dirname, '..', 'expmt-platform-saas');

console.log('🐱 Neco Porter で expmt-platform-saas を起動します\n');

async function launch() {
  try {
    // 仮想環境のPythonパスを探す
    const venvPython = path.join(expmt_path, '.venv', 'bin', 'python');
    const venvPython3 = path.join(expmt_path, '.venv', 'bin', 'python3');
    
    let pythonPath;
    if (fs.existsSync(venvPython)) {
      pythonPath = venvPython;
      console.log('✅ 仮想環境のPythonを使用:', venvPython);
    } else if (fs.existsSync(venvPython3)) {
      pythonPath = venvPython3;
      console.log('✅ 仮想環境のPython3を使用:', venvPython3);
    } else {
      // フォールバック
      pythonPath = 'python3';
      console.log('⚠️  仮想環境のPythonが見つかりません。システムのpython3を使用');
    }
    
    // ポート予約
    console.log('\n📦 ポートを予約中...');
    const ports = await reserve('platform', {
      ports: {
        main: { hint: 8000 },
        auth: { hint: 8001 },
        rbac: { hint: 8002 },
        testapp: { hint: 8003 }
      }
    });
    
    console.log('\n✅ ポート予約完了:');
    console.log(`   Platform Manager: http://localhost:${ports.main}`);
    console.log(`   Auth Service: http://localhost:${ports.auth}/docs`);
    console.log(`   RBAC Service: http://localhost:${ports.rbac}/docs`);
    console.log(`   Test App: http://localhost:${ports.testapp}`);
    console.log();
    
    // 環境変数の設定
    const env = {
      ...process.env,
      PORT: ports.main,
      PLATFORM_PORT: ports.main,
      AUTH_SERVICE_PORT: ports.auth,
      RBAC_SERVICE_PORT: ports.rbac,
      TEST_APP_PORT: ports.testapp,
      PYTHONPATH: expmt_path
    };
    
    console.log('🚀 Platform Manager を起動中...\n');
    
    // Python起動
    const python = spawn(pythonPath, ['platform_manager.py'], {
      cwd: expmt_path,
      env: env,
      stdio: 'inherit'
    });
    
    // 終了処理
    process.on('SIGINT', () => {
      console.log('\n\n🛑 シャットダウン中...');
      python.kill('SIGINT');
      process.exit(0);
    });
    
    python.on('error', (err) => {
      console.error('❌ エラー:', err);
      console.error('\n💡 ヒント:');
      console.error('   1. expmt-platform-saasディレクトリで仮想環境を作成:');
      console.error(`      cd ${expmt_path}`);
      console.error('      python3 -m venv .venv');
      console.error('   2. 依存関係をインストール:');
      console.error('      .venv/bin/pip install -r requirements.txt');
      process.exit(1);
    });
    
    python.on('exit', (code) => {
      console.log(`Platform Manager が終了しました (code: ${code})`);
      process.exit(code);
    });
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    process.exit(1);
  }
}

launch();