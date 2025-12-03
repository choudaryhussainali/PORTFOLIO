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

    // 2. Thinking Effect (The Dots)
    function showTyping() {
        if (typingIndicator) {
            typingIndicator.classList.remove('hidden');
            scrollToBottom();
        }
    }

    function hideTyping() {
        if (typingIndicator) typingIndicator.classList.add('hidden');
    }

    // 3. Message Formatter (Markdown -> HTML)
    function formatMessage(text) {
        let formatted = text;
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g, 
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        formatted = formatted.replace(/^\s*[\-\*]\s+(.*)$/gm, '<div class="chat-list-item">• $1</div>');
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
    }

    // 4. Standard Add Message (Instant) - For User
    function addUserMessage(text) {
        const div = document.createElement('div');
        div.classList.add('message', 'user');
        div.innerHTML = formatMessage(text);
        
        if (typingIndicator) {
            messagesContainer.insertBefore(div, typingIndicator);
        } else {
            messagesContainer.appendChild(div);
        }
        scrollToBottom();
    }

    // 5. Typewriter Effect (Animated) - For Bot
    function typeBotMessage(text) {
        const div = document.createElement('div');
        div.classList.add('message', 'bot');
        
        // Insert empty div first
        if (typingIndicator) {
            messagesContainer.insertBefore(div, typingIndicator);
        } else {
            messagesContainer.appendChild(div);
        }

        const htmlContent = formatMessage(text);
        
        // Regex to split HTML tags from text
        // This creates an array like: ["Hello ", "<strong>", "World", "</strong>"]
        const tokens = htmlContent.split(/(<[^>]+>)/g).filter(Boolean);
        
        let tokenIndex = 0;
        let charIndex = 0;

        function typeNextChar() {
            if (tokenIndex >= tokens.length) {
                scrollToBottom();
                return; // Done
            }

            const currentToken = tokens[tokenIndex];

            if (currentToken.startsWith('<')) {
                // If it's an HTML tag, append the WHOLE tag instantly (don't type it)
                div.innerHTML += currentToken;
                tokenIndex++;
                typeNextChar(); // Recursively call immediately
            } else {
                // If it's text, append one character
                div.innerHTML += currentToken.charAt(charIndex);
                charIndex++;
                scrollToBottom();

                if (charIndex < currentToken.length) {
                    setTimeout(typeNextChar, 15); // Typing speed (ms)
                } else {
                    charIndex = 0;
                    tokenIndex++;
                    setTimeout(typeNextChar, 15); // Pause between tokens
                }
            }
        }

        // Start typing
        typeNextChar();
    }

    // 6. Send Logic
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // User message appears instantly
        addUserMessage(text);
        input.value = '';
        
        // Show the 3 dots while waiting
        showTyping();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) throw new Error(`Server Error: ${response.status}`);

            const data = await response.json();
            
            // Hide dots -> Start Typing Response
            hideTyping();
            
            if (data.reply) {
                typeBotMessage(data.reply);
            } else {
                typeBotMessage("I'm not sure how to answer that.");
            }

        } catch (error) {
            hideTyping();
            console.error("Chat Error:", error);
            typeBotMessage("⚠️ Connection error. Please try again.");
        }
    }

    if (sendBtn && input) {
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});