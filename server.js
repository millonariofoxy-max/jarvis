const express = require('express');
const path = require('path');

const app = express();
const port = Number(process.env.PORT) || 3000;
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));

app.post('/api/chat', async (req, res) => {
  if (!apiKey) {
    return res.status(503).json({
      error: 'El chat con IA aún no está configurado. Añade OPENAI_API_KEY en las variables de entorno del servidor.'
    });
  }

  const messages = req.body?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 12) {
    return res.status(400).json({ error: 'Envía entre 1 y 12 mensajes.' });
  }

  const validMessages = messages.every((message) =>
    message &&
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string' &&
    message.content.trim().length > 0 &&
    message.content.length <= 4000
  );

  if (!validMessages) {
    return res.status(400).json({ error: 'Los mensajes no son válidos o exceden el límite de 4000 caracteres.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Eres Vos, un asistente virtual amigable, útil y honesto. Responde en español rioplatense, de forma natural y concisa, como en una conversación hablada. No afirmes tener conciencia ni emociones propias. Si no sabes algo, dilo con claridad.'
          },
          ...messages.map(({ role, content }) => ({ role, content: content.trim() }))
        ],
        temperature: 0.7
      }),
      signal: AbortSignal.timeout(30000)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Error del proveedor de IA:', response.status, data.error?.message || 'sin detalles');
      return res.status(502).json({ error: 'No se pudo obtener una respuesta de la IA. Inténtalo de nuevo.' });
    }

    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      return res.status(502).json({ error: 'La IA devolvió una respuesta vacía. Inténtalo de nuevo.' });
    }

    return res.json({ reply: reply.trim() });
  } catch (error) {
    console.error('No se pudo contactar con el proveedor de IA:', error.message);
    return res.status(502).json({ error: 'No se pudo conectar con la IA. Comprueba la conexión e inténtalo de nuevo.' });
  }
});

app.use(express.static(path.join(__dirname)));

app.listen(port, () => {
  console.log(`Vos está disponible en http://localhost:${port}`);
});
