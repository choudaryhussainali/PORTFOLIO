document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const chatWindow = document.getElementById('chat-window');
    const closeBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');

    // 1. Toggle Window
    toggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        if (chatWindow.classList.contains('open')) {
            setTimeout(() => input.focus(), 100); // Focus input for UX
        }
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });

    // 2. Auto Scroll Function (Crucial)
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // 3. Send Logic
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // A. Add User Message to UI
        addMessage(text, 'user');
        input.value = ''; // Clear input immediately
        input.focus();    // Keep focus for rapid typing
        scrollToBottom(); // Scroll down to see it

        // B. Add Loading Bubble ("Thinking...")
        const loadingId = addMessage("Thinking...", 'bot', true);
        scrollToBottom();

        try {
            // C. REAL API CALL to your Vercel Backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });

            // Check if the server responded with an error (e.g., 500 or 404)
            if (!response.ok) {
                throw new Error(`Server Error: ${response.status}`);
            }

            const data = await response.json();
            
            // D. Remove "Thinking..." and Add AI Response
            removeMessage(loadingId);
            
            if (data.reply) {
                addMessage(data.reply, 'bot');
            } else {
                addMessage("I didn't get a response. Please try again.", 'bot');
            }

        } catch (error) {
            // E. Error Handling (Network failure, API limits, etc.)
            removeMessage(loadingId);
            console.error("Chat Error:", error);
            addMessage("⚠️ Sorry, I'm having trouble connecting to the AI server. Please check your internet or try again later.", 'bot');
        }
    }

    // 4. Message Builder
    function addMessage(text, sender, isLoading = false) {
        const div = document.createElement('div');
        div.classList.add('message', sender);
        div.innerText = text;
        
        if (isLoading) {
            div.id = 'loading-msg';
            div.style.fontStyle = 'italic';
            div.style.opacity = '0.7';
        }

        messagesContainer.appendChild(div);
        scrollToBottom(); // Ensure visibility
        return div.id;
    }

    function removeMessage(id) {
        const el = document.getElementById('loading-msg');
        if (el) el.remove();
    }

    // 5. Event Listeners
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});