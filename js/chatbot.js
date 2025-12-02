document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const chatWindow = document.getElementById('chat-window');
    const closeBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    
    // 1. Get the HTML Typing Indicator (The Neon Dots)
    const typingIndicator = document.getElementById('typing-indicator');

    // 2. Toggle Window Logic
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            chatWindow.classList.toggle('open');
            if (chatWindow.classList.contains('open')) {
                setTimeout(() => input.focus(), 300); // Auto-focus input
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            chatWindow.classList.remove('open');
        });
    }

    // 3. Auto Scroll Function
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // 4. UI Helpers for Typing Indicator
    function showTyping() {
        // Remove the 'hidden' class we added in CSS to show the neon dots
        if(typingIndicator) {
            typingIndicator.classList.remove('hidden');
            scrollToBottom();
        }
    }

    function hideTyping() {
        // Add the 'hidden' class back to hide the dots
        if(typingIndicator) {
            typingIndicator.classList.add('hidden');
        }
    }

    function formatMessage(text) {
        // 1. Convert Bold (**text**) to <strong>text</strong>
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // 2. Convert Links [Title](URL) to <a href="URL" target="_blank">Title</a>
        formatted = formatted.replace(
            /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, 
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // 3. Convert Newlines to <br>
        formatted = formatted.replace(/\n/g, '<br>');

        // 4. Convert Bullet Points (* text) to • text with spacing
        formatted = formatted.replace(/^\s*[\-\*]\s+(.*)$/gm, '• $1');

        return formatted;
    }

    // 5. Add Message Function (Inserts BEFORE the dots)
    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.classList.add('message', sender);
        div.innerText = text;
        
        // IMPORTANT: Insert the new message BEFORE the typing indicator
        // This ensures the dots always stay at the very bottom
        if (typingIndicator) {
            messagesContainer.insertBefore(div, typingIndicator);
        } else {
            messagesContainer.appendChild(div);
        }
        
        scrollToBottom();
    }

    // 6. Main Send Logic
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // A. User Message
        addMessage(text, 'user');
        input.value = '';
        
        // B. Show Neon Dots
        showTyping();

        try {
            // C. API Call to Vercel
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) throw new Error(`Server Error: ${response.status}`);

            const data = await response.json();
            
            // D. Hide Dots & Show Bot Reply
            hideTyping();
            
            if (data.reply) {
                addMessage(data.reply, 'bot');
            } else {
                addMessage("I'm not sure how to answer that yet.", 'bot');
            }

        } catch (error) {
            hideTyping();
            console.error("Chat Error:", error);
            addMessage("⚠️ Sorry, I can't connect to the server right now.", 'bot');
        }
    }

    // 7. Event Listeners
    if (sendBtn && input) {
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});