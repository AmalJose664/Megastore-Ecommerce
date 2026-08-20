import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ChevronLeft, Package, MapPin, CreditCard, Truck,
    Calendar, Clock, Tag, AlertCircle, ExternalLink, Shield, Printer,
    Star, MessageSquare, CheckCircle2, X, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchOrderDetails, cancelOrder } from "@/lib/api";
import { generateOrderPdf } from "@/lib/pdfGenerator";
import { useSiteSettings } from "@/context/SettingsContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSiteSettings();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState("Changed my mind");
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Review Modal States
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewItem, setReviewItem] = useState<any>(null);
    const [ratingInput, setRatingInput] = useState(5);
    const [titleInput, setTitleInput] = useState('');
    const [commentInput, setCommentInput] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewedProductIds, setReviewedProductIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadOrderAndReviews = async () => {
            if (!id) return;
            try {
                const res = await fetchOrderDetails(id);
                if (res.success) {
                    setOrder(res.data);
                }

                // Check user's submitted reviews
                const token = localStorage.getItem('accessToken');
                if (token) {
                    const revRes = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const revData = await revRes.json();
                    if (revData.success && Array.isArray(revData.data)) {
                        const setIds = new Set<string>();
                        revData.data.forEach((r: any) => {
                            const pId = typeof r.product === 'object' ? (r.product._id || r.product.id) : r.product;
                            if (pId) setIds.add(pId);
                        });
                        setReviewedProductIds(setIds);
                    }
                }
            } catch (err: any) {
                toast.error(err.message || "Failed to load order details");
                navigate("/profile");
            } finally {
                setLoading(false);
            }
        };
        loadOrderAndReviews();
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

    const handleOpenReviewModal = (item: any) => {
        setReviewItem(item);
        setRatingInput(5);
        setTitleInput('');
        setCommentInput('');
        setShowReviewModal(true);
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewItem || !titleInput.trim() || !commentInput.trim()) {
            toast.error("Please enter a title and comment for your review.");
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const productId = typeof reviewItem.product === 'object' ? (reviewItem.product._id || reviewItem.product.id) : reviewItem.product;

        setSubmittingReview(true);
        try {
            const res = await fetch(`${API_BASE_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    product: productId,
                    rating: ratingInput,
                    title: titleInput.trim(),
                    comment: commentInput.trim(),
                }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Thank you! Review submitted successfully.");
                setShowReviewModal(false);
                setReviewedProductIds(prev => new Set(prev).add(productId));
            } else {
                toast.error(data.message || "Failed to submit review");
            }
        } catch (err: any) {
            toast.error(err.message || "Error submitting review");
        } finally {
            setSubmittingReview(false);
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

                        <div className="flex items-center gap-2">
                            {['delivered', 'shipped'].includes(order.status) ? (
                                <Button
                                    variant="outline"
                                    onClick={() => generateOrderPdf(order, settings)}
                                    className="rounded-xl px-4 h-11 border-border font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                                >
                                    <Printer className="h-4 w-4" /> Download PDF Invoice
                                </Button>
                            ) : (
                                <span className="text-[11px] font-semibold text-muted-foreground bg-secondary/50 border border-border/50 px-3.5 py-2 rounded-xl">
                                    Invoice available upon delivery
                                </span>
                            )}
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
                                    {order.items.map((item: any) => {
                                        const prodId = typeof item.product === 'object' ? (item.product?._id || item.product?.id) : item.product;
                                        const hasReviewed = reviewedProductIds.has(prodId);
                                        const isEligibleForReview = ['delivered', 'paid', 'shipped'].includes(order.status);

                                        return (
                                            <div key={item._id || item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:bg-secondary/5 transition-colors">
                                                <div className="flex items-center gap-6 min-w-0 flex-1">
                                                    <div className="w-20 h-20 rounded-2xl bg-secondary/50 border border-border/50 overflow-hidden shrink-0">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <h3 className="font-bold text-foreground truncate">{item.name}</h3>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Qty: <span className="text-foreground font-medium">{item.quantity}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                                                    <div className="text-right">
                                                        <p className="font-bold text-primary">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                        <p className="text-[10px] text-muted-foreground font-medium">₹{item.price.toFixed(2)} / unit</p>
                                                    </div>

                                                    {/* Review Button per item */}
                                                    {isEligibleForReview && (
                                                        hasReviewed ? (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full">
                                                                <CheckCircle2 className="h-3.5 w-3.5" /> Reviewed ⭐
                                                            </span>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleOpenReviewModal(item)}
                                                                className="rounded-xl border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5"
                                                            >
                                                                <Star className="h-3.5 w-3.5 fill-primary" /> Write Review
                                                            </Button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-8 bg-secondary/20 space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Subtotal</span>
                                        <span className="text-foreground font-bold">₹{order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Shipping Charge</span>
                                        <span className="text-foreground font-bold">{order.shippingFee === 0 ? "FREE" : `₹${order.shippingFee.toFixed(2)}`}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Tax & GST</span>
                                        <span className="text-foreground font-bold">₹{order.tax.toFixed(2)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-sm text-emerald-600">
                                            <span className="font-bold flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                Discount Applied
                                            </span>
                                            <span className="font-bold">-₹{order.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="pt-4 mt-2 border-t border-border/60 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Final Paid Amount</p>
                                            <p className="text-3xl font-display font-bold text-primary">₹{order.total.toFixed(2)}</p>
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
                        {/* Courier Shipment Details Card */}
                        {(order.carrier || order.trackingNumber || ['shipped', 'delivered'].includes(order.status)) && (
                            <Card className="border-primary/30 bg-card shadow-lg rounded-3xl overflow-hidden border-l-4 border-l-primary">
                                <div className="px-6 py-4 border-b border-border/40 bg-primary/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-primary" />
                                        <h2 className="font-bold text-sm uppercase tracking-widest text-primary">Shipment & Courier Info</h2>
                                    </div>
                                    <Badge variant="outline" className="capitalize text-[10px] font-bold px-3 rounded-full border-primary/30 text-primary">
                                        {order.status}
                                    </Badge>
                                </div>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Courier Partner</p>
                                            <p className="text-sm font-bold text-foreground mt-0.5">{order.carrier || 'Standard Shipping'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tracking Number</p>
                                            <p className="text-sm font-mono font-bold text-foreground mt-0.5">{order.trackingNumber || 'Pending'}</p>
                                        </div>
                                    </div>

                                    {order.estimatedDelivery && (
                                        <div className="pt-2 border-t border-border/40">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Est. Delivery</p>
                                            <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                                                {new Date(order.estimatedDelivery).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    )}

                                    {order.trackingNumber && (
                                        <div className="pt-2">
                                            <a
                                                href={
                                                    (() => {
                                                        const c = (order.carrier || '').toLowerCase();
                                                        const t = encodeURIComponent(order.trackingNumber.trim());
                                                        if (c.includes('bluedart')) return `https://www.bluedart.com/tracking?trackNumber=${t}`;
                                                        if (c.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${t}`;
                                                        if (c.includes('delhivery')) return `https://www.delhivery.com/track/package/${t}`;
                                                        if (c.includes('dhl')) return `https://www.dhl.com/en/express/tracking.html?AWB=${t}`;
                                                        if (c.includes('speed') || c.includes('india post')) return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignmentNo=${t}`;
                                                        if (c.includes('dtdc')) return `https://www.dtdc.in/tracking/shipment-tracking.asp?strTxtTrackNo=${t}`;
                                                        return `https://www.google.com/search?q=${encodeURIComponent((order.carrier || '') + ' tracking ' + order.trackingNumber)}`;
                                                    })()
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider py-3 px-4 shadow-md shadow-primary/20 hover:opacity-90 transition-opacity"
                                            >
                                                <ExternalLink className="h-4 w-4" /> Track Package on {order.carrier || 'Courier'}
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Interactive Step-by-Step Visual Stepper */}
                        <Card className="border-border/50 bg-card shadow-sm rounded-3xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-border/40 bg-secondary/10 flex items-center gap-2">
                                <Truck className="h-4 w-4 text-primary" />
                                <h2 className="font-bold text-sm uppercase tracking-widest">Order Shipment Stepper</h2>
                            </div>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {[
                                        { label: "Order Placed", date: order.createdAt, done: true },
                                        { label: "Processing", date: order.processedAt, done: ["processing", "shipped", "delivered"].includes(order.status) },
                                        { label: "Shipped", date: order.shippedAt, done: ["shipped", "delivered"].includes(order.status) },
                                        { label: "Delivered", date: order.deliveredAt, done: order.status === "delivered" },
                                    ].map((step, idx, arr) => (
                                        <div key={idx} className="flex gap-4 relative">
                                            {idx !== arr.length - 1 && (
                                                <div className={`absolute left-[7px] top-4 w-[2px] h-10 ${step.done ? "bg-primary" : "bg-border/40"}`} />
                                            )}
                                            <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-1 transition-colors ${step.done ? "bg-primary border-primary ring-4 ring-primary/20" : "border-border"
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
                                    <h2 className="font-bold text-sm uppercase tracking-widest">Fulfillment Notes</h2>
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

            {/* Write Review Modal */}
            {showReviewModal && reviewItem && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl relative"
                    >
                        <button
                            onClick={() => setShowReviewModal(false)}
                            className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-2xl font-display font-bold mb-1">Write a Review</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Reviewing: <span className="font-semibold text-foreground">{reviewItem.name}</span>
                        </p>

                        <form onSubmit={handleReviewSubmit} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Overall Rating</label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setRatingInput(star)}
                                            className="p-1 hover:scale-110 transition-transform"
                                        >
                                            <Star className={`h-7 w-7 ${star <= ratingInput ? "fill-primary text-primary" : "text-muted"}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Review Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Excellent build quality!"
                                    value={titleInput}
                                    onChange={(e) => setTitleInput(e.target.value)}
                                    className="w-full bg-secondary/50 border border-border/60 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Your Review</label>
                                <textarea
                                    rows={4}
                                    placeholder="What did you like or dislike about this product?"
                                    value={commentInput}
                                    onChange={(e) => setCommentInput(e.target.value)}
                                    className="w-full bg-secondary/50 border border-border/60 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" type="button" className="flex-1 rounded-xl h-12" onClick={() => setShowReviewModal(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1 rounded-xl h-12 font-bold uppercase tracking-widest text-xs" disabled={submittingReview}>
                                    {submittingReview ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Submit Review"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;
