import { Request, Response } from 'express';
import { addressService } from '../services/address.service';
import { asyncHandler } from '../utils/asyncHandler';

export class AddressController {
    getMyAddresses = asyncHandler(async (req: Request, res: Response) => {
        const addresses = await addressService.getMyAddresses(req.user!.userId);
        res.json({
            success: true,
            data: addresses,
        });
    });

    getAddressById = asyncHandler(async (req: Request, res: Response) => {
        const address = await addressService.getAddressById(req.params.id, req.user!.userId);
        res.json({
            success: true,
            data: address,
        });
    });

    createAddress = asyncHandler(async (req: Request, res: Response) => {
        const address = await addressService.createAddress(req.user!.userId, req.body);
        res.status(201).json({
            success: true,
            message: 'Address created successfully',
            data: address,
        });
    });

    updateAddress = asyncHandler(async (req: Request, res: Response) => {
        const address = await addressService.updateAddress(req.params.id, req.user!.userId, req.body);
        res.json({
            success: true,
            message: 'Address updated successfully',
            data: address,
        });
    });

    deleteAddress = asyncHandler(async (req: Request, res: Response) => {
        await addressService.deleteAddress(req.params.id, req.user!.userId);
        res.json({
            success: true,
            message: 'Address deleted successfully',
        });
    });

    setDefaultAddress = asyncHandler(async (req: Request, res: Response) => {
        const address = await addressService.setDefaultAddress(req.params.id, req.user!.userId);
        res.json({
            success: true,
            message: 'Default address updated successfully',
            data: address,
        });
    });
}

export const addressController = new AddressController();
