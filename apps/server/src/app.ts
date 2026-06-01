import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import 'express-async-errors';

import { config } from './config';
import { testConnection } from './database/connection';
import routes from './routes';
import { AppError } from './utils/errors';

export async function createApp(): Promise<Express> {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // CORS
  app.use(cors({
    origin: config.cors.origin,
    credentials: true,
  }));

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging
  if (config.env === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: config.env,
    });
  });

  // API routes
  app.use('/api/v1', routes);

  // API docs (simple)
  app.get('/api', (req: Request, res: Response) => {
    res.json({
      name: 'Training Project Platform API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api/v1',
      },
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      code: 404,
      message: 'Not Found',
      data: null,
      timestamp: Date.now(),
    });
  });

  // Global error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        code: err.statusCode,
        message: err.message,
        data: null,
        timestamp: Date.now(),
      });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        code: 400,
        message: err.message,
        data: null,
        timestamp: Date.now(),
      });
    }

    // Default error
    res.status(500).json({
      code: 500,
      message: config.env === 'production' 
        ? 'Internal Server Error' 
        : err.message,
      data: null,
      timestamp: Date.now(),
    });
  });

  return app;
}

export async function startServer(): Promise<void> {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Create and start app
    const app = await createApp();
    
    app.listen(config.port, () => {
      console.log(`
🚀 Training Project Platform Server is running!
   
   Environment: ${config.env}
   Port: ${config.port}
   URL: http://localhost:${config.port}
   
   Endpoints:
   - Health: http://localhost:${config.port}/health
   - API: http://localhost:${config.port}/api/v1
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
