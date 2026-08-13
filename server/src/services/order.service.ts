import { orderRepository, cartRepository, productRepository, addressRepository } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { IOrder, OrderStatus, PaymentMethod, IOrderItem, PaymentStatus } from '../types';
import { PaginatedResponse } from '../types';
import { buildPaginatedResponse } from '../utils/pagination';
import { couponService } from './coupon.service';
import { activityService } from './activity.service';

export class OrderService {
  async createOrder(
    userId: string,
    data: {
      addressId: string;
      paymentMethod: PaymentMethod;
      couponCode?: string;
      notes?: string;
    }
  ): Promise<IOrder> {
    // 1. Get user's cart
    const cart = await cartRepository.findByUser(userId);

    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty');
    }

    // 2. Get and verify address
    const address = await addressRepository.findById(data.addressId);
    if (!address) {
      throw ApiError.notFound('Address not found');
    }
    if (address.user.toString() !== userId) {
      throw ApiError.forbidden('This address does not belong to you');
    }

    // 3. Verify stock availability and prepare order items
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

    // 4. Calculate coupon discount
    let discount = 0;
    if (data.couponCode) {
      const coupon = await couponService.validateCoupon(data.couponCode, subtotal, userId);
      discount = couponService.calculateDiscount(coupon, subtotal);

      // Mark coupon as used
      await couponService.applyCoupon(data.couponCode, userId);
    }

    // 5. Calculate other totals
    const shippingFee = (subtotal - discount) >= 500 ? 0 : 50;
    const tax = Math.round((subtotal - discount) * 0.18 * 100) / 100; // 18% tax on discounted amount
    const total = subtotal - discount + shippingFee + tax;

    // 6. Payment status logic: Default is PENDING, for COD it's technically COMPLETED (confirmed order)
    const paymentStatus = data.paymentMethod === PaymentMethod.COD
      ? PaymentStatus.COMPLETED
      : PaymentStatus.PENDING;

    // 7. Create order
    const order = await orderRepository.create({
      user: userId,
      items: orderItems,
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
      status: OrderStatus.PENDING,
      paymentMethod: data.paymentMethod,
      paymentStatus,
      couponCode: data.couponCode,
      notes: data.notes,
    } as any);

    // 8. Reduce stock for each product
    for (const item of cart.items) {
      const product: any = item.product;
      await productRepository.updateStock(product._id.toString(), -item.quantity);
    }

    // 9. Clear cart
    await cartRepository.clearCart(userId);

    // 10. Log activity
    await activityService.logOrderCreated(order, userId, address.fullName);

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

    // Log activity for status changes
    if (status === OrderStatus.SHIPPED) {
      await activityService.logOrderShipped(order, order.shippingAddress.fullName);
    } else if (status === OrderStatus.DELIVERED) {
      await activityService.logOrderDelivered(order, order.shippingAddress.fullName);
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