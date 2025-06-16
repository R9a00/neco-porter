// Neco Porter Launcher - アプリケーション起動管理

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { reserve, release } from '../lib/necoport-v2.js';
import { detectProfile } from './app-profiles.js';

const execAsync = promisify(exec);

export class NecoLauncher {
  constructor() {
    this.runningServices = new Map();
  }

  // 設定ファイルの読み込み（階層的に検索）
  async loadConfig(startPath = process.cwd()) {
    let currentPath = path.resolve(startPath);
    const root = path.parse(currentPath).root;
    
    // 現在のディレクトリから上に向かって検索
    while (currentPath !== root) {
      try {
        const configPath = path.join(currentPath, '.necoport.yaml');
        const content = await fs.readFile(configPath, 'utf8');
        const config = yaml.load(content);
        
        // 設定ファイルのベースパスを記録
        if (config) {
          config._basePath = currentPath;
        }
        
        return config;
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
      
      // 親ディレクトリへ
      currentPath = path.dirname(currentPath);
    }
    
    return null; // 設定ファイルなし
  }

  // 実行環境の自動検出
  async detectRuntime(projectPath) {
    const checks = [
      // Python
      { 
        file: '.venv/bin/python', 
        runtime: 'python', 
        command: '.venv/bin/python' 
      },
      { 
        file: 'venv/bin/python', 
        runtime: 'python', 
        command: 'venv/bin/python' 
      },
      { 
        file: 'requirements.txt', 
        runtime: 'python', 
        command: 'python3' 
      },
      
      // Node.js
      { 
        file: 'package.json', 
        runtime: 'node', 
        command: 'npm' 
      },
      { 
        file: 'yarn.lock', 
        runtime: 'node', 
        command: 'yarn' 
      },
      
      // Ruby
      { 
        file: 'Gemfile', 
        runtime: 'ruby', 
        command: 'bundle exec' 
      },
      
      // Go
      { 
        file: 'go.mod', 
        runtime: 'go', 
        command: 'go run' 
      }
    ];

    for (const check of checks) {
      const filePath = path.join(projectPath, check.file);
      try {
        await fs.access(filePath);
        return {
          runtime: check.runtime,
          command: check.command,
          detected: check.file
        };
      } catch {
        continue;
      }
    }

    return { runtime: 'unknown', command: null };
  }

  // サービスの起動
  async startService(name, options = {}) {
    let {
      command,
      cwd = process.cwd(),
      ports = {},
      env = {}
    } = options;

    // 相対パスの解決
    if (cwd && !path.isAbsolute(cwd)) {
      const config = await this.loadConfig();
      const basePath = config?._basePath || process.cwd();
      cwd = path.resolve(basePath, cwd);
    }

    console.log(`🐱 Starting service: ${name}`);
    if (cwd !== process.cwd()) {
      console.log(`📁 Working directory: ${path.relative(process.cwd(), cwd)}`);
    }

    // アプリケーションプロファイルの検出
    const profile = detectProfile(command);
    if (profile && Object.keys(ports).length === 0) {
      console.log(`🔍 Detected ${profile.description}`);
      ports = profile.ports || {};
      env = { ...profile.env, ...env };
    }

    // ポート予約
    let reservedPorts;
    if (Object.keys(ports).length > 0) {
      reservedPorts = await reserve(name, { ports });
      console.log('📦 Reserved ports:', reservedPorts);
    } else {
      reservedPorts = { main: await reserve(name) };
      console.log(`📦 Reserved port: ${reservedPorts.main}`);
    }

    // 環境変数の準備
    const serviceEnv = {
      ...process.env,
      ...env,
      PORT: reservedPorts.main || reservedPorts[Object.keys(reservedPorts)[0]]
    };

    // 名前付きポートの環境変数
    for (const [portName, portValue] of Object.entries(reservedPorts)) {
      if (portName !== 'main') {
        const envName = `PORT_${portName.toUpperCase()}`;
        serviceEnv[envName] = portValue;
      }
    }

    // コマンドの実行
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      cwd,
      env: serviceEnv,
      stdio: 'inherit'
    });

    const service = {
      name,
      child,
      ports: reservedPorts,
      startTime: new Date()
    };

    this.runningServices.set(name, service);

    // 終了時のクリーンアップ
    child.on('exit', (code) => {
      console.log(`\n${name} exited with code ${code}`);
      this.stopService(name);
    });

    return service;
  }

  // サービスの停止
  async stopService(name) {
    const service = this.runningServices.get(name);
    if (!service) return;

    console.log(`🛑 Stopping service: ${name}`);
    
    // プロセス終了
    if (service.child && !service.child.killed) {
      service.child.kill('SIGTERM');
      
      // 強制終了のタイムアウト
      setTimeout(() => {
        if (!service.child.killed) {
          console.log(`🔨 Force killing ${name}`);
          service.child.kill('SIGKILL');
        }
      }, 5000);
    }

    // ポート解放
    try {
      await release(name);
      console.log(`📦 Released ports for ${name}`);
    } catch (error) {
      console.warn(`Warning: Failed to release ports for ${name}`);
    }

    this.runningServices.delete(name);
  }

  // 全サービスの停止
  async stopAll() {
    const services = Array.from(this.runningServices.keys());
    await Promise.all(services.map(name => this.stopService(name)));
  }

  // サービス一覧
  listServices() {
    const services = [];
    for (const [name, service] of this.runningServices) {
      services.push({
        name,
        pid: service.child.pid,
        ports: service.ports,
        uptime: Math.floor((Date.now() - service.startTime) / 1000),
        status: service.child.killed ? 'stopped' : 'running'
      });
    }
    return services;
  }

  // 設定ファイルからサービス起動
  async runFromConfig(serviceName) {
    const config = await this.loadConfig();
    if (!config || !config.services || !config.services[serviceName]) {
      throw new Error(`Service ${serviceName} not found in config`);
    }

    const serviceConfig = config.services[serviceName];
    return this.startService(serviceName, serviceConfig);
  }

  // プロジェクト全体の起動
  async runAll() {
    const config = await this.loadConfig();
    if (!config || !config.services) {
      throw new Error('No services defined in config');
    }

    const services = [];
    for (const [name, serviceConfig] of Object.entries(config.services)) {
      try {
        const service = await this.startService(name, serviceConfig);
        services.push(service);
        // サービス間の起動間隔
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to start ${name}:`, error.message);
      }
    }

    return services;
  }
}

// グローバルランチャーインスタンス
export const launcher = new NecoLauncher();

// プロセス終了時のクリーンアップ
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down all services...');
  await launcher.stopAll();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await launcher.stopAll();
  process.exit(0);
});