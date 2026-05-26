import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { env } from '../config/env.js';

let database: Database.Database | null = null;

/**
 * @description Devuelve una unica conexion SQLite compartida por toda la API.
 * @why Existe para evitar abrir multiples conexiones innecesarias y mantener transacciones consistentes.
 * @returns Instancia singleton de better-sqlite3.
 * @example const db = getDatabase();
 */
export function getDatabase(): Database.Database {
  if (database !== null) {
    return database;
  }

  const databasePath = resolve(env.DATABASE_PATH);

  mkdirSync(dirname(databasePath), { recursive: true });

  database = new Database(databasePath);
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');

  return database;
}

/**
 * @description Cierra la conexion SQLite si fue abierta.
 * @why Existe para que tests, scripts y apagado controlado liberen el archivo de base de datos.
 * @returns No devuelve valor; solo ejecuta el cierre si corresponde.
 * @example closeDatabase();
 */
export function closeDatabase(): void {
  if (database === null) {
    return;
  }

  database.close();
  database = null;
}

/**
 * Responsabilidades del archivo:
 * - Crear el directorio de datos si no existe.
 * - Mantener una conexion singleton hacia SQLite.
 * - Activar WAL y claves foraneas para mejorar integridad y concurrencia.
 */

