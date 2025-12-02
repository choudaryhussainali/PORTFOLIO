document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const chatWindow = document.getElementById('chat-window');
    const closeBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');

    // 1. Toggle Window
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            chatWindow.classList.toggle('open');
            if (chatWindow.classList.contains('open')) {
                setTimeout(() => input.focus(), 300);
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => chatWindow.classList.remove('open'));
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTyping() {
        if (typingIndicator) {
            typingIndicator.classList.remove('hidden');
            scrollToBottom();
        }
    }

    function hideTyping() {
        if (typingIndicator) typingIndicator.classList.add('hidden');
    }

    // --- THE FIXED FORMATTER ---
    function formatMessage(text) {
        let formatted = text;

        // 1. Convert Bold (**text**) to <strong>text</strong>
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // 2. Convert Links [Title](URL) -> Supports https, http, mailto, tel
        // The regex \(([^)]+)\) captures anything inside the parentheses
        formatted = formatted.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g, 
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // 3. Convert Bullet Points (* or -) to stylized list items
        formatted = formatted.replace(/^\s*[\-\*]\s+(.*)$/gm, '<div class="chat-list-item">• $1</div>');

        // 4. Convert Newlines to <br> for spacing
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    // 5. Add Message Function
    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.classList.add('message', sender);
        
        // USE INNERHTML TO RENDER LINKS
        div.innerHTML = formatMessage(text);
        
        if (typingIndicator) {
            messagesContainer.insertBefore(div, typingIndicator);
        } else {
            messagesContainer.appendChild(div);
        }
        
        scrollToBottom();
    }

    // 6. Send Logic
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        input.value = '';
        showTyping();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) throw new Error(`Server Error: ${response.status}`);

            const data = await response.json();
            
            hideTyping();
            if (data.reply) {
                addMessage(data.reply, 'bot');
            } else {
                addMessage("I'm not sure how to answer that.", 'bot');
            }

        } catch (error) {
            hideTyping();
            console.error("Chat Error:", error);
            addMessage("⚠️ Connection error. Please try again.", 'bot');
        }
    }

    if (sendBtn && input) {
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});