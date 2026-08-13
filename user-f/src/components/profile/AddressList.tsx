import React from "react";
import { Plus } from "lucide-react";
import { AddressCard } from "./AddressCard";

interface AddressListProps {
    addresses: any[];
    loading: boolean;
    onOpenNew: () => void;
    onOpenEdit: (addr: any) => void;
    onSetDefault: (id: string) => void;
    onDelete: (id: string) => void;
    deleteConfirm: string | null;
    setDeleteConfirm: (id: string | null) => void;
    selectedId?: string;
    onSelect?: (id: string) => void;
}

export const AddressList: React.FC<AddressListProps> = ({
    addresses,
    loading,
    onOpenNew,
    onOpenEdit,
    onSetDefault,
    onDelete,
    deleteConfirm,
    setDeleteConfirm,
    selectedId,
    onSelect,
}) => {
    return (
        <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Shipping</p>
                    <h3 className="text-base font-display font-bold text-foreground mt-0.5">Saved Addresses</h3>
                </div>
                <span className="text-xs text-muted-foreground">{addresses.length} saved</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Add New Card */}
                <button onClick={onOpenNew}
                    className="group min-h-[164px] rounded-2xl border-2 border-dashed border-border hover:border-primary/40 bg-transparent hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2.5 text-muted-foreground hover:text-primary cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-secondary group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <Plus className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold">Add Address</span>
                </button>

                {/* Address Cards */}
                {loading
                    ? [0, 1].map(i => <div key={i} className="min-h-[164px] rounded-2xl border border-border/50 bg-card animate-pulse" />)
                    : addresses.map(addr => (
                        <AddressCard
                            key={addr._id}
                            addr={addr}
                            onEdit={() => onOpenEdit(addr)}
                            onDelete={() => setDeleteConfirm(addr._id)}
                            onSetDefault={() => onSetDefault(addr._id)}
                            confirmingDelete={deleteConfirm === addr._id}
                            onCancelDelete={() => setDeleteConfirm(null)}
                            onConfirmDelete={() => onDelete(addr._id)}
                            selected={selectedId === addr._id}
                            onSelect={() => onSelect?.(addr._id)}
                        />
                    ))
                }
            </div>
        </div>
    );
};
