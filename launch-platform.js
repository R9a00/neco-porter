#!/usr/bin/env node
// expmt-platform-saas 起動スクリプト

import { reserve } from './lib/necoport-v2.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const expmt_path = path.join(__dirname, '..', 'expmt-platform-saas');

console.log('🐱 Neco Porter で expmt-platform-saas を起動します\n');

async function launch() {
  try {
    // ポート予約
    console.log('📦 ポートを予約中...');
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
    
    // Python起動（python3を使用）
    const pythonCmd = process.platform === 'darwin' ? 'python3' : 'python';
    const python = spawn(pythonCmd, ['platform_manager.py'], {
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
      if (err.code === 'ENOENT') {
        console.error('❌ エラー: Pythonが見つかりません');
        console.error('   仮想環境をアクティベートしてから再度実行してください:');
        console.error(`   cd ${expmt_path}`);
        console.error('   source .venv/bin/activate');
        console.error(`   node ${__filename}`);
      } else {
        console.error('❌ エラー:', err);
      }
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