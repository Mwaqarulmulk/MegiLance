# Minimal server to test HTTP endpoints
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import time
from urllib.parse import urlparse, parse_qs

class SimpleAPI(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        # CORS headers
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        if path == '/':
            response = {"message": "Welcome to the MegiLance API!", "version": "2.0.0"}
        elif path == '/api':
            response = {"message": "MegiLance API", "version": "2.0.0", "docs": "/api/docs", "redoc": "/api/redoc"}
        elif path == '/api/health/live':
            response = {"status": "ok", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
        elif path == '/api/health/ready':
            response = {"status": "ready", "db": "ok", "version": "2.0.0", "environment": "development"}
        elif path == '/api/health/metrics':
            response = {"uptime_seconds": 0, "idempotency_cache_size": 0, "user_cache_size": 0, "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
        else:
            response = {"detail": "Not Found"}
            self.send_response(404)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            self.send_header('Content-type', 'application/json')
            self.end_headers()
        
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

def run_server():
    server_address = ('localhost', 8000)
    httpd = HTTPServer(server_address, SimpleAPI)
    print('Starting server on port 8000...')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()