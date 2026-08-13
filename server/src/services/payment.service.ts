import Stripe from 'stripe';
import config from '../config/env';
import { paymentRepository, PaymentRepository } from '../repositories/payment.repository';
import { orderRepository, OrderRepository } from '../repositories/order.repository';
import { ApiError } from '../utils/ApiError';
import { PaymentMethod, PaymentStatus, OrderStatus } from '../types';

export class PaymentService {
  private stripe: Stripe;

  constructor(
    private paymentRepo: PaymentRepository = paymentRepository,
    private orderRepo: OrderRepository = orderRepository
  ) {
    this.stripe = new Stripe(config.payment.stripe.secretKey, {
      apiVersion: '2025-01-27.acacia' as any,
    });
  }

  /**
   * Create a Stripe Hosted Checkout Session for an Order
   */
  async createStripeCheckoutSession(orderId: string, userId: string) {
    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.user.toString() !== userId) {
      throw ApiError.forbidden('Access denied');
    }

    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      throw ApiError.badRequest('Order has already been paid');
    }

    // Prepare line items for Stripe Checkout
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // convert to cents
      },
      quantity: item.quantity,
    }));

    // If there is shipping fee or tax or discount difference, add adjustments
    if (order.shippingFee && order.shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Shipping Fee',
          },
          unit_amount: Math.round(order.shippingFee * 100),
        },
        quantity: 1,
      });
    }

    if (order.tax && order.tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Tax',
          },
          unit_amount: Math.round(order.tax * 100),
        },
        quantity: 1,
      });
    }

    // Build success and cancel URLs pointing to frontend
    const clientBase = config.urls.client || 'http://localhost:5173';
    const successUrl = `${clientBase}/order-success?order_id=${order._id.toString()}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${clientBase}/order-failed?order_id=${order._id.toString()}`;

    // Create Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: order.shippingAddress?.fullName ? undefined : undefined,
      client_reference_id: order._id.toString(),
      metadata: {
        orderId: order._id.toString(),
        userId: userId,
        orderNumber: order.orderNumber,
      },
    });

    // Save payment record via PaymentRepository
    await this.paymentRepo.create({
      order: order._id as any,
      user: userId as any,
      amount: order.total,
      currency: 'INR',
      method: PaymentMethod.STRIPE,
      status: PaymentStatus.PENDING,
      transactionId: session.id,
      gatewayResponse: { sessionId: session.id, url: session.url },
    } as any);

    // Save paymentId to Order document via OrderRepository
    order.paymentId = session.id;
    order.paymentMethod = PaymentMethod.STRIPE;
    await order.save();

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
      orderId: order._id.toString(),
    };
  }

  /**
   * Handle incoming Stripe Webhook Events
   */
  async handleStripeWebhook(rawBody: Buffer, signature?: string) {
    let event: Stripe.Event;

    const webhookSecret = config.payment.stripe.webhookSecret;

    if (webhookSecret && signature) {
      try {
        event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error('Stripe webhook signature verification failed:', err.message);
        throw ApiError.badRequest(`Webhook Signature Verification Error: ${err.message}`);
      }
    } else {
      // In development mode without webhook secret, parse raw JSON body
      try {
        event = JSON.parse(rawBody.toString());
      } catch (err: any) {
        throw ApiError.badRequest('Invalid JSON webhook payload');
      }
    }

    console.log(`🔔 Stripe Webhook Received: [${event.type}]`);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId || session.client_reference_id;

      if (orderId) {
        // Update payment status in PaymentRepository
        await this.paymentRepo.updateByTransactionId(session.id, PaymentStatus.COMPLETED, session);

        // Update order status in OrderRepository
        const order = await this.orderRepo.findById(orderId);
        if (order) {
          order.paymentStatus = PaymentStatus.COMPLETED;
          order.status = OrderStatus.PROCESSING;
          await order.save();
          console.log(`✅ Order ${order.orderNumber} successfully marked as PAID & PROCESSING!`);
        }
      }
    }

    return { received: true };
  }
}

export const paymentService = new PaymentService();
