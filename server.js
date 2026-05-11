// ============================================================================
// API Server for Stripe Integration
// Development: port 8021, proxied by Vite on port 8020
// Production: port from env or default 3001, listens on all interfaces
// ============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.API_PORT || process.env.PORT || 8021;
const HOST = process.env.API_HOST || '0.0.0.0';

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Import API routes dynamically
  const checkoutRouter = (await import('./src/pages/api/create-checkout-session/route.js')).default;
  const portalRouter = (await import('./src/pages/api/create-portal-session/route.js')).default;
  const cancelRouter = (await import('./src/pages/api/cancel-subscription/route.js')).default;
  const emailRouter = (await import('./src/pages/api/send-confirmation-email/route.js')).default;
  const registerRouter = (await import('./src/pages/api/register/route.js')).default;

  // API Routes
  app.use('/api/create-checkout-session', checkoutRouter);
  app.use('/api/create-portal-session', portalRouter);
  app.use('/api/cancel-subscription', cancelRouter);
  app.use('/api/send-email', emailRouter);
  app.use('/api/register', registerRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', stripe: !!process.env.VITE_STRIPE_PUBLIC_KEY });
  });

  // Start server
  app.listen(PORT, HOST, () => {
    const isDev = process.env.NODE_ENV !== 'production';
    const serverUrl = isDev ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
    console.log(`\n➜  API Server running at ${serverUrl}/`);
    console.log(`➜  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`➜  API endpoints: /api/create-checkout-session, /api/create-portal-session, /api/cancel-subscription, /api/send-email, /api/register`);
    if (isDev) {
      console.log(`➜  Frontend: http://localhost:8020/`);
    }
    console.log(`➜  Stripe: ${process.env.VITE_STRIPE_PUBLIC_KEY ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`➜  Email SMTP: ✓ Configured (smtp-pulse.com)\n`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});
