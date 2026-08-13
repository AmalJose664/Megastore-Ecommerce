import express, { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router: Router = Router();

// Stripe webhook endpoint (requires raw Buffer body for signature verification)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

// Authenticated route to create Stripe Checkout Session
router.post(
  '/create-checkout-session',
  authenticate,
  paymentController.createCheckoutSession
);

export default router;
