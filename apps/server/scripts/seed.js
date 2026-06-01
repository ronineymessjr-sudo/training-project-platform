/**
 * Database Seed Script
 * 插入测试数据
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
  multipleStatements: true,
};

async function runSeeds() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // 创建种子记录表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS seeds (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Seeds table ready');

    // 获取已执行的种子
    const [executedSeeds] = await connection.execute(
      'SELECT filename FROM seeds ORDER BY id'
    );
    const executedSet = new Set(executedSeeds.map(s => s.filename));

    // 读取种子文件
    const seedsDir = path.join(__dirname, '../src/database/seeds');
    const files = fs.readdirSync(seedsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${files.length} seed files`);

    for (const file of files) {
      if (executedSet.has(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`🌱 Seeding ${file}...`);
      
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        // 执行 SQL
        await connection.query(sql);

        // 记录种子
        await connection.execute(
          'INSERT INTO seeds (filename) VALUES (?)',
          [file]
        );

        console.log(`✅ ${file} seeded successfully`);
      } catch (err) {
        console.error(`❌ Error seeding ${file}:`, err.message);
        // 继续执行其他种子文件
      }
    }

    console.log('\n🎉 All seeds completed!');
    console.log('\n📋 Test Accounts:');
    console.log('  Admin:    admin / admin123');
    console.log('  Teacher:  teacher001 / teacher123');
    console.log('  Student:  student001 / student123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runSeeds();
