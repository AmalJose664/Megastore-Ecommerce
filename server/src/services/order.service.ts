import { orderRepository, cartRepository, productRepository, addressRepository, OrderFilters } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { IOrder, OrderStatus, PaymentMethod, IOrderItem, PaymentStatus, ActivityType } from '../types';
import { PaginatedResponse } from '../types';
import { buildPaginatedResponse } from '../utils/pagination';
import { couponService } from './coupon.service';
import { activityService } from './activity.service';

interface CreateOrderDTO {
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  couponCode?: string;
}

export class OrderService {
  async createOrder(userId: string, data: CreateOrderDTO): Promise<IOrder> {
    const cart = await cartRepository.findByUser(userId);

    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty');
    }

    const address = await addressRepository.findById(data.shippingAddressId);

    if (!address) {
      throw ApiError.notFound('Shipping address not found');
    }

    if (address.user.toString() !== userId) {
      throw ApiError.forbidden('Address does not belong to user');
    }

    const orderItems: IOrderItem[] = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await productRepository.findById(item.product.toString());
      if (!product) {
        throw ApiError.badRequest(`Product in cart no longer exists`);
      }

      let itemPrice = product.price;
      let variantId = (item as any).variantId;
      let selectedVariant = (item as any).selectedVariant;

      if (variantId && product.hasVariants && Array.isArray(product.variants)) {
        const v = product.variants.find((varItem: any) => (varItem._id || varItem.id)?.toString() === variantId);
        if (!v) {
          throw ApiError.badRequest(`Selected variant for "${product.name}" no longer exists`);
        }
        if (v.stock < item.quantity) {
          throw ApiError.badRequest(`Insufficient stock for "${product.name}" variant`);
        }
        selectedVariant = v;
        itemPrice = v.price || product.price;
      } else {
        if (!product.inStock || product.stock < item.quantity) {
          throw ApiError.badRequest(
            `Insufficient stock for "${product.name}". Available: ${product.stock}`
          );
        }
      }

      subtotal += itemPrice * item.quantity;

