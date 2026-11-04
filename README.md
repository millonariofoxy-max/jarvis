# Jarvis

Página web en español para Jarvis, con un chat conectado a una API de IA mediante un backend Node.js. La clave de API se configura solo en el servidor y no se publica en el navegador.

## Requisitos

- Node.js 18 o posterior
- Una clave de API de OpenAI para habilitar las respuestas de IA (el uso de la API puede tener costo según tu cuenta y plan)

## Ejecutar localmente

1. Descarga o clona este repositorio y entra en su carpeta.
2. Instala las dependencias con `npm install`.
3. Configura las variables de entorno `OPENAI_API_KEY` y, opcionalmente, `OPENAI_MODEL` (por defecto `gpt-4o-mini`). Puedes copiar `.env.example` como referencia, pero el servidor no carga archivos `.env` automáticamente: configura las variables en tu terminal o en el panel de tu proveedor de hosting.
4. Inicia el sitio con `npm start` y abre `http://localhost:3000`.

En macOS/Linux puedes iniciar el servidor así:

```bash
OPENAI_API_KEY="tu-clave-secreta" npm start
```

En PowerShell:

```powershell
$env:OPENAI_API_KEY="tu-clave-secreta"
npm start
```

Sin `OPENAI_API_KEY`, la página carga, pero el chat muestra que falta configurar la IA. Nunca pongas la clave en `app.js`, en el HTML ni en el repositorio.

## Publicación

El backend necesita un servicio de hosting que ejecute Node.js, como Render, Railway o un servidor propio. Configura `OPENAI_API_KEY` como variable secreta en el servicio y usa `npm start` como comando de inicio. GitHub Pages puede publicar archivos estáticos, pero no puede ejecutar este backend; para usar el chat con IA, frontend y endpoint `/api/chat` deben servirse desde el mismo dominio o configurarse con un proxy seguro.
