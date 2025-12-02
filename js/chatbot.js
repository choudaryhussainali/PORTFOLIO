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

        // Add User Message
        addMessage(text, 'user');
        input.value = ''; // Clear input immediately
        scrollToBottom(); // Scroll down to see it

        // Add Loading Bubble
        const loadingId = addMessage("Thinking...", 'bot', true);
        scrollToBottom();

        try {
            // Simulate API Call (Replace with real fetch later)
            // const response = await fetch('/api/chat', ...);
            
            // For now, simulated response for testing UI:
            setTimeout(() => {
                removeMessage(loadingId);
                addMessage("I am currently a demo UI. Connect me to Vercel/Groq to make me smart!", 'bot');
            }, 1500);

        } catch (error) {
            removeMessage(loadingId);
            addMessage("Error connecting to AI.", 'bot');
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