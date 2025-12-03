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

    // 3. Smart Message Formatter (Regex Fix)
    function formatMessage(text) {
        let formatted = text;

        // 0. Normalize newlines (prevent huge gaps)
        formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');

        // A. Convert Bold (**text**) to <strong>text</strong>
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // B. Convert Markdown Links [Title](URL)
        formatted = formatted.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g, 
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // C. Convert Raw URLs (https://...) NOT already in tags
        // Negative lookbehind (?<!...) matches only if NOT preceded by quote, equals, or space
        // \b ensures we start at a word boundary
        formatted = formatted.replace(
            /(?<!["'= >])\b(https?:\/\/[^\s<]+)/g, 
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // D. Convert Email Addresses NOT already in tags
        // Critical Fix: \b at start prevents matching substring "houdary" inside "choudary"
        // Critical Fix: > in lookbehind prevents matching text inside existing anchor tags
        formatted = formatted.replace(
            /(?<!["'= :>])\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
            '<a href="mailto:$1">$1</a>'
        );

        // E. Convert Bullet Points (handle *, -, and •)
        formatted = formatted.replace(/^\s*[\-\*•]\s+(.*)$/gm, '<div class="chat-list-item">• $1</div>');

        // F. Convert Newlines
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

    // 5. Typewriter Effect (DOM Walker Version) - For Bot
    function typeBotMessage(text) {
        const div = document.createElement('div');
        div.classList.add('message', 'bot');
        
        if (typingIndicator) {
            messagesContainer.insertBefore(div, typingIndicator);
        } else {
            messagesContainer.appendChild(div);
        }

        // Parse HTML into a Shadow DOM / Temp div
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formatMessage(text);
        
        // Recursive Typing Function
        function typeNode(node, targetElement) {
            return new Promise(resolve => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const textContent = node.textContent;
                    let charIndex = 0;
                    
                    function typeChar() {
                        if (charIndex < textContent.length) {
                            targetElement.append(textContent.charAt(charIndex));
                            charIndex++;
                            scrollToBottom();
                            setTimeout(typeChar, 10); // Typing Speed
                        } else {
                            resolve();
                        }
                    }
                    typeChar();
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node.cloneNode(false); // Clone tag without content
                    targetElement.appendChild(element);
                    
                    // Process children sequentially
                    // We use reduce to chain promises
                    Array.from(node.childNodes).reduce((promise, child) => {
                        return promise.then(() => typeNode(child, element));
                    }, Promise.resolve()).then(resolve);
                } else {
                    resolve();
                }
            });
        }

        // Start typing process
        Array.from(tempDiv.childNodes).reduce((promise, child) => {
            return promise.then(() => typeNode(child, div));
        }, Promise.resolve());
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