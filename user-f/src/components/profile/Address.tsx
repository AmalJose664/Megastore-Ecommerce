import React from "react";
import { FormField } from "./FieldForm";
import { X, Check } from "lucide-react";

interface AddressForm {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

interface AddressModalProps {
    form: AddressForm;
    setForm: React.Dispatch<React.SetStateAction<AddressForm>>;
    onClose: () => void;
    onSave: () => void;
    saving: boolean;
    isEdit: boolean;
}

export const AddressModal: React.FC<AddressModalProps> = ({ form, setForm, onClose, onSave, saving, isEdit }) => {
    const set = (key: keyof AddressForm, val: any) => setForm(f => ({ ...f, [key]: val }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{isEdit ? "Edit" : "New"}</p>
                        <h3 className="text-lg font-display font-bold text-foreground mt-0.5">
                            {isEdit ? "Update Address" : "Add New Address"}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <FormField label="Full Name" value={form.fullName} onChange={v => set("fullName", v)} placeholder="Jackson Cheriyan" />
                        </div>
                        <div className="col-span-2">
                            <FormField label="Phone Number" value={form.phone} onChange={v => set("phone", v)} placeholder="9876543210" />
                        </div>
                        <div className="col-span-2">
                            <FormField label="Address Line 1" value={form.addressLine1} onChange={v => set("addressLine1", v)} placeholder="Flat 202, Sunshine Apts" />
                        </div>
                        <div className="col-span-2">
                            <FormField label="Address Line 2 (optional)" value={form.addressLine2} onChange={v => set("addressLine2", v)} placeholder="Sector 15" />
                        </div>
                        <FormField label="City" value={form.city} onChange={v => set("city", v)} placeholder="Mumbai" />
                        <FormField label="State" value={form.state} onChange={v => set("state", v)} placeholder="Maharashtra" />
                        <FormField label="Postal Code" value={form.postalCode} onChange={v => set("postalCode", v)} placeholder="400001" />
                        <FormField label="Country" value={form.country} onChange={v => set("country", v)} placeholder="India" />
                    </div>

                    {/* Default toggle */}
                    <div
                        onClick={() => set("isDefault", !form.isDefault)}
                        className="flex items-center gap-3 cursor-pointer py-1 select-none"
                    >
                        <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 shrink-0
                            ${form.isDefault ? "bg-primary" : "bg-border"}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
                                ${form.isDefault ? "translate-x-4" : "translate-x-0"}`} />
                        </div>
                        <span className="text-sm font-medium text-foreground">Set as default address</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border/40 flex items-center justify-end gap-3">
                    <button onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors">
                        Cancel
                    </button>
                    <button onClick={onSave} disabled={saving}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2">
                        {saving
                            ? <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            : <Check className="h-4 w-4" />
                        }
                        {isEdit ? "Save Changes" : "Add Address"}
                    </button>
                </div>
            </div>
        </div>
    );
};
