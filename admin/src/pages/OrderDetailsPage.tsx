import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Truck, Printer, ExternalLink, Calendar, MessageSquare, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { settingService } from '@/services/settingService';
import { generateOrderPdf } from '@/utils/pdfGenerator';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Order, SiteSettings } from '@/types';
import { format } from 'date-fns';

const COURIER_OPTIONS = ['BlueDart', 'FedEx', 'Delhivery', 'DHL', 'SpeedPost (India Post)', 'DTDC', 'Other'];

export const getTrackingUrl = (carrier?: string, trackingNumber?: string): string | null => {
  if (!trackingNumber) return null;
  const c = (carrier || '').toLowerCase();
  const t = encodeURIComponent(trackingNumber.trim());

  if (c.includes('bluedart')) return `https://www.bluedart.com/tracking?trackNumber=${t}`;
  if (c.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${t}`;
  if (c.includes('delhivery')) return `https://www.delhivery.com/track/package/${t}`;
  if (c.includes('dhl')) return `https://www.dhl.com/en/express/tracking.html?AWB=${t}`;
  if (c.includes('speed') || c.includes('india post')) return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignmentNo=${t}`;
  if (c.includes('dtdc')) return `https://www.dtdc.in/tracking/shipment-tracking.asp?strTxtTrackNo=${t}`;

  return `https://www.google.com/search?q=${encodeURIComponent((carrier || '') + ' tracking ' + trackingNumber)}`;
};

export default function OrderDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<Order['status']>('pending');

  // Modal / Form States
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [carrierInput, setCarrierInput] = useState('BlueDart');
  const [customCarrier, setCustomCarrier] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [estDeliveryInput, setEstDeliveryInput] = useState('');

  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchOrderDetails();
    } else if (id === 'undefined') {
      setIsLoading(false);
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    const [data, settingsData] = await Promise.all([
      orderService.getOrderById(id!),
      settingService.getSettings(),
    ]);

    if (settingsData) {
      setSiteSettings(settingsData);
    }

    if (data) {
      setOrder(data);
      setStatus(data.status);
      setCarrierInput(data.carrier || 'BlueDart');
      setTrackingNumberInput(data.trackingNumber || '');
      setNotesInput(data.notes || '');
    } else {
      toast({
        title: 'Error',
        description: 'Order not found',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const getNextStatus = (curr: string): string | null => {
    const lower = (curr || '').toLowerCase();
    switch (lower) {
      case 'pending':
      case 'paid':
        return 'processing';
      case 'processing':
        return 'shipped';
      case 'shipped':
        return 'delivered';
      default:
        return null;
    }
  };

  const handleOpenStatusModal = (nextSt: string) => {
    setTargetStatus(nextSt);
    setShowStatusModal(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!order) return;

    if (targetStatus === 'shipped') {
      const finalCarrier = carrierInput === 'Other' ? customCarrier.trim() : carrierInput;
      if (!finalCarrier) {
        toast({ title: 'Validation Error', description: 'Please specify the Courier Partner.', variant: 'destructive' });
        return;
      }
      if (!trackingNumberInput.trim()) {
        toast({ title: 'Validation Error', description: 'Please enter a valid Tracking / AWB Number.', variant: 'destructive' });
        return;
      }
    }

    setIsUpdating(true);
    const finalCarrierName = carrierInput === 'Other' ? customCarrier.trim() : carrierInput;

    const result = await orderService.updateOrderStatus(order.id || order._id!, targetStatus, {
      carrier: targetStatus === 'shipped' || order.carrier ? finalCarrierName : undefined,
      trackingNumber: trackingNumberInput.trim() || undefined,
      notes: notesInput.trim() || undefined,
      estimatedDelivery: estDeliveryInput || undefined,
    });

    if (result.success) {
      setStatus(targetStatus as Order['status']);
      if (result.data) {
        setOrder(result.data);
      } else {
        fetchOrderDetails();
      }
      toast({
        title: 'Status Updated',
        description: `Order status advanced to ${targetStatus.toUpperCase()}`,
      });
      setShowStatusModal(false);
    } else {
      toast({
        title: 'Update Failed',
        description: result.error || 'Failed to update order status',
        variant: 'destructive',
      });
    }
    setIsUpdating(false);
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setIsUpdating(true);
    const result = await orderService.updateOrderStatus(order.id || order._id!, 'cancelled', {
      notes: 'Cancelled by administrator.',
    });

    if (result.success) {
      setStatus('cancelled');
      fetchOrderDetails();
      toast({
        title: 'Order Cancelled',
        description: 'Order has been marked as cancelled.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to cancel order',
        variant: 'destructive',
      });
    }
    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-medium">Order not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const nextStatus = getNextStatus(status);
  const trackingUrl = getTrackingUrl(order.carrier, order.trackingNumber);

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.orderNumber}
        description={`Placed on ${format(new Date(order.createdAt), 'MMMM dd, yyyy HH:mm')}`}
        actions={
          <div className="flex items-center gap-2">
            {['delivered', 'shipped'].includes(status) ? (
              <Button variant="outline" onClick={() => generateOrderPdf(order, siteSettings || undefined)}>
                <Printer className="w-4 h-4 mr-2" />
                Download PDF Invoice
              </Button>
            ) : (
              <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-2 rounded-md">
                Invoice available upon delivery
              </span>
            )}
            <Button variant="outline" onClick={() => navigate('/orders')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card-elevated">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-xs text-foreground">Order Items</h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item._id || item.id} className="p-3 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      ₹{item.price.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-xs">₹{item.total.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="p-3.5 bg-muted/30 border-t border-border space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>₹{order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shippingFee === 0 ? 'Free' : `₹${order.shippingFee.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-border">
                <span>Total</span>
                <span>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Courier Shipment & Tracking Info Card */}
          {(order.carrier || order.trackingNumber || ['shipped', 'delivered'].includes(status)) && (
            <div className="card-elevated border-l-4 border-l-primary">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold text-xs text-foreground">Shipment & Courier Details</h2>
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Courier Partner</Label>
                    <p className="font-semibold text-foreground text-xs mt-0.5">{order.carrier || 'Not assigned yet'}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Tracking / AWB Number</Label>
                    <p className="font-mono font-bold text-foreground text-xs mt-0.5">{order.trackingNumber || 'Pending dispatch'}</p>
                  </div>
                </div>

                {trackingUrl && (
                  <div className="pt-2">
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline bg-primary/10 px-4 py-2 rounded-lg border border-primary/20"
                    >
                      <ExternalLink className="w-4 h-4" /> Track Package on {order.carrier || 'Courier Portal'}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          <div className="card-elevated">
            <div className="p-6 border-b border-border flex items-center gap-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Shipping Address</h2>
            </div>
            <div className="p-6">
              {order.shippingAddress ? (
                <>
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
                  <p className="text-muted-foreground mt-2">
                    {order.shippingAddress.addressLine1}<br />
                    {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                    {order.shippingAddress.country}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">No shipping address available</p>
              )}
            </div>
          </div>

          {/* Admin / Order Notes */}
          {order.notes && (
            <div className="card-elevated">
              <div className="p-6 border-b border-border flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-semibold">Order / Fulfillment Notes</h2>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground italic">"{order.notes}"</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status & Next Action Workflow */}
          <div className="card-elevated p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Order Workflow</h2>
              </div>
              <StatusBadge status={status} />
            </div>

            {/* Next Status Advance Action */}
            {nextStatus ? (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Advancing status follows a strict pipeline: <strong className="capitalize">{status}</strong> → <strong className="capitalize text-primary">{nextStatus}</strong>.
                </p>
                <Button
                  onClick={() => handleOpenStatusModal(nextStatus)}
                  className="w-full font-bold uppercase tracking-wider text-xs h-11 flex items-center justify-center gap-2"
                >
                  Advance to {nextStatus.toUpperCase()} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ) : status === 'delivered' ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" /> Order fully delivered and completed.
              </div>
            ) : (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> Order has been cancelled.
              </div>
            )}

            {/* Option to cancel order */}
            {['pending', 'processing'].includes(status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelOrder}
                className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 text-xs font-semibold mt-2"
              >
                Cancel Order
              </Button>
            )}
          </div>

          {/* Payment Info */}
          <div className="card-elevated p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Payment</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium uppercase">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="card-elevated p-6 space-y-4">
            <h2 className="font-semibold">Customer</h2>
            <div className="space-y-2">
              <p className="font-medium">{order.customer?.name || order.shippingAddress?.fullName || 'Guest User'}</p>
              <p className="text-sm text-muted-foreground">{order.customer?.email || 'No email registered'}</p>
              {order.customer?.id && (
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate(`/users/${order.customer.id}`)}>
                  View Customer Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Progression Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> Advance Status to <span className="uppercase text-primary">{targetStatus}</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Updating status from <strong className="uppercase">{status}</strong> to <strong className="uppercase text-primary">{targetStatus}</strong>.
              </p>
            </div>

            {targetStatus === 'shipped' && (
              <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                <div className="space-y-2">
                  <Label htmlFor="carrier">Courier Partner *</Label>
                  <select
                    id="carrier"
                    value={carrierInput}
                    onChange={(e) => setCarrierInput(e.target.value)}
                    className="w-full bg-background border border-input rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {COURIER_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {carrierInput === 'Other' && (
                  <div className="space-y-2">
                    <Label htmlFor="customCarrier">Specify Courier Name *</Label>
                    <Input
                      id="customCarrier"
                      placeholder="e.g. BlueDart Express"
                      value={customCarrier}
                      onChange={(e) => setCustomCarrier(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="trackingNumber">Tracking / AWB Number *</Label>
                  <Input
                    id="trackingNumber"
                    placeholder="e.g. BD123456789IN"
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estDelivery">Estimated Delivery Date</Label>
                  <Input
                    id="estDelivery"
                    type="date"
                    value={estDeliveryInput}
                    onChange={(e) => setEstDeliveryInput(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Admin / Dispatch Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="e.g. Package dispatched via BlueDart. Expected delivery in 3 business days."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmStatusUpdate} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : `Confirm & Set to ${targetStatus.toUpperCase()}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

