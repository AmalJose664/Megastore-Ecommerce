import React from "react";
import { Card, CardContent } from "../ui/card";

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
    <Card className="border-border/50 bg-card/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="text-2xl font-display font-bold text-foreground">{value}</p>
            </div>
        </CardContent>
    </Card>
);