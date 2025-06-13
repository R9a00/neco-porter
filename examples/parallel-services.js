// Example: Running multiple services in parallel
import { reserve, release, list } from '../lib/necoport.js';
import { spawn } from 'child_process';

console.log(`
  ╱|、
 (˚ˎ 。7   Starting multiple services...
  |、˜〵   
  じしˍ,)ノ
`);

// Service definitions
const services = [
  { name: 'frontend', command: 'npx', args: ['http-server', '-p', '$PORT'], hint: 3000 },
  { name: 'api', command: 'node', args: ['api-mock.js'], hint: 3001 },
  { name: 'docs', command: 'npx', args: ['http-server', '-p', '$PORT'], hint: 3002 }
];

// Start all services
async function startServices() {
  const runningServices = [];
  
  for (const service of services) {
    try {
      // Reserve port
      const port = await reserve(service.name, service.hint);
      console.log(`(=^･ω･^=) ${service.name} got port ${port}`);
      
      // Replace $PORT in args
      const args = service.args.map(arg => 
        arg === '$PORT' ? port.toString() : arg
      );
      
      // Set PORT environment variable
      const env = { ...process.env, PORT: port.toString() };
      
      // Start the service
      const proc = spawn(service.command, args, { 
        env,
        stdio: 'inherit'
      });
      
      runningServices.push({
        name: service.name,
        process: proc,
        port
      });
      
    } catch (error) {
      console.error(`(=；ω；=) Failed to start ${service.name}:`, error.message);
    }
  }
  
  // Show all running services
  console.log('\n=== All Services Running ===');
  const ports = await list();
  ports.forEach(p => {
    console.log(`${p.cat} ${p.name} on port ${p.port}`);
  });
  
  console.log('\nPress Ctrl+C to stop all services...');
  
  // Handle shutdown
  process.on('SIGINT', async () => {
    console.log('\n(=^･ω･^=)ﾉ Stopping all services...');
    
    // Kill all processes
    for (const service of runningServices) {
      service.process.kill();
      await release(service.name);
      console.log(`(=･ω･=) ${service.name} stopped`);
    }
    
    process.exit(0);
  });
  
  // Keep running
  await new Promise(() => {});
}

// Mock API server
if (process.argv[1].endsWith('api-mock.js')) {
  const port = process.env.PORT || 3001;
  console.log(`Mock API server would run on port ${port}`);
  // Keep process alive
  setInterval(() => {}, 1000);
} else {
  // Run the example
  startServices().catch(error => {
    console.error('(=；ω；=) Error:', error.message);
    process.exit(1);
  });
}