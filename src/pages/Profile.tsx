import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, fetchMyOrders, cancelOrder } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AddressModal } from "@/components/profile/Address";
import { StatCard } from "@/components/profile/StatCard";
import { Field } from "@/components/profile/Field";
import { AddressList } from "@/components/profile/AddressList";
import {
    User, Mail, Shield, LogOut, Package, Settings, CreditCard,
    ChevronRight, Calendar, Tag, Clock, ExternalLink, AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

/* ─── Main Component ──────────────────────────────────────────── */
const Profile = () => {
    const { user, logout, isLoading } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("profile");
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

    const [addresses, setAddresses] = useState([]);
    const [addrLoading, setAddrLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        if (!user) return;

        const loadAddresses = async () => {
            api.getAll().then(res => {
                if (res.success) setAddresses(res.data);
            }).finally(() => setAddrLoading(false));
        };

        const loadOrders = async () => {
            setOrdersLoading(true);
            fetchMyOrders(pagination.page).then(res => {
                if (res.success) {
                    setOrders(res.data);
                    setPagination(prev => ({ ...prev, total: res.pagination.total, pages: res.pagination.pages }));
                }
            }).finally(() => setOrdersLoading(false));
        };

        loadAddresses();
        loadOrders();
    }, [user, pagination.page]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-primary font-medium font-display text-lg">Loading...</div>
            </div>
        );
    }

    if (!user) { navigate("/login"); return null; }

    const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

    const openNew = () => { setEditTarget(null); setForm(EMPTY_FORM); setModalOpen(true); };
    const openEdit = (addr) => { setEditTarget(addr); setForm({ ...addr }); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditTarget(null); };

    const handleSave = async () => {
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
                }
            }
            closeModal();
        } finally { setSaving(false); }
    };

    const handleSetDefault = async (id) => {
        const res = await api.setDefault(id);
        if (res.success) setAddresses(prev => prev.map(a => ({ ...a, isDefault: a._id === id })));
    };

    const handleDelete = async (id) => {
        const res = await api.delete(id);
        if (res.success) {
            setAddresses(prev => {
                let next = prev.filter(a => a._id !== id);
                if (prev.find(a => a._id === id)?.isDefault && next.length) next[0].isDefault = true;
                return next;
            });
        }
        setDeleteConfirm(null);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col antialiased">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 ">
                <header className="mb-10">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Account</p>
                    <h1 className="text-3xl font-display font-bold text-foreground">My Profile</h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {/* Sidebar */}
                    <aside className="md:col-span-1 space-y-1">
                        {[
                            { id: "profile", icon: User, label: "Profile" },
                            { id: "orders", icon: Package, label: "Orders" },
                            { id: "settings", icon: Settings, label: "Settings" },
                        ].map(({ id, icon: Icon, label }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                    ${activeTab === id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-card hover:text-foreground"}`}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {label}
                                {activeTab === id && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-70" />}
                            </button>
                        ))}
                        <div className="pt-4">
                            <button onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all">
                                <LogOut className="h-4 w-4 shrink-0" />
                                Sign Out
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="md:col-span-3 space-y-5">

                        {activeTab === "profile" ? (
                            <Card className="border-border/50 bg-card shadow-sm overflow-hidden rounded-3xl">
                                <div className="px-6 pt-6 pb-5 flex items-center gap-5 border-b border-border/40">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-display font-bold text-xl shrink-0">
                                        {initials || <User className="h-7 w-7" />}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-xl font-display font-bold text-foreground truncate">{user.firstName} {user.lastName}</h2>
                                        <span className="inline-block mt-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                                            {user.role} Account
                                        </span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-1.5 shrink-0">
                                        <span className={`w-2 h-2 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-destructive"}`} />
                                        <span className={`text-xs font-semibold ${user.isActive ? "text-emerald-600" : "text-destructive"}`}>
                                            {user.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                                        <Field label="First Name" value={user.firstName} />
                                        <Field label="Last Name" value={user.lastName} />
                                        <Field label="Email Address" value={user.email} icon={<Mail className="h-4 w-4 text-muted-foreground" />} />
                                        <Field label="Account Role" value={user.role} icon={<Shield className="h-4 w-4 text-muted-foreground" />} />
                                    </div>

                                    {/* ── Addresses ───────────────────────────── */}
                                    <AddressList
                                        addresses={addresses}
                                        loading={addrLoading}
                                        onOpenNew={openNew}
                                        onOpenEdit={openEdit}
                                        onSetDefault={handleSetDefault}
                                        onDelete={handleDelete}
                                        deleteConfirm={deleteConfirm}
                                        setDeleteConfirm={setDeleteConfirm}
                                    />
                                </CardContent>
                            </Card>
                        ) : activeTab === "orders" ? (
                            <OrdersList orders={orders} loading={ordersLoading} pagination={pagination} onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))} />
                        ) : (
                            <Card className="border-border/50 bg-card p-12 text-center shadow-sm rounded-3xl">
                                <Settings className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                                <h2 className="text-lg font-bold">Account Settings</h2>
                                <p className="text-muted-foreground text-sm mt-1">Maintenance mode. Settings will be available in the next update.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </main>

            <Footer />

            {/* Modal */}
            {modalOpen && (
                <AddressModal
                    form={form}
                    setForm={setForm}
                    onClose={closeModal}
                    onSave={handleSave}
                    saving={saving}
                    isEdit={!!editTarget}
                />
            )}
        </div>
    );
};

/* ─── Orders List Component ───────────────────────────────────── */
const OrdersList = ({ orders, loading, pagination, onPageChange }) => {
    const [cancelling, setCancelling] = useState(null);
    const [reason, setReason] = useState("Changed my mind");

    const handleCancel = async (id) => {
        try {
            const res = await cancelOrder(id, reason);
            if (res.success) {
                toast.success("Order cancelled successfully");
                setCancelling(null);
                window.location.reload();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to cancel order");
        }
    };

    if (loading && orders.length === 0) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-40 rounded-3xl bg-card/50 animate-pulse border border-border/40" />
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <Card className="border-border/50 bg-card p-12 text-center shadow-sm rounded-3xl">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Package className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">No orders found</h2>
                <p className="text-muted-foreground text-sm mt-2 max-w-[280px] mx-auto">Your purchase history is currently empty. Start exploring our collection!</p>
                <Link
                    to="/products"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 mt-8"
                >
                    Browse Products
                </Link>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <Card key={order._id} className="border-border/50 bg-card shadow-sm overflow-hidden hover:border-primary/20 transition-all rounded-3xl group">
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 bg-secondary/10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                                <Package className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order Ref</p>
                                <p className="text-sm font-bold text-foreground">#{order.orderNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Placed On</p>
                                <p className="text-xs font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Amount</p>
                                <p className="text-sm font-bold text-primary">${order.total.toFixed(2)}</p>
                            </div>
                            <Badge variant="outline" className={`capitalize rounded-full px-3 py-1 border-none shadow-sm font-bold tracking-tight text-[10px] ${order.status === "delivered" ? "bg-emerald-500/10 text-emerald-600" :
                                order.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                                    order.status === "pending" ? "bg-amber-500/10 text-amber-600" :
                                        "bg-primary/10 text-primary"
                                }`}>
                                {order.status}
                            </Badge>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex -space-x-3">
                                    {order.items.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="h-10 w-10 rounded-xl border-2 border-background bg-secondary/50 overflow-hidden shadow-sm ring-1 ring-border/20">
                                            <img src={item.image} alt="" className="h-full w-full object-cover" />
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-background bg-secondary text-[10px] font-bold shadow-sm ring-1 ring-border/20">
                                            +{order.items.length - 3}
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium text-foreground">{order.items[0]?.name}</span>
                                    {order.items.length > 1 && <span className="text-muted-foreground ml-1">and {order.items.length - 1} more items</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-auto">
                                {order.status === "pending" && (
                                    <button
                                        type="button"
                                        className="h-9 px-4 rounded-xl border border-destructive/20 text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/5 transition-all"
                                        onClick={() => setCancelling(order._id || order.id)}
                                    >
                                        Cancel
                                    </button>
                                )}
                                <Link
                                    to={`/profile/orders/${order._id || order.id}`}
                                    className="h-9 px-4 rounded-xl bg-primary/5 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:bg-primary hover:text-white transition-all group"
                                >
                                    View Details
                                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}

            {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 pt-8">
                    {Array.from({ length: pagination.pages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => onPageChange(i + 1)}
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${pagination.page === i + 1 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-card border border-border/50 text-muted-foreground hover:bg-secondary"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {cancelling && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-sm bg-card border border-border rounded-[32px] p-8 shadow-2xl"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-6">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-display font-bold mb-2">Cancel Order?</h2>
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">This action cannot be undone. Our team will stop processing this order immediately.</p>

                        <div className="space-y-2 mb-8">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Reason for cancellation</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-secondary/50 border border-border/60 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer"
                            >
                                <option>Changed my mind</option>
                                <option>Found a better price</option>
                                <option>Ordered by mistake</option>
                                <option>Delivery time too long</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 h-12 rounded-2xl border border-border bg-card font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-secondary/50 transition-all" onClick={() => setCancelling(null)}>Go Back</button>
                            <button className="flex-1 h-12 rounded-2xl bg-destructive font-bold text-[10px] uppercase tracking-widest text-white shadow-lg shadow-destructive/20 hover:brightness-110 transition-all" onClick={() => handleCancel(cancelling)}>Yes, Cancel</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Profile;