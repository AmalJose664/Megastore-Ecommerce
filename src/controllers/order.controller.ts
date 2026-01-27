import { Request, Response } from 'express';
import { orderService } from '../services';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';
import { OrderStatus } from '../types';

export class OrderController {
  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.createOrder(req.user!.userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  });

  getUserOrders = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = parsePagination(req.query);
    const result = await orderService.getUserOrders(req.user!.userId, page, limit);

    res.json(result);
  });

  getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.getOrderById(req.params.id, req.user!.userId);

    res.json({
      success: true,
      data: order,
    });
  });

  getAllOrders = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = parsePagination(req.query);
    const result = await orderService.getAllOrders(page, limit);

    res.json(result);
  });

  updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status as OrderStatus);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  });

  cancelOrder = asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body;
    const order = await orderService.cancelOrder(req.params.id, req.user!.userId, reason);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  });

  getOrderStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await orderService.getOrderStats();

    res.json({
      success: true,
      data: stats,
    });
  });
}

export const orderController = new OrderController();