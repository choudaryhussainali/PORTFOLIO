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

    // 2. Thinking Effect
    function showTyping() {
        if (typingIndicator) {
            typingIndicator.classList.remove('hidden');
            scrollToBottom();
        }
    }

    function hideTyping() {
        if (typingIndicator) typingIndicator.classList.add('hidden');
    }

    // 3. Smart Message Formatter (The Fix)
    function formatMessage(text) {
        let formatted = text;

        // A. Convert Bold (**text**) to <strong>text</strong>
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // B. Convert Markdown Links [Title](URL) first
        formatted = formatted.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g, 
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // C. Convert Raw URLs (https://...) that are NOT already inside an HTML tag
        // The regex (?<!["'>]) checks that the URL isn't part of href="..."
        formatted = formatted.replace(
            /(?<!["'>])(https?:\/\/[^\s<]+)/g, 
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // D. Convert Email Addresses
        formatted = formatted.replace(
            /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g,
            '<a href="mailto:$1">$1</a>'
        );

        // E. Convert Bullet Points (* or -) to stylized list items
        formatted = formatted.replace(/^\s*[\-\*]\s+(.*)$/gm, '<div class="chat-list-item">• $1</div>');

        // F. Convert Newlines to <br> for spacing
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

        // Pre-format the text into HTML
        const htmlContent = formatMessage(text);
        
        // Split logic: We want to "type" text but "print" tags instantly
        // Regex splits by HTML tags, keeping the tags in the array
        const tokens = htmlContent.split(/(<[^>]+>)/g).filter(Boolean);
        
        let tokenIndex = 0;
        let charIndex = 0;

        function typeNextChar() {
            if (tokenIndex >= tokens.length) {
                scrollToBottom();
                return; 
            }

            const currentToken = tokens[tokenIndex];

            if (currentToken.startsWith('<')) {
                // Is a Tag? Append instantly.
                div.innerHTML += currentToken;
                tokenIndex++;
                typeNextChar(); 
            } else {
                // Is Text? Type it out.
                div.innerHTML += currentToken.charAt(charIndex);
                charIndex++;
                scrollToBottom();

                if (charIndex < currentToken.length) {
                    setTimeout(typeNextChar, 10); // Faster typing speed
                } else {
                    charIndex = 0;
                    tokenIndex++;
                    setTimeout(typeNextChar, 10);
                }
            }
        }

        // Start
        typeNextChar();
    }

    // 6. Send Logic
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addUserMessage(text);
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