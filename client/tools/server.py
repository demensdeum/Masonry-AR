#!/usr/bin/env python3

# NoCacheHTTPServer.py

import http.server
import socketserver

IP_ADDRESS = '127.0.0.1'
PORT = 8000

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def send_response_only(self, code, message=None):
        super().send_response_only(code, message)
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        self.allow_reuse_address = True

if __name__ == '__main__':
    server_address = (IP_ADDRESS, PORT)
    httpd = socketserver.TCPServer(server_address, NoCacheHTTPRequestHandler)
    
    print(f"Serving on {IP_ADDRESS}:{PORT}...")
    httpd.serve_forever()