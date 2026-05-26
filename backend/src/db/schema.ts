import type Database from 'better-sqlite3';

/**
 * @description Crea las tablas necesarias del sistema si todavia no existen.
 * @why Existe para que la API pueda arrancar localmente sin migraciones externas en esta primera fase.
 * @param db - Conexion SQLite donde se ejecutara el schema.
 * @returns No devuelve valor; aplica sentencias DDL idempotentes.
 * @example initializeSchema(getDatabase());
 */
export function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      size INTEGER NOT NULL,
      chunk_count INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      embedding BLOB NOT NULL,
      token_count INTEGER NOT NULL,
      chunk_index INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      sources TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
    CREATE INDEX IF NOT EXISTS idx_chunks_user_document ON chunks(user_id, document_id);
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_document ON chat_sessions(user_id, document_id);
    CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
  `);
}

/**
 * Responsabilidades del archivo:
 * - Definir la estructura persistente del sistema RAG.
 * - Crear indices para consultas frecuentes por usuario y documento.
 * - Mantener integridad referencial con claves foraneas y cascadas.
 */

