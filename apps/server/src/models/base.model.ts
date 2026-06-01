import { pool } from '../database/connection';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export interface BaseEntity {
  id: number;
  created_at?: Date;
  updated_at?: Date;
}

export abstract class BaseModel<T extends BaseEntity> {
  protected tableName: string;
  protected primaryKey: string = 'id';

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // 查找所有记录
  async findAll(where?: Partial<T>, limit?: number, offset?: number): Promise<T[]> {
    let sql = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    if (where && Object.keys(where).length > 0) {
      const conditions = Object.entries(where)
        .map(([key]) => `${key} = ?`)
        .join(' AND ');
      sql += ` WHERE ${conditions}`;
      params.push(...Object.values(where));
    }

    sql += ` ORDER BY ${this.primaryKey} DESC`;

    if (limit !== undefined) {
      sql += ` LIMIT ?`;
      params.push(limit);
    }

    if (offset !== undefined) {
      sql += ` OFFSET ?`;
      params.push(offset);
    }

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return rows as T[];
  }

  // 根据ID查找
  async findById(id: number): Promise<T | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = ?`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as T) : null;
  }

  // 创建记录
  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return result.insertId;
  }

  // 更新记录
  async update(id: number, data: Partial<T>): Promise<boolean> {
    const fields = Object.keys(data);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(data), id];

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE ${this.tableName} SET ${setClause} WHERE ${this.primaryKey} = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // 删除记录
  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  // 软删除
  async softDelete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE ${this.tableName} SET deleted_at = NOW() WHERE ${this.primaryKey} = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  // 统计记录数
  async count(where?: Partial<T>): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params: any[] = [];

    if (where && Object.keys(where).length > 0) {
      const conditions = Object.entries(where)
        .map(([key]) => `${key} = ?`)
        .join(' AND ');
      sql += ` WHERE ${conditions}`;
      params.push(...Object.values(where));
    }

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return rows[0].count;
  }

  // 执行原始查询
  async query(sql: string, params?: any[]): Promise<any> {
    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return rows;
  }

  // 事务支持
  async transaction<T>(callback: (connection: any) => Promise<T>): Promise<T> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
