import { Request, Response } from 'express';
import { paymentService, PaymentService } from '../services/payment.service';
import { asyncHandler } from '../utils/asyncHandler';

export class PaymentController {
  constructor(private paymentSer: PaymentService = paymentService) {}

  /**
   * POST /api/v1/payments/create-checkout-session
   * Create a Stripe Hosted Checkout Session for an Order
   */
  createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.body;
    const userId = req.user!.userId;

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
      return;
    }

    const sessionData = await this.paymentSer.createStripeCheckoutSession(orderId, userId);

    res.status(200).json({
      success: true,
      message: 'Stripe Checkout Session created successfully',
      data: sessionData,
    });
  });

  /**
   * POST /api/v1/payments/webhook
   * Handle incoming Stripe Webhook events
   */
  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = req.body; // Buffer from express.raw()

    const result = await this.paymentSer.handleStripeWebhook(rawBody, signature);

    res.status(200).json(result);
  });
}

export const paymentController = new PaymentController();
