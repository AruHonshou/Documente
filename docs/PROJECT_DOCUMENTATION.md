# Documentacion tecnica completa de DocuMente

## 1. Vision general

DocuMente es una aplicacion fullstack de demostracion tecnica para conversar con documentos usando RAG, agentes y fuentes citables.

El objetivo principal no es vender un SaaS productivo, sino demostrar conocimiento practico en:

- Arquitectura fullstack con TypeScript.
- Seguridad basica aplicada a APIs.
- Autenticacion con JWT.
- Procesamiento de documentos.
- Chunking con overlap.
- Embeddings con OpenAI.
- Recuperacion semantica usando similitud coseno.
- Agentes y skills para decidir intenciones.
- Streaming de respuestas al frontend.
- SQLite como base local suficiente para una demo tecnica.
- Docker, CI y GitHub Pages.

## 2. Stack

Frontend:

- React.
- TypeScript.
- Vite.
- TailwindCSS.
- Zustand.
- Axios.
- React Router.
- Lucide React.

Backend:

- Node.js.
- Express.
- TypeScript.
- SQLite.
- better-sqlite3.
- Zod.
- Multer.
- Helmet.
- CORS.
- express-rate-limit.
- Winston.
- OpenAI SDK.

DevOps:

- Docker.
- Docker Compose.
- GitHub Actions.
- GitHub Pages para demo estatica.

## 3. Estructura del monorepo

```text
Documente/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- db/
|   |   |-- middleware/
|   |   |-- routes/
|   |   |-- services/
|   |   |   `-- skills/
|   |   |-- types/
|   |   |-- utils/
|   |   `-- validators/
|   |-- Dockerfile
|   |-- jest.config.cjs
|   |-- package.json
|   `-- tsconfig.json
|
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- store/
|   |   |-- types/
|   |   `-- utils/
|   |-- Dockerfile
|   |-- nginx.conf
|   |-- package.json
|   |-- tailwind.config.ts
|   `-- vite.config.ts
|
|-- docs/
|-- .github/workflows/
|-- docker-compose.yml
|-- package.json
|-- package-lock.json
|-- README.md
`-- .env.example
```

## 4. Arquitectura del backend

El backend sigue una separacion por capas:

```text
Request HTTP
  -> route
  -> middleware
  -> validator
  -> controller
  -> service
  -> db/OpenAI/utils
  -> response
```

### 4.1 Routes

Las rutas solo declaran endpoints y conectan middlewares con controllers.

Archivos principales:

- `backend/src/routes/auth.routes.ts`
- `backend/src/routes/document.routes.ts`
- `backend/src/routes/chat.routes.ts`
- `backend/src/routes/system.routes.ts`

Por que existen:

- Mantienen la definicion HTTP separada de la logica de negocio.
- Facilitan leer que endpoints existen.
- Evitan controllers enormes con configuracion de routing mezclada.

### 4.2 Middlewares

Middlewares principales:

- `auth.middleware.ts`: valida JWT y agrega `req.user`.
- `upload.middleware.ts`: procesa archivos en memoria con Multer.
- `rateLimit.middleware.ts`: limita requests para proteger endpoints publicos.
- `validate.middleware.ts`: ejecuta schemas Zod antes de llegar al controller.
- `requestId.middleware.ts`: agrega identificador por request para logs.

Decisiones:

- Los archivos no se guardan raw en disco.
- La validacion ocurre antes de la logica de negocio.
- La identidad del usuario se resuelve una vez y viaja en `req.user`.

### 4.3 Controllers

Los controllers orquestan una request:

- Revisan que exista usuario autenticado cuando aplica.
- Leen datos ya validados.
- Llaman servicios.
- Traducen errores a respuestas HTTP.

Archivos:

- `auth.controller.ts`
- `document.controller.ts`
- `chat.controller.ts`
- `system.controller.ts`

Regla importante:

Los controllers no contienen reglas complejas de negocio. Esa logica vive en services.

### 4.4 Services

Los services contienen la logica real del sistema:

