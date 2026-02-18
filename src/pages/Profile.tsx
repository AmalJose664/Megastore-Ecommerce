import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { User, Mail, Shield, Calendar, LogOut, Package, Settings, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Profile = () => {
    const { user, logout, isLoading } = useAuth();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-primary font-medium font-display text-xl">Loading your profile...</div>
            </div>
        );
    }

    if (!user) {
        navigate("/login");
        return null;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col antialiased">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-10 animate-fade-in">
                        <h1 className="text-4xl font-display font-bold text-foreground">My Account</h1>
                        <p className="text-muted-foreground mt-2">Manage your profile and track your luxury orders</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Sidebar Navigation */}
                        <aside className="space-y-4 animate-fade-up">
                            <nav className="flex flex-col space-y-2">
                                <Link to="/profile" className="flex items-center gap-3 px-5 py-3.5 bg-card text-primary rounded-xl shadow-soft font-semibold border-l-4 border-primary transition-all">
                                    <User className="h-5 w-5" />
                                    Profile Details
                                </Link>
                                <Link to="/orders" className="flex items-center gap-3 px-5 py-3.5 text-muted-foreground hover:bg-card hover:text-primary rounded-xl transition-all font-medium group">
                                    <Package className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    Order History
                                </Link>
                                <Link to="/settings" className="flex items-center gap-3 px-5 py-3.5 text-muted-foreground hover:bg-card hover:text-primary rounded-xl transition-all font-medium group">
                                    <Settings className="h-5 w-5 group-hover:rotate-45 transition-transform" />
                                    Security Settings
                                </Link>
                            </nav>

                            <Button
                                variant="outline"
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground h-12 mt-4 rounded-xl transition-all font-semibold"
                            >
                                <LogOut className="h-5 w-5" />
                                Sign Out
                            </Button>
                        </aside>

                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                            <Card className="border-border/50 shadow-card bg-card/50 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="border-b border-border/50 pb-4">
                                    <CardTitle className="text-xl font-display font-bold text-foreground">Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border-2 border-primary/20 shadow-inner">
                                            <User className="h-12 w-12" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-display font-bold text-foreground uppercase tracking-tight">{user.firstName} {user.lastName}</h3>
                                            <p className="text-sm text-muted-foreground font-medium bg-secondary px-3 py-1 rounded-full inline-block mt-1">
                                                {user.role.toUpperCase()} Account
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                        <div className="space-y-1">
                                            <Label className="text-muted-foreground font-medium text-xs uppercase tracking-widest">First Name</Label>
                                            <p className="text-lg font-semibold text-foreground">{user.firstName}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-muted-foreground font-medium text-xs uppercase tracking-widest">Last Name</Label>
                                            <p className="text-lg font-semibold text-foreground">{user.lastName}</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-secondary rounded-lg">
                                                <Mail className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-muted-foreground font-medium text-xs uppercase tracking-widest">Email Address</Label>
                                                <p className="text-lg font-semibold text-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-secondary rounded-lg">
                                                <Shield className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-muted-foreground font-medium text-xs uppercase tracking-widest">Account Status</Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`w-2 h-2 rounded-full ${user.isActive ? "bg-success" : "bg-destructive"} animate-pulse`} />
                                                    <p className={`font-bold ${user.isActive ? "text-success" : "text-destructive"}`}>
                                                        {user.isActive ? "Active" : "Inactive"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card className="border-border/50 shadow-soft hover:shadow-card transition-all cursor-pointer group bg-card/30">
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                            <Package className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Recent Orders</p>
                                            <p className="text-3xl font-display font-bold">0</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/50 shadow-soft hover:shadow-card transition-all cursor-pointer group bg-card/30">
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                            <CreditCard className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Saved Cards</p>
                                            <p className="text-3xl font-display font-bold">0</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Profile;
