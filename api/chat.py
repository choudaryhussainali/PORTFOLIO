from http.server import BaseHTTPRequestHandler
import json
import os
# Try importing Groq, but handle the error if it's missing
try:
    from groq import Groq
except ImportError:
    Groq = None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # 1. Handle CORS (Allow your website to talk to this script)
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

        # 2. Check if Groq library is installed
        if Groq is None:
            response = {"reply": "Server Error: 'groq' library not found. Did you add requirements.txt?"}
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        # 3. Check for API Key
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            response = {"reply": "Server Error: Missing GROQ_API_KEY in Vercel Settings."}
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        # 4. Parse User Message
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            user_message = data.get('message', '')

            # 5. Call AI
            client = Groq(api_key=api_key)
            
            # (Paste your long System Prompt here)
            system_prompt = "You are Choudary's AI Assistant. Be helpful and professional."

            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                model="llama3-8b-8192",
            )

            bot_reply = chat_completion.choices[0].message.content
            
            # 6. Send Success Response
            self.wfile.write(json.dumps({"reply": bot_reply}).encode('utf-8'))

        except Exception as e:
            # 7. Send Error Response (so the UI knows what happened)
            error_msg = f"Internal Error: {str(e)}"
            self.wfile.write(json.dumps({"reply": error_msg}).encode('utf-8'))

    # Handle Preflight (CORS) requests
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()