- `auth.service.ts`: registro, login, refresh token y hash de passwords.
- `document.service.ts`: persistencia de documentos y chunks.
- `documentText.service.ts`: extraccion de texto desde PDF/TXT.
- `embedding.service.ts`: embeddings con OpenAI.
- `chat.service.ts`: sesiones, mensajes y streaming.
- `agent.service.ts`: RAGAgent y decision de intencion.

Por que existen:

- Permiten probar logica sin depender de Express.
- Separan HTTP de negocio.
- Mantienen responsabilidades claras.

### 4.5 Validators

Los validators usan Zod.

Archivos:

- `auth.validator.ts`
- `document.validator.ts`
- `chat.validator.ts`

Validan:

- Email y password.
- IDs numericos.
- Preguntas de chat.
- Parametros de documentos y sesiones.

Por que Zod:

- Valida runtime.
- Entrega tipos TypeScript.
- Evita confiar en input externo.

## 5. Arquitectura del frontend

El frontend esta organizado por responsabilidad visual y de estado:

```text
Page
  -> hooks
  -> services
  -> store
  -> components
```

### 5.1 Pages

Pantallas principales:

- `LoginPage.tsx`
- `RegisterPage.tsx`
- `DashboardPage.tsx`
- `ChatPage.tsx`
- `SettingsPage.tsx`

Cada page representa una ruta y compone hooks/componentes.

### 5.2 Components

Componentes por dominio:

- `components/auth`: formularios de auth.
- `components/documents`: upload y lista de documentos.
- `components/chat`: ventana de chat, mensajes, input y fuentes.
- `components/ui`: botones, badges, spinner y banner demo.

Decision:

Los componentes visuales no conocen detalles de endpoints.

### 5.3 Hooks

Hooks principales:

- `useAuth`: login, register, logout y restauracion de sesion.
- `useDocuments`: listado, upload y eliminacion.
- `useChat`: sesiones, mensajes y preguntas con streaming.

Por que hooks:

- Encapsulan estado asincrono.
- Evitan duplicar logica en pages.
- Mantienen componentes mas declarativos.

### 5.4 Store

Zustand guarda estado global:

- `authStore.ts`: usuario y tokens.
- `documentStore.ts`: documentos cargados.
- `chatStore.ts`: sesiones, mensajes y respuesta progresiva.

Decision:

Zustand es suficiente para este tamano de app y evita boilerplate excesivo.

### 5.5 Services

Services frontend:

- `apiClient.ts`: Axios configurado con refresh token automatico.
- `auth.service.ts`
- `document.service.ts`
- `chat.service.ts`
- `system.service.ts`
- `demo.service.ts`

Por que existen:

- Centralizan llamadas HTTP.
- Evitan que los componentes sepan rutas exactas.
- Permiten cambiar entre backend real y modo demo.

## 6. Modelo de datos

SQLite contiene:

### 6.1 users

Guarda usuarios del sistema.

Campos:

- `id`
- `email`
- `password_hash`
- `created_at`

Seguridad:

- Nunca se guarda password plano.
- Se usa bcrypt.

### 6.2 documents

Guarda metadatos de documentos.

Campos:

- `id`
- `user_id`
- `name`
- `size`
- `chunk_count`
- `created_at`

Importante:

El archivo raw no queda guardado. Solo metadatos y chunks.

### 6.3 chunks

Guarda texto dividido y embedding.

Campos:

- `id`
- `document_id`
- `user_id`
- `text`
- `embedding`
- `token_count`
- `chunk_index`

Decision:

El embedding se serializa como `Float32Array` dentro de un `BLOB`.

### 6.4 chat_sessions

Agrupa conversaciones por documento.

Campos:

- `id`
- `user_id`
- `document_id`
- `title`
- `created_at`

### 6.5 messages

Guarda historial de chat.

Campos:

- `id`
- `session_id`
- `role`
- `content`
- `sources`
- `created_at`

`sources` es JSON con chunks usados como evidencia.

## 7. Flujo de autenticacion

### 7.1 Registro

1. Frontend envia email/password.
2. Backend valida con Zod.
3. Backend hashea password con bcrypt.
4. Se guarda usuario en SQLite.
5. Backend devuelve access token y refresh token.
6. Frontend guarda tokens en localStorage.