      orderItems.push({
        product: product._id as any,
        variantId,
        selectedVariant,
        name: product.name,
        image: selectedVariant?.image || product.thumbnail || product.images[0] || '',
        price: itemPrice,
        quantity: item.quantity,
        total: itemPrice * item.quantity,
      });
    }

    let discount = 0;
    let couponCode: string | undefined;

    if (data.couponCode) {
      const validation: any = await couponService.validateCoupon(data.couponCode, subtotal, userId);
      if (validation.valid && validation.coupon) {
        discount = validation.discount;
        couponCode = validation.coupon.code;
      } else {
        throw ApiError.badRequest(validation.message || 'Invalid coupon code');
      }
    }

    const shippingFee = subtotal > 100 ? 0 : 10;
    const total = subtotal - discount + shippingFee;

    const orderNumber = this.generateOrderNumber();

    const orderData: Partial<IOrder> = {
      orderNumber,
      user: userId as any,
      items: orderItems,
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: (address as any).addressLine1 || (address as any).street || '',
        addressLine2: (address as any).addressLine2,
        city: address.city,
        state: address.state,
        postalCode: (address as any).postalCode || (address as any).zipCode || '',
        country: address.country,
      } as any,
      paymentMethod: data.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      subtotal,
      discount,
      shippingFee,
      total,
      status: OrderStatus.PENDING,
      notes: data.notes,
      couponCode,
    };

    const order = await orderRepository.create(orderData as any);

    for (const item of cart.items) {
      const p = await productRepository.findById(item.product.toString());
      if (p) {
        const vId = (item as any).variantId;
        if (vId && p.hasVariants && Array.isArray(p.variants)) {
          const v = p.variants.find((varItem: any) => (varItem._id || varItem.id)?.toString() === vId);
          if (v) {
            v.stock = Math.max(0, v.stock - item.quantity);
            v.inStock = v.stock > 0;
            await (p as any).save();
          }
        } else {
          await productRepository.updateStock(item.product.toString(), -item.quantity);
        }
      }
    }

    if (couponCode) {
      await couponService.applyCoupon(couponCode, userId);
    }

    await cartRepository.clearCart(userId);

    // Log activity for order creation
    await activityService.logActivity(
      ActivityType.ORDER_CREATED,
      'New Order Placed',
      `Order #${orderNumber} placed for ₹${total.toLocaleString()}`,
      userId,
      { orderId: order._id, orderNumber, total, itemsCount: orderItems.length }
    );

    return order;
  }

  async getOrderById(orderId: string): Promise<IOrder> {
    const order = await orderRepository.findById(orderId);

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

  async getAllOrders(
    filters: OrderFilters = {},
    page: number = 1,
    limit: number = 10,
    sort: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<PaginatedResponse<IOrder>> {
    const { orders, total } = await orderRepository.findWithFilters(filters, page, limit, sort, order);

    return buildPaginatedResponse(orders, total, page, limit);
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    extraData?: {
      carrier?: string;
      trackingNumber?: string;
      notes?: string;
      estimatedDelivery?: Date | string;
    }
  ): Promise<IOrder> {
    const existingOrder = await orderRepository.findById(orderId);
    if (!existingOrder) {
      throw ApiError.notFound('Order not found');
    }

    const current = (existingOrder.status || '').toLowerCase();
    const target = (status || '').toLowerCase();

    // If order is already cancelled or delivered, and trying to change status to something else
    if ((current === 'delivered' || current === 'cancelled') && current !== target) {
      throw ApiError.badRequest(`Order is already ${current.toUpperCase()} and status cannot be changed.`);
    }

    // Progression check (skip if current === target, i.e. updating details for the same status)
    if (current !== target && target !== 'cancelled') {
      if ((current === 'pending' || current === 'paid') && target !== 'processing' && target !== 'shipped') {
        throw ApiError.badRequest('Orders in PENDING status can only be advanced to PROCESSING, SHIPPED, or CANCELLED');
      }
      if (current === 'processing' && target !== 'shipped') {
        throw ApiError.badRequest('Orders in PROCESSING status can only be advanced to SHIPPED or CANCELLED');
      }
      if (current === 'shipped' && target !== 'delivered') {
        throw ApiError.badRequest('Orders in SHIPPED status can only be advanced to DELIVERED');
      }
    }

    const updateFields: Record<string, any> = { status: target };

    if (extraData?.notes !== undefined) {
      updateFields.notes = extraData.notes;
    }
    if (extraData?.carrier) {
      updateFields.carrier = extraData.carrier;
    }
    if (extraData?.trackingNumber) {
      updateFields.trackingNumber = extraData.trackingNumber;
    }
    if (extraData?.estimatedDelivery) {
      updateFields.estimatedDelivery = new Date(extraData.estimatedDelivery);
    }

    if (target === 'delivered') {
      updateFields.deliveredAt = new Date();
      updateFields.paymentStatus = PaymentStatus.COMPLETED;
    } else if (target === 'cancelled') {
      updateFields.cancelledAt = new Date();
    }

    const order = await orderRepository.updateStatusDetails(orderId, updateFields);

    if (!order) {
      throw ApiError.internal('Failed to update order status');
    }

    // Log activity for status changes
    try {
      await activityService.logActivity(
        ActivityType.ORDER_STATUS_CHANGED,
        'Order Status Updated',
        `Order #${order.orderNumber} status changed to ${target.toUpperCase()}${extraData?.trackingNumber ? ` (Tracking: ${extraData.trackingNumber})` : ''}`,
        order.user?.toString(),
        { orderId: order._id, orderNumber: order.orderNumber, status: target, carrier: extraData?.carrier, trackingNumber: extraData?.trackingNumber }
      );
    } catch (err) {
      console.warn('Failed to log activity for order status update:', err);
    }

    return order;
  }

  async cancelOrder(orderId: string, userId: string): Promise<IOrder> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.user.toString() !== userId) {
      throw ApiError.forbidden('Cannot cancel other user order');
    }

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PROCESSING
    ) {
      throw ApiError.badRequest('Order cannot be cancelled in current status');
    }

    const updatedOrder = await orderRepository.updateStatus(orderId, OrderStatus.CANCELLED);

    if (!updatedOrder) {
      throw ApiError.internal('Failed to cancel order');
    }

    for (const item of order.items) {
      await productRepository.updateStock(item.product.toString(), item.quantity);
    }

    return updatedOrder;
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }
}

export const orderService = new OrderService();
