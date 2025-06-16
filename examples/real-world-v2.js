// Real-world examples for Neco Porter v2
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientPath = join(__dirname, '..', 'bin', 'necoport-client-v2');

console.log(`
  ╱|、
 (˚ˎ 。7   Real-World v2 Examples
  |、˜〵   Actual development scenarios!
  じしˍ,)ノ
`);

// Example 1: Vite development server with HMR
function viteExample() {
  console.log('\n=== Vite Dev Server with HMR ===');
  console.log('Command that would be run:');
  console.log(`${clientPath} exec vite-app --ports server,hmr npm run dev`);
  console.log('\nThis sets:');
  console.log('  PORT=3001       # Main dev server');
  console.log('  PORT_HMR=3002   # Hot Module Replacement');
  console.log('\nVite config would use:');
  console.log(`
export default {
  server: {
    port: process.env.PORT,
    hmr: {
      port: process.env.PORT_HMR
    }
  }
}`);
}

// Example 2: Full-stack application
function fullStackExample() {
  console.log('\n=== Full-Stack Application ===');
  console.log('package.json scripts:');
  console.log(`
{
  "scripts": {
    "dev": "necoport-client exec myapp --ports frontend,backend,db npm run start-all",
    "start-all": "concurrently npm:frontend npm:backend npm:database",
    "frontend": "vite --port $PORT",
    "backend": "nodemon --port $PORT_BACKEND",
    "database": "docker run -p $PORT_DB:5432 postgres"
  }
}`);
}

// Example 3: Microservices architecture
function microservicesExample() {
  console.log('\n=== Microservices Architecture ===');
  
  console.log('Start each service with its own ports:');
  console.log(`
# API Gateway
${clientPath} exec gateway --ports http,grpc,admin npm start

# User Service  
${clientPath} exec user-service --ports api,grpc,db npm start

# Order Service
${clientPath} exec order-service --ports api,grpc,events npm start

# Notification Service
${clientPath} exec notification --ports api,websocket npm start
`);

  console.log('\nNo port conflicts, even with 12+ ports in use!');
}

// Example 4: Create React App + Express API
function craExpressExample() {
  console.log('\n=== Create React App + Express Backend ===');
  
  console.log('Start both with one command:');
  console.log(`${clientPath} exec fullstack --ports frontend,api npm run dev`);
  
  console.log('\nIn your React app (setupProxy.js):');
  console.log(`
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: \`http://localhost:\${process.env.PORT_API}\`,
      changeOrigin: true,
    })
  );
};`);
  
  console.log('\nIn your Express app:');
  console.log(`
const port = process.env.PORT_API || 4000;
app.listen(port, () => {
  console.log(\`API server running on port \${port}\`);
});`);
}

// Example 5: Docker Compose integration
function dockerComposeExample() {
  console.log('\n=== Docker Compose Integration ===');
  
  console.log('docker-compose.yml:');
  console.log(`
version: '3.8'
services:
  app:
    build: .
    command: necoport-client exec app --ports web,api,ws npm start
    environment:
      - NECOPORTD_URL=http://necoportd:5555
    depends_on:
      - necoportd
      
  necoportd:
    image: neco-porter:v2
    ports:
      - "5555:5555"
    volumes:
      - necoportd-data:/data
      
volumes:
  necoportd-data:`);
}

// Example 6: Testing with multiple ports
function testingExample() {
  console.log('\n=== Testing with Multiple Ports ===');
  
  console.log('Run tests with isolated ports:');
  console.log(`${clientPath} exec test --ports app,db,redis npm test`);
  
  console.log('\nIn your test setup:');
  console.log(`
beforeAll(async () => {
  // Start test servers
  app = await startApp(process.env.PORT);
  db = await startTestDB(process.env.PORT_DB);
  redis = await startRedis(process.env.PORT_REDIS);
});`);
}

// Interactive demo
async function interactiveDemo() {
  console.log('\n=== Interactive Demo ===');
  console.log('Starting a mock multi-port application...\n');
  
  const proc = spawn(clientPath, [
    'exec', 'demo-app',
    '--ports', 'web,api,ws,metrics',
    'bash', '-c',
    `echo "Demo app started with:"
     echo "  Web:      http://localhost:$PORT"
     echo "  API:      http://localhost:$PORT_API"
     echo "  WS:       ws://localhost:$PORT_WS"
     echo "  Metrics:  http://localhost:$PORT_METRICS/metrics"
     echo ""
     echo "Press Ctrl+C to stop..."
     sleep 10`
  ], { stdio: 'inherit' });
  
  await new Promise((resolve) => {
    proc.on('close', resolve);
  });
}

// Run examples
async function main() {
  viteExample();
  fullStackExample();
  microservicesExample();
  craExpressExample();
  dockerComposeExample();
  testingExample();
  
  console.log('\n=== Want to try it? ===');
  console.log('1. Make sure necoportd v2 is running:');
  console.log('   ./src/necoportd-v2.js &\n');
  console.log('2. Run the interactive demo:');
  console.log('   node examples/real-world-v2.js --demo\n');
  
  if (process.argv.includes('--demo')) {
    await interactiveDemo();
  }
  
  console.log('\n(=^･ω･^=) Happy coding with Neco Porter v2!');
}

main().catch(console.error);