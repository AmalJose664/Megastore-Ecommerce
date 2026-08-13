import { Request, Response } from 'express';
import { couponService } from '../services/coupon.service';
import { asyncHandler } from '../utils/asyncHandler';

export class CouponController {
    getAllCoupons = asyncHandler(async (_req: Request, res: Response) => {
        const coupons = await couponService.getAllCoupons();
        res.json({
            success: true,
            data: coupons,
        });
    });

    getListedCoupons = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        const coupons = await couponService.getListedCoupons(userId);
        res.json({
            success: true,
            data: coupons,
        });
    });

    getCouponById = asyncHandler(async (req: Request, res: Response) => {
        const coupon = await couponService.getCouponById(req.params.id);
        res.json({
            success: true,
            data: coupon,
        });
    });

    createCoupon = asyncHandler(async (req: Request, res: Response) => {
        const coupon = await couponService.createCoupon(req.body);
        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: coupon,
        });
    });

    updateCoupon = asyncHandler(async (req: Request, res: Response) => {
        const coupon = await couponService.updateCoupon(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Coupon updated successfully',
            data: coupon,
        });
    });

    deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
        await couponService.deleteCoupon(req.params.id);
        res.json({
            success: true,
            message: 'Coupon deleted successfully',
        });
    });

    validateCoupon = asyncHandler(async (req: Request, res: Response) => {
        const { code, cartTotal } = req.body;
        const userId = req.user?.userId;
        const coupon = await couponService.validateCoupon(code, cartTotal, userId);
        const discount = couponService.calculateDiscount(coupon, cartTotal);

        res.json({
            success: true,
            data: {
                coupon,
                discount,
                finalTotal: cartTotal - discount,
            },
        });
    });
}

export const couponController = new CouponController();
