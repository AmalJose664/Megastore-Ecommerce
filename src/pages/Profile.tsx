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
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-indigo-600 font-medium">Loading profile...</div>
            </div>
        );
    }

    if (!user) {
        navigate("/login");
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
                        <p className="text-gray-500">Manage your profile and view your order history</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Sidebar Navigation */}
                        <aside className="space-y-2">
                            <nav className="flex flex-col space-y-1">
                                <Link to="/profile" className="flex items-center gap-3 px-4 py-3 bg-white text-indigo-600 rounded-lg shadow-sm font-medium border-l-4 border-indigo-600">
                                    <User className="h-5 w-5" />
                                    Profile Details
                                </Link>
                                <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-white hover:text-indigo-600 rounded-lg transition-all font-medium">
                                    <Package className="h-5 w-5" />
                                    Order History
                                </Link>
                                <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-white hover:text-indigo-600 rounded-lg transition-all font-medium">
                                    <Settings className="h-5 w-5" />
                                    Security Settings
                                </Link>
                            </nav>

                            <Button
                                variant="outline"
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 mt-4"
                            >
                                <LogOut className="h-5 w-5" />
                                Sign Out
                            </Button>
                        </aside>

                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-6">
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-xl">Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                            <User className="h-10 w-10" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{user.role} Account</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                        <div className="space-y-1">
                                            <Label className="text-gray-500 font-normal">First Name</Label>
                                            <p className="font-semibold text-gray-900">{user.firstName}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-gray-500 font-normal">Last Name</Label>
                                            <p className="font-semibold text-gray-900">{user.lastName}</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div className="space-y-1">
                                                <Label className="text-gray-500 font-normal">Email Address</Label>
                                                <p className="font-semibold text-gray-900">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div className="space-y-1">
                                                <Label className="text-gray-500 font-normal">Account Status</Label>
                                                <p className="font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full inline-block text-xs uppercase tracking-wider">
                                                    {user.isActive ? "Active" : "Inactive"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                            <Package className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Recent Orders</p>
                                            <p className="text-2xl font-bold">0</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                            <CreditCard className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Saved Cards</p>
                                            <p className="text-2xl font-bold">0</p>
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
