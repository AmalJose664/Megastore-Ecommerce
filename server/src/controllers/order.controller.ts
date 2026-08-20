import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';
import { OrderStatus } from '../types';

export class OrderController {
  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id?.toString() || req.user!.userId;
    const order = await orderService.createOrder(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  });

  getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.getOrderById(req.params.id);

    res.json({
      success: true,
      data: order,
    });
  });

  getUserOrders = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id?.toString() || req.user!.userId;
    const { page = 1, limit = 10 } = parsePagination(req.query);

    const result = await orderService.getUserOrders(userId, page, limit);

    res.json(result);
  });

  getAllOrders = asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
    } = parsePagination(req.query);

    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
      paymentStatus: req.query.paymentStatus as string,
      paymentMethod: req.query.paymentMethod as string,
    };

    const result = await orderService.getAllOrders(filters, page, limit, sort!, order!);

    res.json(result);
  });

  updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status, carrier, trackingNumber, notes, estimatedDelivery } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status as OrderStatus, {
      carrier,
      trackingNumber,
      notes,
      estimatedDelivery,
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  });

  bulkUpdateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { orderIds, status, carrier, trackingNumber, notes } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      res.status(400).json({ success: false, message: 'orderIds array is required' });
      return;
    }

    const updatedOrders = [];
    for (const id of orderIds) {
      try {
        const o = await orderService.updateOrderStatus(id, status as OrderStatus, {
          carrier,
          trackingNumber,
          notes,
        });
        updatedOrders.push(o);
      } catch (err: any) {
        console.warn(`Bulk update error for order ${id}:`, err.message);
      }
    }

    res.json({
      success: true,
      message: `Successfully updated ${updatedOrders.length} orders`,
      data: updatedOrders,
    });
  });

  cancelOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id?.toString() || req.user!.userId;
    const order = await orderService.cancelOrder(req.params.id, userId);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  });

  getOrderStats = asyncHandler(async (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {},
    });
  });
}

export const orderController = new OrderController();
