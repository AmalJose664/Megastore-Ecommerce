import React from "react";

/* ─── Shared small components ─────────────────────────────────── */
interface FormFieldProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, value, onChange, placeholder }) => (
    <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
        <input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
    </div>
);