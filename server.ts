import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import publicRoutes from './src/routes/publicRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  // Security hardening: helmet with relaxed CSP for iframe preview and external image CDNs
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled to prevent blocking AI Studio iframe and external CDN images (Shopify, Unsplash)
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      frameguard: false // Allow embedding in AI Studio preview iframe
    })
  );

  // Disable X-Powered-By
  app.disable('x-powered-by');

  // Body parser with size limits
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // Request logger for debug/audit
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API ${req.method}] ${req.path}`);
    }
    next();
  });

  // Mount API routes
  app.use('/api/public', publicRoutes);

  // Healthcheck endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite integration: Dev vs Prod
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: PORT,
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve pre-built static assets in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Kicks Selector server active on http://0.0.0.0:${PORT}`);
    console.log(`✨ Mode: ${isProd ? 'production' : 'development'}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
