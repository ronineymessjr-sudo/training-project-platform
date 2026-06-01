import Database from 'better-sqlite3';
import { config } from '../config';
import path from 'path';
import fs from 'fs';

const DB_PATH = config.database.sqlite || path.join(process.cwd(), 'data', 'training.db');

// 确保目录存在
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log(`📂 SQLite database: ${DB_PATH}`);

export { db, DB_PATH };

export async function testConnection(): Promise<boolean> {
  try {
    db.prepare('SELECT 1').get();
    console.log('✅ SQLite database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// 兼容 mysql2 的 query 接口
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T> {
  try {
    const stmt = db.prepare(sql);
    if (params && params.length > 0) {
      const results = stmt.all(...params);
      return results as T;
    }
    const results = stmt.all();
    return results as T;
  } catch (error: any) {
    // INSERT/UPDATE/DELETE 可能没有返回值
    if (error.message.includes('use run()')) {
      const stmt2 = db.prepare(sql);
      if (params && params.length > 0) {
        stmt2.run(...params);
      } else {
        stmt2.run();
      }
      return [] as unknown as T;
    }
    throw error;
  }
}

// 兼容 mysql2 的 execute 接口 (返回 [rows, fields])
export async function execute(
  sql: string,
  params?: any[]
): Promise<[any, any]> {
  try {
    const stmt = db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const rows = params ? stmt.all(...params) : stmt.all();
      return [rows, []];
    } else {
      const result = params ? stmt.run(...params) : stmt.run();
      return [{ insertId: Number(result.lastInsertRowid), affectedRows: result.changes, ...result }, []];
    }
  } catch (error: any) {
    throw error;
  }
}

// 兼容 mysql2 的 transaction
export async function transaction<T>(
  callback: (connection: any) => Promise<T>
): Promise<T> {
  const begin = db.transaction(() => {});
  try {
    db.exec('BEGIN');
    const result = await callback(db);
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

// 兼容 mysql2 pool 的 getConnection
export const pool = {
  async getConnection() {
    return {
      async beginTransaction() { db.exec('BEGIN'); },
      async commit() { db.exec('COMMIT'); },
      async rollback() { db.exec('ROLLBACK'); },
      release() {},
      async execute(sql: string, params?: any[]) {
        return execute(sql, params);
      },
      async query(sql: string, params?: any[]) {
        const rows = await query(sql, params);
        return [rows];
      }
    };
  }
};
