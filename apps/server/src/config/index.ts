import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'training_user',
    password: process.env.DB_PASSWORD || 'training_pass',
    database: process.env.DB_NAME || 'training_platform',
    charset: 'utf8mb4',
    timezone: '+08:00',
    sqlite: process.env.DB_SQLITE || undefined,
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },
  
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost:9000',
    useSSL: false,
    accessKey: process.env.MINIO_USER || 'minioadmin',
    secretKey: process.env.MINIO_PASSWORD || 'minioadmin',
    bucket: 'training-platform',
  },
} as const;

export type Config = typeof config;