### 7.2 Login

1. Frontend envia credenciales.
2. Backend busca usuario por email.
3. Backend compara password con bcrypt.
4. Backend devuelve tokens.
5. Frontend actualiza Zustand y localStorage.

### 7.3 Refresh token

1. Axios detecta respuesta `401`.
2. Frontend usa refresh token.
3. Backend valida refresh token.
4. Backend entrega nuevo par de tokens.
5. Request original se reintenta.

## 8. Flujo de documentos

1. Usuario selecciona PDF o TXT.
2. Frontend envia multipart/form-data.
3. Backend valida JWT.
4. Multer recibe archivo en memoria.
5. Se valida MIME y tamano.
6. Se extrae texto.
7. Se sanitiza texto.
8. Se divide en chunks con overlap.
9. Se generan embeddings.
10. Se guarda documento y chunks en SQLite.

Decision importante:

No se guarda el archivo raw. Esto reduce superficie de riesgo y simplifica la demo.

## 9. Chunking

El chunking divide texto largo en partes mas pequenas.

Conceptos:

- Chunk size: tamano aproximado de cada fragmento.
- Overlap: texto repetido entre fragmentos vecinos.

Por que overlap:

Sin overlap, una idea puede quedar partida entre dos chunks. El overlap ayuda a conservar contexto.

Variables:

```env
CHUNK_SIZE_TOKENS=500
CHUNK_OVERLAP_TOKENS=50
```

Nota:

El proyecto usa una aproximacion simple para tokens, suficiente para demo tecnica.

## 10. Embeddings

Un embedding es un vector numerico que representa significado semantico.

Modelo:

```text
text-embedding-3-small
```

Uso:

- Se genera embedding por chunk.
- Se genera embedding por pregunta.
- Se compara pregunta vs chunks.

Por que embeddings:

Permiten buscar por significado, no solo por palabras exactas.

## 11. Recuperacion semantica

La busqueda se hace con similitud coseno:

```text
score = cosineSimilarity(questionEmbedding, chunkEmbedding)
```

Flujo:

1. Usuario pregunta.
2. Se genera embedding de la pregunta.
3. Se cargan chunks del documento.
4. Se calcula score para cada chunk.
5. Se ordenan de mayor a menor.
6. Se filtra por `MIN_SIMILARITY_SCORE`.
7. Se toman los mejores `MAX_CHUNKS_CONTEXT`.

Variables:

```env
MAX_CHUNKS_CONTEXT=5
MIN_SIMILARITY_SCORE=0.15
```

## 12. Sistema de agentes y skills

### 12.1 RAGAgent

Archivo:

```text
backend/src/services/agent.service.ts
```

Responsabilidad:

Decide que skill ejecutar segun la intencion del usuario.

Intenciones actuales:

- Resumen.
- Keywords/temas principales.
- Pregunta normal.

### 12.2 Skills

Skills:

- `searchDocuments.skill.ts`
- `generateAnswer.skill.ts`
- `summarizeDocument.skill.ts`
- `extractKeywords.skill.ts`

Por que skills:

Cada skill tiene una responsabilidad atomica. Esto hace el sistema mas facil de extender.

Ejemplo:

Si manana se agrega `compareDocuments.skill.ts`, el agente podria decidir usarla sin reescribir todo el chat.

## 13. Generacion de respuestas

La generacion usa OpenAI chat completions.

Modelo por defecto:

```env
OPENAI_CHAT_MODEL=gpt-4o
```

Prompt:

El sistema instruye al modelo a responder usando el contexto recuperado.

Fuentes:

La respuesta se guarda junto con los chunks usados.

## 14. Streaming

El endpoint:

```text
POST /api/chat/ask/stream
```

Usa NDJSON:

```text
{"type":"session",...}
{"type":"user_message",...}
{"type":"assistant_delta","delta":"texto"}
{"type":"assistant_done",...}
```

Por que NDJSON:

- Es facil de parsear con `fetch`.
- Permite emitir eventos progresivos.
- Evita depender de librerias extra.

