const micButton = document.getElementById('mic-button');
const statusLabel = document.getElementById('voice-status');
const clearButton = document.getElementById('clear-chat');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const conversation = [];
let recognition;
let recognizedText = '';
let recognitionError = '';
let busy = false;

function setStatus(text, state = '') {
  statusLabel.textContent = text;
  document.body.dataset.state = state;
}

function localReply(text) {
  const normalized = text.toLocaleLowerCase('es');
  if (/\b(hola|buenas|buenos días|buenas tardes|buenas noches|hey)\b/.test(normalized)) {
    return '¡Hola! Me alegra que estés aquí. Cuéntame qué tienes en mente y lo pensamos juntos.';
  }
  if (/\b(organiza|organizar|planifica|planificar|tareas|día|semana)\b/.test(normalized)) {
    return '¡Vamos paso a paso! Anota lo que tienes pendiente, elige lo más importante y divídelo en un primer paso de 15 minutos. ¿Qué necesitas organizar hoy?';
  }
  if (/\b(idea|creativ|inspir|proyecto)\b/.test(normalized)) {
    return 'Una forma de empezar es combinar algo que ya te gusta con algo nuevo que quieras aprender. ¿Sobre qué tema te gustaría pensar?';
  }
  if (/\b(hora|fecha|día de hoy)\b/.test(normalized)) {
    return `La fecha y hora de tu dispositivo son ${new Intl.DateTimeFormat('es', { dateStyle: 'full', timeStyle: 'short' }).format(new Date())}.`;
  }
  if (/\b(gracias|muchas gracias)\b/.test(normalized)) {
    return '¡De nada! Aquí estoy para ayudarte.';
  }
  return 'Te escucho. Cuéntame un poco más y vemos juntos cuál puede ser el siguiente paso.';
}

async function getReply() {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: conversation.slice(-12) })
  });
  const data = await response.json().catch(() => ({}));
  if (response.ok && typeof data.reply === 'string') return data.reply;
  if (response.status === 503) return localReply(conversation.at(-1).content);
  throw new Error(data.error || 'No pude responder. Comprueba tu conexión e inténtalo otra vez.');
}

function speak(text) {
  if (!('speechSynthesis' in window)) {
    setStatus('Tu navegador no admite respuestas por voz.', 'error');
    busy = false;
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-AR';
  utterance.onstart = () => setStatus('Vos te está respondiendo…', 'speaking');
  utterance.onend = () => {
    busy = false;
    setStatus('Toca el micrófono para hablar');
  };
  utterance.onerror = () => {
    busy = false;
    setStatus('No pude reproducir la respuesta. Toca el micrófono para seguir.', 'error');
  };
  window.speechSynthesis.speak(utterance);
}

async function sendToVos(text) {
  if (!text || busy) return;
  busy = true;
  conversation.push({ role: 'user', content: text });
  setStatus('Vos está pensando…', 'thinking');

  try {
    const reply = await getReply();
    conversation.push({ role: 'assistant', content: reply });
    speak(reply);
  } catch (error) {
    busy = false;
    setStatus(error.message || 'Ocurrió un error. Inténtalo de nuevo.', 'error');
  }
}

if (!SpeechRecognition) {
  micButton.disabled = true;
  setStatus('Este navegador no admite dictado por voz. Prueba Chrome o Edge.', 'error');
} else {
  recognition = new SpeechRecognition();
  recognition.lang = 'es-AR';
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onstart = () => {
    recognizedText = '';
    recognitionError = '';
    micButton.setAttribute('aria-pressed', 'true');
    micButton.setAttribute('aria-label', 'Dejar de hablar');
    setStatus('Te escucho…', 'listening');
  };

  recognition.onresult = (event) => {
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      if (event.results[index].isFinal) recognizedText += `${event.results[index][0].transcript} `;
    }
  };

  recognition.onerror = (event) => {
    recognitionError = event.error === 'not-allowed'
      ? 'Necesito permiso para usar el micrófono. Actívalo en la configuración del navegador.'
      : event.error === 'no-speech'
        ? 'No te escuché. Toca el micrófono para volver a intentar.'
        : 'No pude acceder al micrófono. Revisa los permisos y vuelve a intentar.';
  };

  recognition.onend = () => {
    micButton.setAttribute('aria-pressed', 'false');
    micButton.setAttribute('aria-label', 'Empezar a hablar');
    if (recognitionError) {
      setStatus(recognitionError, 'error');
      return;
    }
    if (recognizedText.trim()) {
      sendToVos(recognizedText.trim());
    } else if (!busy) {
      setStatus('No te escuché. Toca el micrófono para volver a intentar.');
    }
  };

  micButton.addEventListener('click', () => {
    if (busy) return;
    try {
      recognition.start();
    } catch {
      setStatus('Espera un momento y vuelve a tocar el micrófono.', 'error');
    }
  });
}

clearButton.addEventListener('click', () => {
  if (busy) return;
  conversation.length = 0;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  setStatus('Toca el micrófono para hablar');
});
