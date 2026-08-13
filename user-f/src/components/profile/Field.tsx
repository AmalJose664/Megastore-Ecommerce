import React from "react";

interface FieldProps {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, value, icon }) => (
    <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
            {icon && icon}
            <p className="text-sm font-semibold text-foreground">{value}</p>
        </div>
    </div>
);