En frontend:

- `chat.service.ts` lee el stream.
- `useChat.ts` actualiza el store.
- `chatStore.ts` agrega deltas al mensaje temporal.

## 15. Seguridad

Medidas implementadas:

- Helmet para headers HTTP.
- CORS configurado por entorno.
- Rate limiting en rutas publicas.
- JWT en rutas protegidas.
- Refresh token.
- Passwords con bcrypt.
- Validacion Zod.
- Upload en memoria.
- Validacion de MIME y tamano.
- Sanitizacion de texto extraido.
- Queries parametrizadas.
- Ownership checks por `user_id`.
- `.env` ignorado por Git.
- `.env.example` sin secretos.
- Endpoint de settings sin exponer API keys.

Ejemplo de ownership check:

Un usuario no puede leer, chatear o eliminar documentos de otro usuario porque las consultas filtran por `user_id`.

## 16. Modo demo para GitHub Pages

GitHub Pages no ejecuta backend Express ni SQLite.

Por eso existe:

```text
frontend/src/services/demo.service.ts
```

Modo demo:

- Simula login.
- Simula documentos.
- Simula upload.
- Simula chat.
- Simula fuentes.
- Simula settings.

Variables:

```env
VITE_DEMO_MODE=true
VITE_BASE_PATH=/Documente/
```

Transparencia:

La UI muestra un banner indicando que es modo demo.

Objetivo:

Permitir que una persona vea la experiencia sin API key, sin backend y sin costos.

## 17. GitHub Actions

### 17.1 CI

Workflow:

```text
.github/workflows/ci.yml
```

Ejecuta:

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run test`
5. `npm run build`
6. `npm audit --omit=dev`
7. Docker build backend
8. Docker build frontend

### 17.2 GitHub Pages Demo

Workflow:

```text
.github/workflows/pages.yml
```

Ejecuta:

1. Instala dependencias.
2. Compila frontend con modo demo.
3. Sube artifact.
4. Publica en GitHub Pages.

URL:

```text
https://AruHonshou.github.io/Documente/
```

## 18. Docker

Docker permite correr la app en contenedores.

Archivos:

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `docker-compose.yml`

Comando:

```powershell
docker compose up --build
```

Nota:

Docker Desktop debe estar abierto para que funcione en Windows.

## 19. Variables de entorno

Archivo base:

```text
.env.example
```

Variables:

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

Importante:

`OPENAI_API_KEY` nunca debe subirse al repositorio.

## 20. Como correrlo localmente

### 20.1 Requisitos

Instalar:

- Node.js 22 o superior.
- npm.
- Git.
- Docker Desktop opcional.
- API key de OpenAI si se quiere usar IA real.

### 20.2 Clonar el repositorio

```powershell
git clone https://github.com/AruHonshou/Documente.git
cd Documente
```

### 20.3 Instalar dependencias

```powershell
npm install
```

### 20.4 Crear archivo `.env`

```powershell
Copy-Item .env.example .env
```

Editar `.env` y colocar:

```env
OPENAI_API_KEY=tu_api_key
JWT_SECRET=una_clave_larga_de_minimo_32_caracteres
```

Para probar UI sin IA real, se puede dejar `OPENAI_API_KEY` vacia. Login y dashboard pueden funcionar, pero subir documentos reales que generen embeddings necesita API key.

### 20.5 Correr backend y frontend juntos

```powershell
npm run dev
```

URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3000/api/health
```

### 20.6 Correr por separado

Terminal 1:

```powershell
npm run dev:backend
```

Terminal 2:

```powershell
npm run dev:frontend
```

### 20.7 Crear cuenta

Abrir:

```text
http://localhost:5173/register
```

Crear usuario con:

```text
email: demo@example.com
password: password123
```

### 20.8 Subir documento

Desde dashboard:

1. Seleccionar PDF o TXT.
2. Esperar procesamiento.
3. Abrir chat.
4. Preguntar sobre el documento.

Si aparece error 429 de OpenAI:

La API key es valida, pero no tiene cuota/billing disponible.

### 20.9 Reiniciar puertos en Windows

