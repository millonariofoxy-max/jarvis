const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatWindow = document.querySelector('.chat-window');

function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.textContent = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function getBotReply(userText) {
  const text = userText.toLowerCase();

  if (text.includes('hola') || text.includes('buenas') || text.includes('hello')) {
    return '¡Hola! Estoy aquí para ayudarte. ¿Qué necesitas hoy?';
  }

  if (text.includes('ayuda') || text.includes('puedes') || text.includes('necesito')) {
    return 'Claro. Puedo ayudarte a organizar ideas, responder preguntas y acompañarte en tus tareas. Cuéntame más.';
  }

  if (text.includes('precio') || text.includes('costo') || text.includes('cuánto')) {
    return 'Esta demo de Jarvis es un prototipo web y está lista para personalizarse según tus necesidades.';
  }

  if (text.includes('tarea') || text.includes('plan') || text.includes('organizar')) {
    return 'Perfecto. Podemos estructurar tus tareas por prioridad, crear un plan y seguir paso a paso.';
  }

  if (text.includes('gracias') || text.includes('thank you')) {
    return 'De nada. Estoy aquí para ayudarte siempre que lo necesites.';
  }

  if (text.includes('jarvis')) {
    return 'Sí, soy Jarvis. Un asistente virtual pensado para acompañarte y resolverte la vida digital.';
  }

  return 'Interesante. Estoy aprendiendo contigo. Si me dices más detalles, podré ayudarte mejor.';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, 'user');
  input.value = '';

  const reply = getBotReply(userText);

  setTimeout(() => {
    addMessage(reply, 'bot');
  }, 300);
});
