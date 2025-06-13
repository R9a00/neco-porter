// Example: Express server with Neco Porter
import express from 'express';
import { withPort } from '../lib/necoport.js';

async function startServer() {
  await withPort('express-example', async (port) => {
    const app = express();
    
    app.get('/', (req, res) => {
      res.send(`
        <h1>🐱 Hello from Neco Porter!</h1>
        <p>This server is running on port ${port}</p>
        <pre>
  ╱|、
 (˚ˎ 。7   Meow! Port ${port} delivered!
  |、˜〵   
  じしˍ,)ノ
        </pre>
      `);
    });
    
    app.get('/api/status', (req, res) => {
      res.json({
        status: 'running',
        port,
        cat: '(=^･ω･^=)',
        message: 'Server is purring along nicely!'
      });
    });
    
    const server = app.listen(port, () => {
      console.log(`\n(=^･ω･^=) Express server running!`);
      console.log(`Visit: http://localhost:${port}`);
      console.log(`API:   http://localhost:${port}/api/status`);
      console.log(`\nPress Ctrl+C to stop...`);
    });
    
    // Keep server running until interrupted
    await new Promise((resolve) => {
      process.on('SIGINT', () => {
        console.log('\n(=^･ω･^=)ﾉ Shutting down gracefully...');
        server.close(() => resolve());
      });
    });
  });
}

// Run the server
startServer().catch(error => {
  console.error('(=；ω；=) Failed to start server:', error.message);
  console.log('Make sure necoportd is running and express is installed!');
  process.exit(1);
});