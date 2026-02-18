import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingBag, ArrowRight, Loader2, UserPlus } from "lucide-react";

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(formData);
            navigate("/");
        } catch (error) {
            // Error handled in AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background hero-gradient p-4 antialiased">
            <Card className="w-full max-w-lg border-border/50 shadow-elevated bg-card/80 backdrop-blur-xl animate-fade-up">
                <CardHeader className="space-y-2 flex flex-col items-center pb-8">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20 -rotate-3 hover:rotate-0 transition-transform duration-300">
                        <UserPlus className="text-primary-foreground w-7 h-7" />
                    </div>
                    <CardTitle className="text-3xl font-display font-bold tracking-tight text-foreground">Create Account</CardTitle>
                    <CardDescription className="text-muted-foreground text-center">
                        Join our exclusive community for a premium shopping experience
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-medium text-foreground/80">First Name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="bg-background/50 border-border focus:border-primary focus:ring-primary/20 transition-all h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-medium text-foreground/80">Last Name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="bg-background/50 border-border focus:border-primary focus:ring-primary/20 transition-all h-11"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="bg-background/50 border-border focus:border-primary focus:ring-primary/20 transition-all h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium text-foreground/80">Phone Number (Optional)</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={handleChange}
                                className="bg-background/50 border-border focus:border-primary focus:ring-primary/20 transition-all h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="bg-background/50 border-border focus:border-primary focus:ring-primary/20 transition-all h-11"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full gradient-primary text-primary-foreground font-semibold h-12 transition-all hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2 mt-2 group"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-border/50 mt-6">
                    <div className="text-sm text-center text-muted-foreground">
                        Already a member?{" "}
                        <Link to="/login" className="text-primary hover:text-accent font-bold transition-colors underline underline-offset-4">
                            Sign In
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;
