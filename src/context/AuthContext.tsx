import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loginUser, registerUser, logoutUser, fetchUserProfile, refreshTokenApi } from "@/lib/api";
import { toast } from "sonner";

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const setTokens = (accessToken: string, refreshToken: string) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
    };

    const clearTokens = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    };

    const loadProfile = async () => {
        try {
            const response = await fetchUserProfile();
            if (response.success) {
                setUser(response.data);
            }
        } catch (error) {
            console.error("Failed to load profile", error);
            // Try refreshing token if profile fails
            await handleRefreshToken();
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefreshToken = async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await refreshTokenApi(refreshToken);
            if (response.success) {
                setTokens(response.data.accessToken, response.data.refreshToken);
                await loadProfile();
            } else {
                clearTokens();
                setIsLoading(false);
            }
        } catch (error) {
            clearTokens();
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            loadProfile();
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (credentials: any) => {
        try {
            const response = await loginUser(credentials);
            if (response.success) {
                setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
                setUser(response.data.user);
                toast.success("Logged in successfully");
            }
        } catch (error: any) {
            toast.error(error.message || "Login failed");
            throw error;
        }
    };

    const register = async (userData: any) => {
        try {
            const response = await registerUser(userData);
            if (response.success) {
                setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
                setUser(response.data.user);
                toast.success("Registered successfully");
            }
        } catch (error: any) {
            toast.error(error.message || "Registration failed");
            throw error;
        }
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
            try {
                await logoutUser(refreshToken);
            } catch (error) {
                console.error("Logout error", error);
            }
        }
        clearTokens();
        setUser(null);
        toast.success("Logged out successfully");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
