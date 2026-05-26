# DocuMente

Asistente fullstack para cargar documentos, generar embeddings, recuperar chunks relevantes y conversar con respuestas citables.

Developer: Kendall Andres Valverde Diaz

## Documentacion completa

La documentacion tecnica completa del proyecto esta en:

[docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)

Incluye arquitectura, seguridad, RAG, agentes, base de datos, GitHub Pages, CI, Docker, endpoints y guia local paso a paso.

## Stack

- Frontend: React + TypeScript + Vite + TailwindCSS + Zustand.
- Backend: Node.js + Express + TypeScript.
- IA: OpenAI API para embeddings y chat.
- Base de datos: SQLite con `better-sqlite3`.
- DevOps: Docker, Docker Compose y GitHub Actions.

## Arquitectura

```text
backend/src/
|-- routes/          Endpoints HTTP sin logica de negocio
|-- controllers/     Orquestan request/response
|-- services/        Logica de negocio, RAG, auth y documentos
|-- services/skills/ Skills atomicas del agente RAG
|-- middleware/      JWT, upload, rate limit y validacion
|-- db/              Conexion SQLite y schema
|-- validators/      Schemas Zod
|-- utils/           Chunking, similitud, serializacion y logs
`-- types/           Contratos TypeScript

frontend/src/
|-- components/      UI, auth, documentos y chat
|-- pages/           Login, registro, dashboard, chat y settings
|-- hooks/           useAuth, useDocuments y useChat
|-- store/           Zustand stores
|-- services/        Clientes HTTP
|-- types/           Contratos de API
`-- utils/           Constantes, errores y formatters
```

## Flujo RAG

1. El usuario sube un PDF o TXT.
2. El backend valida JWT, MIME type y tamano.
3. El archivo se procesa en memoria, sin guardarlo raw en disco.
4. Se extrae y sanitiza texto.
5. El texto se divide en chunks con overlap.
6. OpenAI genera embeddings con `text-embedding-3-small`.
7. SQLite guarda documento, chunks y embeddings serializados.
8. En chat, el agente genera embedding de la pregunta.
9. `searchDocuments` calcula similitud coseno y filtra por score minimo.
10. `generateAnswer` o `streamAnswer` responde con contexto y fuentes.

## Variables de entorno

Copia el ejemplo:

```powershell
Copy-Item .env.example .env
```

Variables principales:

```env
OPENAI_API_KEY=
OPENAI_CHAT_MODEL=gpt-4o
JWT_SECRET=dev_secret_for_local_testing_32_chars_minimum
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
MAX_FILE_SIZE_MB=10
MAX_CHUNKS_CONTEXT=5
MIN_SIMILARITY_SCORE=0.15
CHUNK_SIZE_TOKENS=500
CHUNK_OVERLAP_TOKENS=50
CORS_ORIGIN=http://localhost:5173
DATABASE_PATH=./data/database.sqlite
```

`JWT_SECRET` debe tener al menos 32 caracteres. `OPENAI_API_KEY` nunca se sube al repositorio; vive solo en `.env`.

## Ejecutar en desarrollo

```powershell
npm install
npm run dev
```

URLs:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:3000/api/health`
- Estado autenticado: `http://localhost:3000/api/system/status`

Tambien se pueden correr separados:

```powershell
npm run dev:backend
npm run dev:frontend
```

## Reinicio limpio en Windows

Si ves `EADDRINUSE`, hay procesos viejos usando puertos.

