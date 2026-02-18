import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ChevronLeft, Package, MapPin, CreditCard, Truck,
    Calendar, Clock, Tag, AlertCircle, ExternalLink, Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchOrderDetails, cancelOrder } from "@/lib/api";

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState("Changed my mind");
    const [showCancelModal, setShowCancelModal] = useState(false);

    useEffect(() => {
        const loadOrder = async () => {
            if (!id) return;
            try {
                const res = await fetchOrderDetails(id);
                if (res.success) {
                    setOrder(res.data);
                }
            } catch (err: any) {
                toast.error(err.message || "Failed to load order details");
                navigate("/profile");
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [id, navigate]);

    const handleCancel = async () => {
        if (!id) return;
        setCancelling(true);
        try {
            const res = await cancelOrder(id, cancelReason);
            if (res.success) {
                toast.success("Order cancelled successfully");
                setOrder({ ...order, status: "cancelled" });
                setShowCancelModal(false);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to cancel order");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary animate-bounce" />
                        </div>
                        <p className="text-muted-foreground font-medium">Fetching your order details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!order) return null;

    const statusColors: any = {
        pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        shipped: "bg-primary/10 text-primary border-primary/20",
        delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    };

    return (
        <div className="min-h-screen bg-background flex flex-col antialiased">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 ">
                <header className="mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Orders
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-display font-bold text-foreground">Order #{order.orderNumber}</h1>
                                <Badge variant="outline" className={`capitalize rounded-full px-4 py-1 font-bold ${statusColors[order.status]}`}>
                                    {order.status}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                        {order.status === "pending" && (
                            <Button
                                variant="destructive"
                                className="rounded-xl px-6 h-11 uppercase font-bold text-[10px] tracking-widest shadow-lg shadow-destructive/20"
                                onClick={() => setShowCancelModal(true)}
                            >
                                Cancel Order
                            </Button>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Items & Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-border/50 bg-card shadow-sm rounded-3xl overflow-hidden">
                            <div className="px-6 py-5 border-b border-border/40 bg-secondary/10 flex items-center gap-3">
                                <Package className="h-5 w-5 text-primary" />
                                <h2 className="font-display font-bold text-lg">Order Items</h2>
                            </div>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border/40">
                                    {order.items.map((item: any) => (
                                        <div key={item._id} className="p-6 flex items-center gap-6 group hover:bg-secondary/5 transition-colors">
                                            <div className="w-20 h-20 rounded-2xl bg-secondary/50 border border-border/50 overflow-hidden shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h3 className="font-bold text-foreground truncate">{item.name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Qty: <span className="text-foreground font-medium">{item.quantity}</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium">${item.price.toFixed(2)} / unit</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-8 bg-secondary/20 space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Subtotal</span>
                                        <span className="text-foreground font-bold">${order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Shipping Charge</span>
                                        <span className="text-foreground font-bold">{order.shippingFee === 0 ? "FREE" : `$${order.shippingFee.toFixed(2)}`}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Tax & GST</span>
                                        <span className="text-foreground font-bold">${order.tax.toFixed(2)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-sm text-emerald-600">
                                            <span className="font-bold flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                Discount Applied
                                            </span>
                                            <span className="font-bold">-${order.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="pt-4 mt-2 border-t border-border/60 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Final Paid Amount</p>
                                            <p className="text-3xl font-display font-bold text-primary">${order.total.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-full px-3 text-[10px] uppercase font-bold tracking-tight">
                                                Payment Successful
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shipping Info */}
                            <Card className="border-border/50 bg-card shadow-sm rounded-3xl overflow-hidden">
                                <div className="px-6 py-4 border-b border-border/40 bg-secondary/10 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <h2 className="font-bold text-sm uppercase tracking-widest">Shipping Address</h2>
                                </div>
                                <CardContent className="p-6">
                                    <p className="font-bold text-foreground mb-1">{order.shippingAddress.fullName}</p>
                                    <p className="text-sm text-muted-foreground mb-3">{order.shippingAddress.phone}</p>
                                    <div className="text-sm text-muted-foreground leading-relaxed">
                                        {order.shippingAddress.addressLine1}<br />
                                        {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                                        {order.shippingAddress.country}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Info */}
                            <Card className="border-border/50 bg-card shadow-sm rounded-3xl overflow-hidden">
                                <div className="px-6 py-4 border-b border-border/40 bg-secondary/10 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                    <h2 className="font-bold text-sm uppercase tracking-widest">Payment Method</h2>
                                </div>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Method</p>
                                            <p className="text-sm font-bold text-foreground uppercase">{order.paymentMethod}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-emerald-600" />
                                        <p className="text-xs font-medium text-emerald-700">Transaction Secured & Verified</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Tracking & Timeline */}
                    <div className="space-y-6">
                        <Card className="border-border/50 bg-card shadow-sm rounded-3xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-border/40 bg-secondary/10 flex items-center gap-2">
                                <Truck className="h-4 w-4 text-primary" />
                                <h2 className="font-bold text-sm uppercase tracking-widest">Order Timeline</h2>
                            </div>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {[
                                        { label: "Order Placed", date: order.createdAt, done: true },
                                        { label: "Processing", date: order.processedAt, done: ["shipped", "delivered"].includes(order.status) },
                                        { label: "Shipped", date: order.shippedAt, done: order.status === "delivered" },
                                        { label: "Delivered", date: order.deliveredAt, done: order.status === "delivered" },
                                    ].map((step, idx, arr) => (
                                        <div key={idx} className="flex gap-4 relative">
                                            {idx !== arr.length - 1 && (
                                                <div className={`absolute left-[7px] top-4 w-[2px] h-10 ${step.done ? "bg-primary" : "bg-border/40"}`} />
                                            )}
                                            <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-1 transition-colors ${step.done ? "bg-primary border-primary" : "border-border"
                                                }`} />
                                            <div>
                                                <p className={`text-sm font-bold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                                                    {step.label}
                                                </p>
                                                {step.date ? (
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                        {new Date(step.date).toLocaleDateString()} at {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                ) : (
                                                    <p className="text-[10px] text-muted-foreground italic mt-0.5">Pending</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {order.notes && (
                            <Card className="border-border/50 bg-card shadow-sm rounded-3xl overflow-hidden">
                                <div className="px-6 py-4 bg-secondary/10 flex items-center gap-2 border-b border-border/40">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <h2 className="font-bold text-sm uppercase tracking-widest">Order Notes</h2>
                                </div>
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                                        "{order.notes}"
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>

            <Footer />

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-sm bg-card border border-border rounded-[32px] p-8 shadow-2xl"
                    >
                        <AlertCircle className="h-12 w-12 text-destructive mb-6" />
                        <h2 className="text-xl font-display font-bold mb-2">Cancel your order?</h2>
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                            This action cannot be undone. Our warehouse will stop processing shipments immediately.
                        </p>

                        <div className="space-y-2 mb-8">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Reason for cancellation</label>
                            <select
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="w-full bg-secondary/50 border border-border/60 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option>Changed my mind</option>
                                <option>Found better price elsewhere</option>
                                <option>Ordered by mistake</option>
                                <option>Wait time too long</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 rounded-2xl h-12" onClick={() => setShowCancelModal(false)}>Keep Order</Button>
                            <Button variant="destructive" className="flex-1 rounded-2xl h-12" onClick={handleCancel} disabled={cancelling}>
                                {cancelling ? "Processing..." : "Yes, Cancel"}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;
