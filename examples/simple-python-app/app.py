import os
from http.server import HTTPServer, BaseHTTPRequestHandler

port = int(os.environ.get('PORT', 8000))

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(f'Hello from Python! Running on port {port}\n'.encode())

if __name__ == '__main__':
    server = HTTPServer(('', port), SimpleHandler)
    print(f'Server running at http://localhost:{port}/')
    server.serve_forever()