Si aparece `EADDRINUSE`:

```powershell
Get-NetTCPConnection -LocalPort 3000,5173,5174,5175 -ErrorAction SilentlyContinue |
  Where-Object { $_.OwningProcess -ne 0 } |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

Luego:

```powershell
npm run dev
```

## 21. Scripts disponibles

Desde la raiz:

```powershell
npm run dev
npm run dev:backend
npm run dev:frontend
npm run typecheck
npm run lint
npm run test
npm run build
npm audit
```

Significado:

- `dev`: backend y frontend en paralelo.
- `typecheck`: valida TypeScript.
- `lint`: revisa estilo y errores.
- `test`: ejecuta Jest y Vitest.
- `build`: compila backend y frontend.
- `npm audit`: revisa vulnerabilidades.

## 22. Endpoints

### 22.1 Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET  /api/auth/me
```

### 22.2 Documents

```text
GET    /api/documents
POST   /api/documents
DELETE /api/documents/:documentId
```

### 22.3 Chat

```text
GET  /api/chat/sessions
POST /api/chat/sessions
GET  /api/chat/sessions/:sessionId/messages
POST /api/chat/ask
POST /api/chat/ask/stream
```

### 22.4 System

```text
GET /api/system/status
```

## 23. Testing

Backend:

- Jest.
- Tests de chunking.
- Tests de similitud.
- Tests de serializacion de embeddings.
- Tests de sanitizacion.
- Tests de errores OpenAI.

Frontend:

- Vitest.
- Tests de formatters.
- Tests de mensajes de error API.

Ejecutar:

```powershell
npm run test
```

## 24. Limitaciones intencionales

DocuMente es una demo tecnica, no un SaaS listo para millones de usuarios.

Limitaciones:

- SQLite es suficiente para demo, pero no ideal para alta concurrencia.
- Los embeddings se buscan en memoria desde SQLite, no en una base vectorial especializada.
- El modo GitHub Pages no usa backend real.
- No hay panel administrativo.
- No hay recuperacion de password por email.
- No hay observabilidad avanzada con tracing distribuido.

Por que esta bien:

El objetivo es demostrar criterio tecnico y arquitectura, no operar un producto comercial.

## 25. Mejoras futuras

Mejoras razonables:

- E2E tests con Playwright.
- Screenshots en README.
- Modo comparacion entre documentos.
- Exportar respuestas a Markdown/PDF.
- Soporte DOCX.
- Historial de documentos por tags.
- Base vectorial dedicada como pgvector, Qdrant o Pinecone.
- Deploy del backend en Render.
- Logs estructurados con request tracing.
- Refresh tokens rotativos persistidos.

## 26. Como explicar este proyecto en una entrevista

Resumen corto:

> Construí DocuMente, una app fullstack en TypeScript para conversar con documentos usando RAG. Tiene auth JWT, validacion Zod, upload seguro en memoria, chunking, embeddings con OpenAI, busqueda por similitud coseno en SQLite, un agente que decide skills como resumen o keywords, streaming de respuestas, fuentes citables, tests, Docker, CI y una demo estatica en GitHub Pages.

Puntos fuertes:

- Separacion clara entre routes, controllers y services.
- Seguridad aplicada a recursos por usuario.
- RAG entendido desde ingestion hasta respuesta.
- Agentes usados con criterio, no como decoracion.
- Demo publica sin exponer secretos.
- CI y Docker para mostrar disciplina de entrega.

## 27. Glosario

RAG:

Retrieval-Augmented Generation. Tecnica donde se recupera contexto relevante antes de pedir respuesta al modelo.

Embedding:

Vector numerico que representa significado semantico.

Chunk:

Fragmento de texto usado para buscar contexto.

Overlap:

Texto repetido entre chunks vecinos para no cortar ideas.

Cosine similarity:

Medida matematica para comparar vectores.

JWT:

Token firmado usado para autenticar requests.

Skill:

Funcion especializada que el agente puede invocar.

Agent:

Orquestador que decide que skill usar segun la intencion.

NDJSON:

Formato donde cada linea es un JSON independiente, util para streaming.
