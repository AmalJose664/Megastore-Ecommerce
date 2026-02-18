import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingBag, ArrowRight, Loader2 } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login({ email, password });
            navigate("/");
        } catch (error) {
            // Error handled in AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background hero-gradient p-4 antialiased">
            <Card className="w-full max-w-md border-border/50 shadow-elevated bg-card/80 backdrop-blur-xl animate-fade-up">
                <CardHeader className="space-y-2 flex flex-col items-center pb-8">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <ShoppingBag className="text-primary-foreground w-7 h-7" />
                    </div>
                    <CardTitle className="text-3xl font-display font-bold tracking-tight text-foreground">Welcome Back</CardTitle>
                    <CardDescription className="text-muted-foreground text-center">
                        Sign in to access your luxury shopping experience
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-background/50 border-border focus:border-primary focus:ring-primary/20 transition-all h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</Label>
                                <Link to="/forgot-password" className="text-xs text-primary hover:text-accent font-medium transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-background/50 border-border focus:border-primary focus:ring-primary/20 transition-all h-11"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full gradient-primary text-primary-foreground font-semibold h-12 transition-all hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-border/50 mt-6">
                    <div className="text-sm text-center text-muted-foreground">
                        New to our collection?{" "}
                        <Link to="/register" className="text-primary hover:text-accent font-bold transition-colors underline underline-offset-4">
                            Create an account
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
