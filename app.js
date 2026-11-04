const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatWindow = document.querySelector('.chat-window');
const sendButton = form.querySelector('button[type="submit"]');
const conversation = [];

function addMessage(text, sender) {
  const message = document.createElement('div');
  message.className = `message ${sender}`;
  message.textContent = text;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return message;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const userText = input.value.trim();
  if (!userText || sendButton.disabled) return;

  addMessage(userText, 'user');
  input.value = '';
  conversation.push({ role: 'user', content: userText });

  sendButton.disabled = true;
  input.disabled = true;
  sendButton.textContent = 'Enviando…';
  const loadingMessage = addMessage('Jarvis está pensando…', 'bot');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversation.slice(-12) })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo enviar el mensaje. Inténtalo de nuevo.');
    }

    loadingMessage.textContent = data.reply;
    conversation.push({ role: 'assistant', content: data.reply });
  } catch (error) {
    loadingMessage.textContent = error.message || 'Ocurrió un error. Inténtalo de nuevo.';
    conversation.pop();
  } finally {
    sendButton.disabled = false;
    input.disabled = false;
    sendButton.textContent = 'Enviar';
    input.focus();
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});
