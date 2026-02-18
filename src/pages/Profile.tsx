import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
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
    ChevronRight
} from "lucide-react";

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

    const [addresses, setAddresses] = useState([]);
    const [addrLoading, setAddrLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        if (!user) return;
        api.getAll().then(res => {
            if (res.success) setAddresses(res.data);
        }).finally(() => setAddrLoading(false));
    }, [user]);

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
                            { to: "/profile", icon: User, label: "Profile", active: true },
                            { to: "/orders", icon: Package, label: "Orders", active: false },
                            { to: "/settings", icon: Settings, label: "Settings", active: false },
                        ].map(({ to, icon: Icon, label, active }) => (
                            <Link key={to} to={to}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                    ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-card hover:text-foreground"}`}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {label}
                                {active && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-70" />}
                            </Link>
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

                        {/* Profile Card */}
                        <Card className="border-border/50 bg-card shadow-sm overflow-hidden">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

                        {/* Quick Stats */}
                        {/* <div className="grid grid-cols-2 gap-4">
                            <StatCard icon={<Package className="h-5 w-5" />} label="Recent Orders" value="0" />
                            <StatCard icon={<CreditCard className="h-5 w-5" />} label="Saved Cards" value="0" />
                        </div> */}



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


export default Profile;