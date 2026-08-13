import { addressRepository } from '../repositories/address.repository';
import { IAddress } from '../types';
import { ApiError } from '../utils/ApiError';

export class AddressService {
    async getMyAddresses(userId: string): Promise<IAddress[]> {
        return addressRepository.findByUser(userId);
    }

    async getAddressById(id: string, userId: string): Promise<IAddress> {
        const address = await addressRepository.findById(id);
        if (!address) throw ApiError.notFound('Address not found');
        if (address.user.toString() !== userId) throw ApiError.forbidden('Access denied');
        return address;
    }

    async createAddress(userId: string, data: Partial<IAddress>): Promise<IAddress> {
        // If setting as default, clear other defaults first
        if (data.isDefault) {
            await addressRepository.clearDefaults(userId);
        }

        // If it's the first address, make it default
        const existingAddresses = await addressRepository.findByUser(userId);
        if (existingAddresses.length === 0) {
            data.isDefault = true;
        }

        return addressRepository.create({ ...data, user: userId as any });
    }

    async updateAddress(id: string, userId: string, data: Partial<IAddress>): Promise<IAddress> {
        const address = await addressRepository.findById(id);
        if (!address) throw ApiError.notFound('Address not found');
        if (address.user.toString() !== userId) throw ApiError.forbidden('Access denied');

        if (data.isDefault) {
            await addressRepository.clearDefaults(userId, id);
        }

        const updated = await addressRepository.updateById(id, data);
        return updated!;
    }

    async deleteAddress(id: string, userId: string): Promise<void> {
        const address = await addressRepository.findById(id);
        if (!address) throw ApiError.notFound('Address not found');
        if (address.user.toString() !== userId) throw ApiError.forbidden('Access denied');

        await addressRepository.deleteById(id);

        // If deleted address was default, set another one as default if exists
        if (address.isDefault) {
            const remaining = await addressRepository.findByUser(userId);
            if (remaining.length > 0) {
                await addressRepository.updateById(remaining[0]._id.toString(), { isDefault: true });
            }
        }
    }

    async setDefaultAddress(id: string, userId: string): Promise<IAddress> {
        const address = await addressRepository.findById(id);
        if (!address) throw ApiError.notFound('Address not found');
        if (address.user.toString() !== userId) throw ApiError.forbidden('Access denied');

        await addressRepository.clearDefaults(userId, id);
        const updated = await addressRepository.updateById(id, { isDefault: true });
        return updated!;
    }
}

export const addressService = new AddressService();
