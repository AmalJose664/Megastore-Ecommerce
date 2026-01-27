import { orderRepository, cartRepository, productRepository } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { IOrder, OrderStatus, PaymentMethod, IOrderItem } from '../types';
import { PaginatedResponse } from '../types';
import { buildPaginatedResponse } from '../utils/pagination';

export class OrderService {
  async createOrder(
    userId: string,
    data: {
      shippingAddress: any;
      paymentMethod: PaymentMethod;
      couponCode?: string;
      notes?: string;
    }
  ): Promise<IOrder> {
    // Get user's cart
    const cart = await cartRepository.findByUser(userId);

    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty');
    }

    // Verify stock availability and prepare order items
    const orderItems: IOrderItem[] = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product: any = item.product;

      if (!product.inStock || product.stock < item.quantity) {
        throw ApiError.badRequest(`Product ${product.name} is out of stock`);
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      });

      subtotal += item.price * item.quantity;
    }

    // Calculate totals (simplified - implement coupon logic here)
    const discount = 0;
    const shippingFee = subtotal >= 500 ? 0 : 50;
    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% tax
    const total = subtotal - discount + shippingFee + tax;

    // Create order
    const order = await orderRepository.create({
      user: userId,
      items: orderItems,
      shippingAddress: data.shippingAddress,
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
      paymentMethod: data.paymentMethod,
      couponCode: data.couponCode,
      notes: data.notes,
    } as any);

    // Reduce stock for each product
    for (const item of cart.items) {
      await productRepository.updateStock(item.product.toString(), -item.quantity);
    }

    // Clear cart
    await cartRepository.clearCart(userId);

    return order;
  }

  async getOrderById(orderId: string, userId?: string): Promise<IOrder> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (userId && order.user.toString() !== userId) {
      throw ApiError.forbidden('Access denied');
    }

    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<IOrder> {
    const order = await orderRepository.findByOrderNumber(orderNumber);

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    return order;
  }

  async getUserOrders(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResponse<IOrder>> {
    const { orders, total } = await orderRepository.findByUser(userId, page, limit);

    return buildPaginatedResponse(orders, total, page, limit);
  }

  async getAllOrders(page: number, limit: number): Promise<PaginatedResponse<IOrder>> {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      orderRepository.findMany({}, { skip, limit, sort: { createdAt: -1 } }),
      orderRepository.countDocuments({}),
    ]);

    return buildPaginatedResponse(orders, total, page, limit);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<IOrder> {
    const order = await orderRepository.updateStatus(orderId, status);

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    return order;
  }

  async cancelOrder(orderId: string, userId: string, reason?: string): Promise<IOrder> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.user.toString() !== userId) {
      throw ApiError.forbidden('Access denied');
    }

    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw ApiError.badRequest('Order cannot be cancelled');
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.cancelReason = reason;
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await productRepository.updateStock(item.product.toString(), item.quantity);
    }

    return order;
  }

  async getOrderStats(): Promise<any> {
    return orderRepository.getOrderStats();
  }
}

export const orderService = new OrderService();