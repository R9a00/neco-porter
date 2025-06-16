// よく知られたアプリケーションのプロファイル

export const appProfiles = {
  
  // Django開発サーバー
  'manage.py runserver': {
    name: 'django-dev',
    ports: {
      main: { hint: 8000 }
    },
    env: {},
    description: 'Django Development Server'
  },
  
  // Next.js
  'next dev': {
    name: 'nextjs-dev',
    ports: {
      main: { hint: 3000 },
      hmr: { hint: 3001 }
    },
    env: {},
    description: 'Next.js Development Server'
  },
  
  // Vite
  'vite': {
    name: 'vite-dev',
    ports: {
      main: { hint: 5173 },
      hmr: { hint: 5174 }
    },
    env: {},
    description: 'Vite Development Server'
  },
  
  // Create React App
  'react-scripts start': {
    name: 'cra-dev',
    ports: {
      main: { hint: 3000 }
    },
    env: {},
    description: 'Create React App'
  },
  
  // Rails
  'rails server': {
    name: 'rails-dev',
    ports: {
      main: { hint: 3000 }
    },
    env: {},
    description: 'Ruby on Rails Server'
  },
  
  // FastAPI
  'uvicorn': {
    name: 'fastapi',
    ports: {
      main: { hint: 8000 }
    },
    env: {},
    description: 'FastAPI Application'
  },
  
  // Flask
  'flask run': {
    name: 'flask-dev',
    ports: {
      main: { hint: 5000 }
    },
    env: {},
    description: 'Flask Development Server'
  }
};

// コマンドからプロファイルを検出
export function detectProfile(command) {
  // 特定のファイル名パターンで複数ポートを推測
  if (command.includes('platform_manager.py')) {
    return {
      name: 'platform-manager',
      ports: {
        main: { hint: 8000 },
        auth: { hint: 8001 },
        rbac: { hint: 8002 },
        testapp: { hint: 8003 }
      },
      env: {
        PLATFORM_PORT: '8000',
        AUTH_SERVICE_PORT: '8001',
        RBAC_SERVICE_PORT: '8002',  
        TEST_APP_PORT: '8003'
      },
      description: 'Platform Manager (auto-detected)'
    };
  }
  
  for (const [pattern, profile] of Object.entries(appProfiles)) {
    if (command.includes(pattern)) {
      return profile;
    }
  }
  return null;
}

// プロジェクトファイルからプロファイルを推測
export async function detectProjectProfile(projectPath) {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  try {
    // platform_manager.py の存在をチェック
    await fs.access(path.join(projectPath, 'platform_manager.py'));
    return appProfiles['platform_manager.py'];
  } catch {}
  
  try {
    // package.json をチェック
    const packageJson = JSON.parse(
      await fs.readFile(path.join(projectPath, 'package.json'), 'utf8')
    );
    
    // scripts をチェック
    if (packageJson.scripts?.dev?.includes('next')) {
      return appProfiles['next dev'];
    }
    if (packageJson.scripts?.dev?.includes('vite')) {
      return appProfiles['vite'];
    }
    if (packageJson.scripts?.start?.includes('react-scripts')) {
      return appProfiles['react-scripts start'];
    }
  } catch {}
  
  return null;
}