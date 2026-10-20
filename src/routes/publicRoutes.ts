import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  handleGetCampaign,
  handleGetProducts,
  handleTrackInteraction,
  handleGetFunnelMetrics
} from '../controllers/publicController.ts';

const router = Router();

// Rate limiter for reading campaigns & products: 60 requests per minute per IP
const readRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Por favor espere un momento.' }
});

// Rate limiter for tracking events: 120 requests per minute per IP
const trackRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Límite de eventos excedido.' }
});

// Public endpoints
router.get('/campaign/:id', readRateLimiter, handleGetCampaign);
router.get('/products', readRateLimiter, handleGetProducts);
router.post('/track', trackRateLimiter, handleTrackInteraction);

// Admin funnel analytics endpoint
router.get('/admin/funnel-metrics', handleGetFunnelMetrics);

export default router;
