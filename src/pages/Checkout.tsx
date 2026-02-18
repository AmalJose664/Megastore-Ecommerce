import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CreditCard, Shield, Check, ChevronLeft, Truck, Package, Plus, Star, Pencil, Trash2, Tag, Ticket, Loader2, Minus
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, validateCoupon, fetchCoupons, createOrder } from "@/lib/api";
import { AddressList } from "@/components/profile/AddressList";
import { AddressModal } from "@/components/profile/Address";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X } from "lucide-react";

/* ─── API helpers ─────────────────────────────────────────────── */
const api = {
  getAll: () => apiRequest("/addresses"),
  create: (body) => apiRequest("/addresses", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => apiRequest(`/addresses/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  setDefault: (id) => apiRequest(`/addresses/${id}/default`, { method: "PATCH" }),
  delete: (id) => apiRequest(`/addresses/${id}`, { method: "DELETE" }),
};

const EMPTY_FORM = {
  fullName: "", phone: "", addressLine1: "", addressLine2: "",
  city: "", state: "", postalCode: "", country: "India", isDefault: false,
};

const Checkout = () => {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);

  /* ─── Address State ─────────────────────────────────────────── */
  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  /* ─── Coupon State ─────────────────────────────────────────── */
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [availableLoading, setAvailableLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    if (!user) return;
    api.getAll().then(res => {
      if (res.success) {
        setAddresses(res.data);
        const def = res.data.find(a => a.isDefault);
        if (def) setSelectedAddressId(def._id);
        else if (res.data.length) setSelectedAddressId(res.data[0]._id);
      }
    }).finally(() => setAddrLoading(false));

    setAvailableLoading(true);
    fetchCoupons().then(res => {
      console.log("Coupons fetched:", res);
      if (res.success) {
        setAvailableCoupons(res.data || []);
      }
    }).catch(err => {
      console.error("Failed to fetch coupons:", err);
    }).finally(() => setAvailableLoading(false));
  }, [user]);

  const openNew = () => { setEditTarget(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (addr) => { setEditTarget(addr); setForm({ ...addr }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleSaveAddress = async () => {
    setSaving(true);
    try {
      if (editTarget) {
        const res = await api.update(editTarget._id, form);
        if (res.success) setAddresses(prev => prev.map(a => a._id === editTarget._id ? res.data : a));
      } else {
        const res = await api.create(form);
        if (res.success) {
          setAddresses(prev => {
            let list = res.data.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev;
            return [...list, res.data];
          });
          if (!selectedAddressId) setSelectedAddressId(res.data._id);
        }
      }
      closeModal();
    } finally { setSaving(false); }
  };

  const handleSetDefault = async (id) => {
    const res = await api.setDefault(id);
    if (res.success) setAddresses(prev => prev.map(a => ({ ...a, isDefault: a._id === id })));
  };

  const handleDeleteAddress = async (id) => {
    const res = await api.delete(id);
    if (res.success) {
      setAddresses(prev => prev.filter(a => a._id !== id));
      if (selectedAddressId === id) setSelectedAddressId(null);
    }
    setDeleteConfirm(null);
  };

  const handleApplyCoupon = async (codeOverride?: string) => {
    const code = codeOverride || couponCode;
    if (!code.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await validateCoupon(code, subtotal);
      if (res.success) {
        // Double check if backend specifically says it's reusable or already used
        setCouponData(res.data);
        setAppliedCode(code);
        setCouponCode("");
        setCouponModalOpen(false);
        toast.success("Coupon applied successfully");
      } else {
        setCouponError(res.message || "Invalid coupon code");
        toast.error(res.message || "Invalid coupon code");
      }
    } catch (err: any) {
      const msg = err.message || "Failed to validate coupon";
      setCouponError(msg);
      toast.error(msg);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponData(null);
    setAppliedCode("");
    setCouponError("");
  };

  const getDiscount = () => {
    if (!couponData) return 0;
    const { coupon } = couponData;
    if (!coupon) return couponData.discount || 0; // Fallback to static if coupon details missing

    if (coupon.discountType === "PERCENTAGE") {
      const calculated = (subtotal * coupon.discountValue) / 100;
      return coupon.maxDiscountAmount
        ? Math.min(calculated, coupon.maxDiscountAmount)
        : calculated;
    }
    return coupon.discountValue;
  };

  const discount = getDiscount();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!selectedAddressId) return;
      setStep(3);
    } else {
      setOrderLoading(true);
      setOrderError("");
      try {
        const res = await createOrder({
          addressId: selectedAddressId!,
          paymentMethod: "cod", // Adjust based on your payment selection logic
          couponCode: appliedCode || undefined,
        });

        if (res.success) {
          setOrderComplete(true);
          clearCart();
        } else {
          setOrderError(res.message || "Failed to create order");
        }
      } catch (err: any) {
        setOrderError(err.message || "An error occurred while creating your order");
      } finally {
        setOrderLoading(false);
      }
    }
  };

  if (orderComplete) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="container max-w-lg px-4 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
            >
              <Check className="h-12 w-12 text-primary" />
            </motion.div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Order Confirmed!</h1>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Experience excellence. We've sent your receipt and delivery timeline to your email.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button variant="hero" asChild className="px-8 py-6 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                <Link to="/products">Continue Shopping</Link>
              </Button>
              <Button variant="outline" asChild className="px-8 py-6 rounded-2xl border-border/60 hover:bg-card">
                <Link to="/profile">View Account</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="container max-w-md px-4 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-8">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
            <p className="mt-3 text-muted-foreground text-lg">
              Curate your collection before proceeding to checkout.
            </p>
            <Button variant="hero" className="mt-8 px-10 py-6 rounded-2xl" asChild>
              <Link to="/products">Browse Archive</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const steps = [
    { number: 1, title: "Basket" },
    { number: 2, title: "Shipping" },
    { number: 3, title: "Payment" },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container py-8">
          {/* Back Link */}
          <Link
            to="/cart"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Cart
          </Link>

          <h1 className="mt-6 font-display text-3xl font-bold">Checkout</h1>

          {/* Progress Steps */}
          <div className="mt-8 flex items-center justify-center gap-4">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${step >= s.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                    }`}
                >
                  {step > s.number ? <Check className="h-5 w-5" /> : s.number}
                </div>
                <span
                  className={`ml-2 hidden text-sm font-medium sm:block ${step >= s.number
                    ? "text-foreground"
                    : "text-muted-foreground"
                    }`}
                >
                  {s.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-px w-8 sm:w-16 ${step > s.number ? "bg-primary" : "bg-border"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl bg-card p-6 border border-border/50 shadow-sm"
                  >
                    <h2 className="flex items-center gap-2 font-display text-2xl font-bold mb-6">
                      <Package className="h-6 w-6 text-primary" />
                      Review Basket
                    </h2>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex gap-4 p-4 rounded-xl bg-secondary/20 border border-border/40 group relative overflow-hidden">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-24 w-24 rounded-lg object-cover bg-white shadow-sm"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                            <div>
                              <div className="flex items-start justify-between">
                                <p className="font-bold text-foreground text-lg truncate pr-8">{item.product.name}</p>
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.product.id)}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all absolute top-4 right-4"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="text-sm text-primary font-bold mt-1">
                                ${item.product.price.toFixed(2)} / unit
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-1 bg-white rounded-xl border border-border/50 p-1">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <p className="font-display font-bold text-foreground">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl bg-card p-6 border border-border/50 shadow-sm"
                  >
                    <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
                      <Truck className="h-6 w-6 text-primary" />
                      Shipping Details
                    </h2>

                    <AddressList
                      addresses={addresses}
                      loading={addrLoading}
                      onOpenNew={openNew}
                      onOpenEdit={openEdit}
                      onSetDefault={handleSetDefault}
                      onDelete={handleDeleteAddress}
                      deleteConfirm={deleteConfirm}
                      setDeleteConfirm={setDeleteConfirm}
                      selectedId={selectedAddressId}
                      onSelect={(id) => setSelectedAddressId(id)}
                    />

                    {!selectedAddressId && !addrLoading && (
                      <p className="mt-4 text-sm text-destructive font-semibold flex items-center gap-2 animate-pulse">
                        <Star className="h-4 w-4 fill-destructive" /> Selection required to proceed
                      </p>
                    )}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl bg-card p-6 border border-border/50 shadow-sm"
                  >
                    <h2 className="flex items-center gap-2 font-display text-2xl font-bold mb-6">
                      <CreditCard className="h-6 w-6 text-primary" />
                      Final Confirmation
                    </h2>

                    <div className="space-y-6">
                      {/* Delivery Summary */}
                      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-display font-bold text-foreground">Delivery To</h3>
                          <button type="button" onClick={() => setStep(2)} className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Change</button>
                        </div>
                        {(() => {
                          const addr = addresses.find(a => a._id === selectedAddressId);
                          if (!addr) return <p className="text-sm text-destructive font-medium">No address selected</p>;
                          return (
                            <div className="text-sm">
                              <p className="font-bold text-foreground text-base">{addr.fullName}</p>
                              <p className="text-muted-foreground mt-1 leading-relaxed">
                                {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                                {addr.city}, {addr.state} {addr.postalCode}
                              </p>
                              <p className="text-muted-foreground mt-1">Contact: {addr.phone}</p>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Items Summary */}
                      <div className="p-5 rounded-2xl border border-border/50">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-display font-bold text-foreground">Items in Order</h3>
                          <button type="button" onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Edit Basket</button>
                        </div>
                        <div className="space-y-3">
                          {items.map((item) => (
                            <div key={item.product.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-[10px] font-bold">{item.quantity}x</span>
                                <span className="text-muted-foreground truncate max-w-[150px]">{item.product.name}</span>
                              </div>
                              <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Summary */}
                      <div className="p-5 rounded-2xl border border-border/50">
                        <h3 className="font-display font-bold text-foreground mb-4">Payment Method</h3>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/40">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-border/50">
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Secure Gateway</p>
                            <p className="text-xs text-muted-foreground">Redirecting to payment portal</p>
                          </div>
                          <div className="ml-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 flex gap-4">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="px-8 h-14 rounded-2xl border-border/60 font-bold uppercase tracking-widest text-xs"
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="hero"
                    disabled={orderLoading}
                    className="flex-1 h-14 rounded-2xl shadow-lg shadow-primary/20 font-bold uppercase tracking-widest text-xs"
                  >
                    {orderLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      step === 1 ? "Confirm & Continue" : step === 2 ? "Proceed to Finalize" : "Place Order"
                    )}
                  </Button>
                </div>
                {orderError && (
                  <p className="mt-4 text-sm text-destructive font-bold text-center bg-destructive/5 p-3 rounded-xl border border-destructive/20 animate-shake">
                    {orderError}
                  </p>
                )}
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-card p-6 border border-border/50 shadow-sm sticky top-24">
                <h2 className="font-display text-xl font-bold text-foreground">Order Summary</h2>

                <div className="mt-6 space-y-4 border-t border-border/40 pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items ({items.length})</span>
                    <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Shipping
                      {shipping === 0 && <Badge className="bg-emerald-500/10 text-emerald-600 text-[8px] h-4">Free</Badge>}
                    </span>
                    <span className="font-medium text-foreground">
                      {shipping === 0 ? "$0.00" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Tax (8%)</span>
                    <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
                  </div>

                  {couponData && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-between text-sm text-emerald-600 font-bold bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10"
                    >
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Discount Applied
                      </span>
                      <span>-${discount.toFixed(2)}</span>
                    </motion.div>
                  )}

                  <div className="border-t border-border/40 pt-4 mt-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Checkout Amount</p>
                        <p className="text-2xl font-display font-bold text-foreground">${total.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        {discount > 0 && <p className="text-[10px] text-emerald-600 font-bold italic animate-pulse">You Saved ${discount.toFixed(2)}!</p>}
                        <p className="text-[10px] text-muted-foreground italic">Inc. all taxes</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coupon Code Selection & Input */}
                <div className="mt-6 border-t border-border/40 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Discount & Offers</p>
                  </div>

                  {!couponData ? (
                    <div className="space-y-4">
                      {/* Button to open Modal */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCouponModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-all font-bold uppercase tracking-widest text-[10px]"
                      >
                        <Ticket className="h-4 w-4" />
                        View Available Coupons
                      </Button>

                      {/* Manual Input (for Unlisted Coupons) */}
                      <div className="pt-2 border-t border-border/20">
                        <div className="space-y-3">
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Tag className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="ENTER SECRET CODE"
                              className="w-full bg-secondary/30 border border-border/60 rounded-xl py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-muted-foreground/30"
                            />
                          </div>
                          {couponError && (
                            <p className="text-[10px] text-destructive font-bold flex items-center gap-1 bg-destructive/5 p-2 rounded-lg">
                              <span className="w-1 h-1 rounded-full bg-destructive" /> {couponError}
                            </p>
                          )}
                          <Button
                            type="button"
                            variant="hero"
                            size="sm"
                            disabled={!couponCode || validatingCoupon}
                            onClick={() => handleApplyCoupon()}
                            className="w-full h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-sm"
                          >
                            {validatingCoupon ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Apply Code"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 shadow-inner">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Tag className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-700">{appliedCode}</p>
                          <p className="text-[10px] text-emerald-600/70">Applied Successfully</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors group"
                        title="Remove Coupon"
                      >
                        <Trash2 className="h-4 w-4 text-emerald-600 group-hover:text-destructive" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-border/40 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Shield className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p>Verified <span className="text-foreground font-semibold">Secure Checkout</span> with SSL encryption.</p>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase tracking-widest justify-center">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span>30-Day Happiness Guarantee</span>
                    <Star className="h-3 w-3 fill-primary text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {modalOpen && (
        <AddressModal
          form={form}
          setForm={setForm}
          onClose={closeModal}
          onSave={handleSaveAddress}
          saving={saving}
          isEdit={!!editTarget}
        />
      )}
      {couponModalOpen && (
        <CouponModal
          coupons={availableCoupons.filter((c: any) => c.isListed)}
          onClose={() => setCouponModalOpen(false)}
          onSelect={handleApplyCoupon}
          loading={availableLoading}
          validating={validatingCoupon}
        />
      )}
    </>
  );
};

/* ─── Coupon Modal Component ───────────────────────────────────── */
const CouponModal = ({ coupons, onClose, onSelect, loading, validating }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Available Coupons</h2>
            <p className="text-xs text-muted-foreground mt-1 text-primary italic font-serif tracking-wide">Elite Discounts Just for You</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground font-medium animate-pulse">Curating available offers...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border/50">
                <Ticket className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground font-medium">No public coupons available at this time.</p>
              <p className="text-xs text-muted-foreground/60 px-8 italic">Check back soon for exclusive season highlights.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {coupons.map((c) => (
                <div
                  key={c.code}
                  className="relative group p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="text-sm font-black text-primary tracking-tighter uppercase">{c.code}</span>
                      </div>
                      <p className="text-xs font-bold text-foreground line-clamp-1">{c.description}</p>
                      {c.validUntil && (
                        <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1.5 bg-secondary/40 w-fit px-2 py-0.5 rounded-full border border-border/40">
                          <Check className="h-3 w-3 text-emerald-500" />
                          Valid until {new Date(c.validUntil).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="hero"
                      disabled={validating}
                      onClick={() => onSelect(c.code)}
                      className="shrink-0 h-10 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-sm transform group-hover:scale-105 transition-all"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-secondary/10 text-center border-t border-border">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Secure Selection Mode Active</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Checkout;
