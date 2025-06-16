#!/usr/bin/env node
// expmt-platform-saas との統合デモ

import { reserve, release, list } from './lib/necoport-v2.js';
import { spawn } from 'child_process';

console.log('🐱 Neco Porter × expmt-platform-saas 統合デモ\n');

async function demo() {
  try {
    console.log('=== ステップ1: 必要なポートを予約 ===\n');
    
    // Platform Manager用のポート予約
    const platformPorts = await reserve('platform-manager', {
      ports: {
        main: { hint: 8000 },     // Platform Manager メイン
        auth: { hint: 8001 },     // Auth Service
        rbac: { hint: 8002 },     // RBAC Service
        testapp: { hint: 8003 },  // Simple Test App
        db: { hint: 5432 }        // PostgreSQL
      }
    });
    
    console.log('Platform Manager ポート構成:');
    console.log(`  メインサービス: ${platformPorts.main}`);
    console.log(`  認証サービス: ${platformPorts.auth}`);
    console.log(`  RBAC管理: ${platformPorts.rbac}`);
    console.log(`  テストアプリ: ${platformPorts.testapp}`);
    console.log(`  データベース: ${platformPorts.db}`);
    console.log();
    
    // 追加のマイクロサービス用ポート
    const microservices = await reserve('microservices', {
      ports: {
        api1: {},
        api2: {},
        metrics: {},
        websocket: {}
      }
    });
    
    console.log('追加マイクロサービス:');
    Object.entries(microservices).forEach(([name, port]) => {
      console.log(`  ${name}: ${port}`);
    });
    console.log();
    
    console.log('=== ステップ2: ポート重複チェック ===\n');
    
    const allReservations = await list();
    const allPorts = new Set();
    let conflicts = 0;
    
    allReservations.forEach(res => {
      if (res.ports) {
        Object.values(res.ports).forEach(port => {
          if (allPorts.has(port)) {
            console.log(`❌ 重複: ポート ${port}`);
            conflicts++;
          }
          allPorts.add(port);
        });
      }
    });
    
    if (conflicts === 0) {
      console.log('✅ すべてのポートが重複なく割り当てられています！');
      console.log(`   合計 ${allPorts.size} 個のポートを管理中`);
    }
    console.log();
    
    console.log('=== ステップ3: 起動コマンド例 ===\n');
    
    console.log('# Platform Manager起動（環境変数でポート指定）:');
    console.log(`PLATFORM_PORT=${platformPorts.main} \\`);
    console.log(`AUTH_SERVICE_PORT=${platformPorts.auth} \\`);
    console.log(`RBAC_SERVICE_PORT=${platformPorts.rbac} \\`);
    console.log(`TEST_APP_PORT=${platformPorts.testapp} \\`);
    console.log(`DB_PORT=${platformPorts.db} \\`);
    console.log('python platform_manager.py');
    console.log();
    
    console.log('# または、necoport-clientを使用:');
    console.log('necoport-client exec platform --ports main:8000,auth:8001,rbac:8002,testapp:8003,db:5432 \\');
    console.log('  python platform_manager.py');
    console.log();
    
    console.log('=== ステップ4: クリーンアップ ===\n');
    
    await release('platform-manager');
    await release('microservices');
    console.log('✓ すべてのポートを解放しました');
    
  } catch (error) {
    console.error('エラー:', error.message);
  }
}

// デモ実行
demo().then(() => {
  console.log('\n🎉 統合デモ完了！');
  console.log('\nNeco Porterを使うことで、複数のサービスのポート管理が');
  console.log('シンプルかつ確実に行えることが確認できました。');
  process.exit(0);
});