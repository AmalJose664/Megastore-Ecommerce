import React from "react";
import { Pencil, Star, Trash2, Check } from "lucide-react";

interface Address {
    _id: string;
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

interface AddressCardProps {
    addr: Address;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
    onSetDefault: (e: React.MouseEvent) => void;
    confirmingDelete: boolean;
    onCancelDelete: (e: React.MouseEvent) => void;
    onConfirmDelete: (e: React.MouseEvent) => void;
    selected?: boolean;
    onSelect?: () => void;
}

/* ─── Address Card ────────────────────────────────────────────── */
export const AddressCard: React.FC<AddressCardProps> = ({
    addr, onEdit, onDelete, onSetDefault, confirmingDelete, onCancelDelete, onConfirmDelete, selected, onSelect
}) => (
    <div
        onClick={onSelect}
        className={`relative min-h-[164px] rounded-2xl border bg-card p-5 flex flex-col justify-between transition-all shadow-sm cursor-pointer
        ${selected
                ? "border-primary ring-2 ring-primary/20 shadow-md"
                : addr.isDefault ? "border-primary/40 ring-1 ring-primary/20" : "border-border/50 hover:border-primary/30"}`}>

        {(selected || addr.isDefault) && (
            <span className={`absolute top-3.5 right-3.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border
                ${selected ? "bg-primary text-primary-foreground border-primary" : "bg-primary/10 text-primary border-primary/20"}`}>
                {selected ? <Check className="h-2.5 w-2.5" /> : <Star className="h-2.5 w-2.5 fill-primary" />}
                {selected ? "Selected" : "Default"}
            </span>
        )}

        <div className="space-y-1 pr-20">
            <p className="text-sm font-bold text-foreground">{addr.fullName}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
                {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                <br />{addr.city}, {addr.state} – {addr.postalCode}
                <br />{addr.country}
            </p>
            <p className="text-xs text-muted-foreground pt-0.5">{addr.phone}</p>
        </div>

        {confirmingDelete ? (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40" onClick={e => e.stopPropagation()}>
                <span className="text-xs text-muted-foreground mr-auto">Delete?</span>
                <button onClick={onCancelDelete} className="text-[10px] px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 font-bold uppercase tracking-wider transition-colors">Cancel</button>
                <button onClick={onConfirmDelete} className="text-[10px] px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold uppercase tracking-wider transition-colors">Delete</button>
            </div>
        ) : (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40" onClick={e => e.stopPropagation()}>
                {!addr.isDefault && (
                    <button onClick={onSetDefault}
                        className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 font-bold uppercase tracking-widest transition-colors mr-auto group/btn">
                        <Star className="h-3 w-3 group-hover/btn:fill-primary" /> Set default
                    </button>
                )}
                {addr.isDefault && <span className="mr-auto" />}
                <button onClick={onEdit} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={onDelete} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        )}
    </div>
);