```powershell
Get-NetTCPConnection -LocalPort 3000,5173,5174,5175 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

Despues:

```powershell
npm run dev
```

## Scripts de calidad

```powershell
npm run typecheck
npm run lint
npm run test
npm run build
npm audit
```

## Demo estatica en GitHub Pages

El proyecto incluye un modo demo para portfolio. En ese modo el frontend no llama al backend, no usa SQLite real y no consume OpenAI; simula autenticacion, documentos, chat, fuentes y settings para que cualquier persona pueda probar la interfaz desde GitHub Pages.

Workflow:

- `.github/workflows/pages.yml`

Como activarlo en GitHub:

1. Subir el repositorio a GitHub.
2. Entrar a `Settings > Pages`.
3. En `Build and deployment`, seleccionar `GitHub Actions`.
4. Hacer push a `main` o ejecutar `GitHub Pages Demo` manualmente.

La URL quedara con este formato:

```text
https://TU_USUARIO.github.io/NOMBRE_REPO/
```

Las rutas de la demo usan hash routing para evitar 404 al refrescar en GitHub Pages:

```text
https://TU_USUARIO.github.io/NOMBRE_REPO/#/dashboard
```

Variables usadas durante el build estatico:

```env
VITE_DEMO_MODE=true
VITE_BASE_PATH=/NOMBRE_REPO/
```

Esta demo es intencionalmente transparente: muestra un banner indicando que los datos son simulados. El backend real, la seguridad, el RAG y Docker quedan en el codigo para evaluacion tecnica.

## Docker

Construir y levantar:

```powershell
docker compose up --build
```

Servicios:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- SQLite: volumen Docker `backend_data`

Los Dockerfiles usan la raiz del monorepo como contexto porque `package-lock.json` vive en la raiz.

## Endpoints principales

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

Documents:

- `GET /api/documents`
- `POST /api/documents` con multipart field `document`
- `DELETE /api/documents/:documentId`

Chat:

- `GET /api/chat/sessions`
- `POST /api/chat/sessions`
- `GET /api/chat/sessions/:sessionId/messages`
- `POST /api/chat/ask`
- `POST /api/chat/ask/stream`

System:

- `GET /api/system/status`

## Frontend

Pantallas actuales:

- `/login`: inicio de sesion.
- `/register`: creacion de cuenta.
- `/dashboard`: biblioteca, upload, lista y eliminacion de documentos.
- `/chat/:documentId`: conversacion con streaming y fuentes.
- `/settings`: estado de configuracion sin exponer secretos.

## Prueba manual por terminal

```powershell
$auth = Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:3000/api/auth/register `
  -ContentType "application/json" `
  -Body '{"email":"terminal@example.com","password":"password123"}'

$token = $auth.tokens.accessToken
```

Subir archivo:

```powershell
curl.exe -X POST http://127.0.0.1:3000/api/documents `
  -H "Authorization: Bearer $token" `
  -F "document=@C:\ruta\archivo.pdf"
```

Preguntar:

```powershell
$question = @{
  documentId = 1
  question = "Dame un resumen del documento"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:3000/api/chat/ask `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $question
```

## Tests

Backend usa Jest para utilidades criticas:

- chunking
- similitud coseno
- serializacion de embeddings
- sanitizacion de texto
- mensajes seguros para errores de OpenAI

Frontend usa Vitest para helpers visibles de UI.

```powershell
npm run test
```

## CI

GitHub Actions ejecuta:

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run test`
5. `npm run build`
6. `npm audit --omit=dev`
7. build de imagen backend
8. build de imagen frontend

Workflow: `.github/workflows/ci.yml`

## Estrategia de publicacion

Para portfolio, la ruta recomendada es:

- GitHub publico como fuente principal del conocimiento tecnico.
- GitHub Pages como demo estatica sin secretos ni costos.
- Backend Express documentado y ejecutable localmente con `.env`.
- SQLite conservado porque el objetivo es demostracion, no SaaS multiusuario productivo.

Si luego se quiere una demo con IA real, se puede publicar el backend en Render u otro proveedor gratuito y configurar `VITE_API_URL` en el frontend.

## Troubleshooting

### OpenAI 429 quota

Si el upload falla y el backend muestra:

```text
429 You exceeded your current quota
```

La API key es valida, pero el proyecto de OpenAI no tiene cuota o billing disponible.

### CORS

En desarrollo se permiten origenes locales `localhost` y `127.0.0.1`. Si cambias `CORS_ORIGIN`, reinicia backend.

### Upload PDF

Algunos PDFs muestran warnings de `pdf-parse` por fuentes internas. Si el texto se extrae, no es necesariamente un error.

### Puertos ocupados

Usa el comando de reinicio limpio de Windows de esta guia.

## Estado actual

Incluye:

- Auth JWT con access token y refresh token.
- Upload PDF/TXT en memoria.
- Chunking con overlap.
- Embeddings OpenAI.
- SQLite con documentos, chunks, sesiones y mensajes.
- RAGAgent con skills.
- Chat con fuentes y streaming NDJSON.
- Eliminacion de documentos con cascada.
- Pantalla de settings para validar configuracion.
- Frontend pulido bajo la marca DocuMente.
- Tests, CI, Docker y auditoria npm limpia.
