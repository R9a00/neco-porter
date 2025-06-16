#!/usr/bin/env node
// ポート管理デモ

import { reserve, release, list } from './lib/necoport-v2.js';

console.log('🐱 Neco Porter v2 ポート管理デモ\n');

async function demo() {
  try {
    // 1. 複数のアプリでポートを予約
    console.log('=== ステップ1: 複数アプリでポート予約 ===\n');
    
    // アプリ1: 名前付きポート
    const app1Ports = await reserve('app1', {
      ports: {
        web: { hint: 3000 },
        api: { hint: 3001 },
        db: { hint: 5432 }
      }
    });
    console.log('App1 (Web+API+DB):');
    console.log(`  Web: ${app1Ports.web}`);
    console.log(`  API: ${app1Ports.api}`);
    console.log(`  DB: ${app1Ports.db}\n`);
    
    // アプリ2: カウントベース
    const app2Ports = await reserve('app2', { count: 3 });
    console.log('App2 (3ポート):');
    Object.entries(app2Ports).forEach(([idx, port]) => {
      console.log(`  Port ${idx}: ${port}`);
    });
    console.log();
    
    // アプリ3: 追加のサービス
    const app3Ports = await reserve('app3', {
      ports: {
        frontend: {},
        backend: {},
        cache: {}
      }
    });
    console.log('App3 (Frontend+Backend+Cache):');
    console.log(`  Frontend: ${app3Ports.frontend}`);
    console.log(`  Backend: ${app3Ports.backend}`);
    console.log(`  Cache: ${app3Ports.cache}\n`);
    
    // 2. 現在の予約状況を表示
    console.log('=== ステップ2: 予約状況確認 ===\n');
    const allReservations = await list();
    
    console.log('現在のポート予約状況:');
    allReservations.forEach(reservation => {
      console.log(`\n${reservation.cat} ${reservation.name}:`);
      if (reservation.ports) {
        Object.entries(reservation.ports).forEach(([name, port]) => {
          console.log(`    ${name}: ${port}`);
        });
      }
    });
    
    // 3. ポートの重複チェック
    console.log('\n\n=== ステップ3: 重複防止の確認 ===\n');
    const allPorts = new Set();
    let hasDuplicate = false;
    
    allReservations.forEach(reservation => {
      if (reservation.ports) {
        Object.values(reservation.ports).forEach(port => {
          if (allPorts.has(port)) {
            console.log(`❌ 重複発見: ポート ${port}`);
            hasDuplicate = true;
          }
          allPorts.add(port);
        });
      }
    });
    
    if (!hasDuplicate) {
      console.log('✅ すべてのポートは重複なく割り当てられています！');
      console.log(`   合計 ${allPorts.size} 個のユニークなポート`);
    }
    
    // 4. 一部解放してみる
    console.log('\n\n=== ステップ4: ポート解放 ===\n');
    await release('app2');
    console.log('✓ App2のポートを解放しました');
    
    // 5. 新しいアプリが解放されたポートを使えるか確認
    console.log('\n=== ステップ5: 解放されたポートの再利用 ===\n');
    try {
      const app4Ports = await reserve('app4', { count: 2 });
      console.log('App4 (2ポート):');
      Object.entries(app4Ports).forEach(([idx, port]) => {
        console.log(`  Port ${idx}: ${port}`);
      });
    } catch (error) {
      console.error('App4予約エラー:', error.message);
      console.error('詳細:', error);
      // エラー時は続行しない
      return;
    }
    
    // 最終状態
    console.log('\n\n=== 最終状態 ===\n');
    const finalList = await list();
    console.log(`アクティブなアプリ数: ${finalList.length}`);
    console.log(`使用中のポート総数: ${finalList.reduce((sum, r) => 
      sum + (r.ports ? Object.keys(r.ports).length : 0), 0)}`);
    
    // クリーンアップ
    console.log('\n\n=== クリーンアップ ===\n');
    await Promise.all([
      release('app1'),
      release('app3'),
      release('app4')
    ]);
    console.log('✓ すべてのポートを解放しました');
    
  } catch (error) {
    console.error('エラー:', error.message);
  }
}

// デモ実行
demo().then(() => {
  console.log('\n\n🎉 デモ完了！');
  process.exit(0);
});