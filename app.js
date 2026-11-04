const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatWindow = document.querySelector('.chat-window');
const sendButton = form.querySelector('button[type="submit"]');
const clearButton = document.getElementById('clear-chat');
const modeLabel = document.getElementById('chat-mode');
const suggestions = document.querySelector('.suggestions');
const conversation = [];

function addMessage(text, sender, { loading = false } = {}) {
  const message = document.createElement('div');
  message.className = `message ${sender}${loading ? ' is-loading' : ''}`;
  if (sender === 'bot') {
    const avatar = document.createElement('span');
    avatar.className = 'message-avatar';
    avatar.textContent = 'J';
    message.appendChild(avatar);
  }
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;
  message.appendChild(bubble);
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return { message, bubble };
}

function localReply(text) {
  const normalized = text.toLocaleLowerCase('es');
  if (/\b(hola|buenas|buenos días|buenas tardes|buenas noches|hey)\b/.test(normalized)) {
    return '¡Hola! Me alegra que estés aquí. Cuéntame qué tienes en mente y lo pensamos juntos.';
  }
  if (/\b(organiza|organizar|planifica|planificar|tareas|día|semana)\b/.test(normalized)) {
    return '¡Vamos paso a paso! 1) Anota todo lo que tienes pendiente. 2) Elige lo más importante o urgente. 3) Divide esa tarea en un primer paso de 15 minutos. ¿Qué cosas necesitas organizar?';
  }
  if (/\b(idea|creativ|inspir|proyecto)\b/.test(normalized)) {
    return 'Prueba este disparador creativo: combina algo que ya te gusta con algo que te gustaría aprender. Por ejemplo, crea una pequeña guía, lista o prototipo que una ambas cosas. ¿Sobre qué tema quieres una idea más concreta?';
  }
  if (/\b(hora|fecha|día de hoy)\b/.test(normalized)) {
    return `La fecha y hora de tu dispositivo son ${new Intl.DateTimeFormat('es', { dateStyle: 'full', timeStyle: 'short' }).format(new Date())}. ¿Quieres que te ayude a planificar algo para hoy?`;
  }
  if (/\b(gracias|muchas gracias)\b/.test(normalized)) {
    return '¡De nada! Aquí estoy para ayudarte. ¿Hay algo más que quieras resolver?';
  }
  if (/\b(ayuda|puedes hacer|qué haces|que haces)\b/.test(normalized)) {
    return 'Puedo ayudarte a ordenar ideas, dividir tareas, proponer opciones o explicarte conceptos. Cuéntame un poco más sobre lo que necesitas y empezamos.';
  }
  return `Gracias por contármelo. Para empezar, podríamos separar esto en: qué quieres conseguir, qué te está frenando y cuál sería un primer paso pequeño. ¿Cuál de esas partes quieres abordar primero?`;
}

async function getReply() {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: conversation.slice(-12) })
  });
  const data = await response.json().catch(() => ({}));
  if (response.ok && typeof data.reply === 'string') return { reply: data.reply, demo: false };
  if (response.status === 503) return { reply: localReply(conversation.at(-1).content), demo: true };
  throw new Error(data.error || 'No se pudo enviar el mensaje. Inténtalo de nuevo.');
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
  sendButton.querySelector('span:first-child').textContent = 'Pensando';
  const loading = addMessage('Jarvis está pensando', 'bot', { loading: true });

  try {
    const { reply, demo } = await getReply();
    loading.bubble.textContent = reply;
    loading.message.classList.remove('is-loading');
    conversation.push({ role: 'assistant', content: reply });
    if (demo) modeLabel.textContent = 'Modo de prueba · configura la IA para respuestas completas';
  } catch (error) {
    loading.bubble.textContent = error.message || 'Ocurrió un error. Inténtalo de nuevo.';
    loading.message.classList.remove('is-loading');
    conversation.pop();
  } finally {
    sendButton.disabled = false;
    input.disabled = false;
    sendButton.querySelector('span:first-child').textContent = 'Enviar';
    input.focus();
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});

suggestions.addEventListener('click', (event) => {
  const button = event.target.closest('.suggestion');
  if (!button || sendButton.disabled) return;
  input.value = button.textContent.trim();
  form.requestSubmit();
});

clearButton.addEventListener('click', () => {
  if (sendButton.disabled) return;
  conversation.length = 0;
  chatWindow.replaceChildren();
  addMessage('Hola, soy Jarvis. ¿Qué te gustaría pensar, aprender u organizar hoy?', 'bot');
  modeLabel.textContent = 'Jarvis está aquí';
  input.focus();
});
