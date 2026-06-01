/**
 * Database Migration Script
 * 执行所有 SQL 迁移文件
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'training_user',
  password: process.env.DB_PASSWORD || 'training_pass',
  database: process.env.DB_NAME || 'training_platform',
  charset: 'utf8mb4',
  timezone: '+08:00',
  multipleStatements: true, // 允许多条 SQL 语句
};

async function runMigrations() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // 创建迁移记录表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Migrations table ready');

    // 获取已执行的迁移
    const [executedMigrations] = await connection.execute(
      'SELECT filename FROM migrations ORDER BY id'
    );
    const executedSet = new Set(executedMigrations.map(m => m.filename));

    // 读取迁移文件
    const migrationsDir = path.join(__dirname, '../src/database/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${files.length} migration files`);

    for (const file of files) {
      if (executedSet.has(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`📝 Executing ${file}...`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // 执行 SQL
      await connection.query(sql);

      // 记录迁移
      await connection.execute(
        'INSERT INTO migrations (filename) VALUES (?)',
        [file]
      );

      console.log(`✅ ${file} executed successfully`);
    }

    console.log('\n🎉 All migrations completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigrations();
