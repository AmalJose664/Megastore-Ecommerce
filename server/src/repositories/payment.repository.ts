import { BaseRepository } from './base.repository';
import { Payment } from '../models';
import { IPayment, PaymentStatus } from '../types';

export class PaymentRepository extends BaseRepository<IPayment> {
  constructor() {
    super(Payment);
  }

  async findByOrderId(orderId: string): Promise<IPayment | null> {
    return this.model.findOne({ order: orderId }).sort({ createdAt: -1 });
  }

  async findByTransactionId(transactionId: string): Promise<IPayment | null> {
    return this.model.findOne({ transactionId });
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    gatewayResponse?: any
  ): Promise<IPayment | null> {
    const updateData: any = { status };
    if (gatewayResponse) {
      updateData.gatewayResponse = gatewayResponse;
    }
    return this.model.findByIdAndUpdate(paymentId, updateData, { new: true });
  }

  async updateByTransactionId(
    transactionId: string,
    status: PaymentStatus,
    gatewayResponse?: any
  ): Promise<IPayment | null> {
    const updateData: any = { status };
    if (gatewayResponse) {
      updateData.gatewayResponse = gatewayResponse;
    }
    return this.model.findOneAndUpdate({ transactionId }, updateData, { new: true });
  }
}

export const paymentRepository = new PaymentRepository();
