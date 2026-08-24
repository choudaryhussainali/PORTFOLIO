# -*- coding: utf-8 -*-
"""Local preview server that behaves like the deployed site.

    python tools/serve.py            # http://127.0.0.1:8000
    python tools/serve.py 8080       # a different port

`python -m http.server` is fine for looking at pages, but it answers anything
missing with its own built-in "Error response" body and has no way to override
that. So 404.html can never actually be seen locally, and it looks broken when
it is not. This serves 404.html with a real 404 status instead, which is what
Vercel does, so what you see here is what visitors get.

It also resolves extensionless paths — /projects as well as /projects/ — again
matching Vercel, where `python -m http.server` 404s the first form.

Static preview only. api/chat.py is a serverless function and does not run
here, so the chatbot will open and fail to reply; that is expected.
"""
import functools
import http.server
import os
import socketserver
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        local = super().translate_path(path)
        # /projects -> /projects/index.html, the way a host would resolve it
        if not os.path.exists(local) and not os.path.splitext(local)[1]:
            for candidate in (local + ".html", os.path.join(local, "index.html")):
                if os.path.isfile(candidate):
                    return candidate
        return local

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            page = os.path.join(ROOT, "404.html")
            if os.path.isfile(page):
                with open(page, "rb") as fh:
                    body = fh.read()
                self.send_response(404)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                if self.command != "HEAD":
                    self.wfile.write(body)
                return
        super().send_error(code, message, explain)

    def log_message(self, fmt, *args):
        status = str(args[1]) if len(args) > 1 else ""
        mark = "  " if status.startswith("2") else "! "
        sys.stdout.write(f"{mark}{args[1] if len(args) > 1 else ''}  {args[0]}\n")
        sys.stdout.flush()


def main() -> None:
    socketserver.TCPServer.allow_reuse_address = True
    handler = functools.partial(Handler, directory=ROOT)
    try:
        with socketserver.TCPServer(("127.0.0.1", PORT), handler) as httpd:
            print(f"serving {ROOT}")
            print(f"  http://127.0.0.1:{PORT}")
            print("  unknown paths get 404.html with a 404 status, as in production")
            print("  ctrl-c to stop\n")
            httpd.serve_forever()
    except OSError as err:
        sys.exit(f"could not bind port {PORT}: {err}\n"
                 f"something else is probably using it — try: python tools/serve.py {PORT + 1}")
    except KeyboardInterrupt:
        print("\nstopped")


if __name__ == "__main__":
    main()
