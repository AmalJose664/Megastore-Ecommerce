const API_BASE_URL = import.meta.env.VITE_BASE_URL || "https://e-commerce-server-o9u1.onrender.com/api";

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

const getHeader = () => {
    const token = localStorage.getItem("accessToken");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const refreshTokenApi = async (refreshToken: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });
    return response.json();
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}, isRetry: boolean = false): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...getHeader(),
            ...options.headers,
        },
    });

    // Handle 401 Unauthorized - Token Expired / Invalid
    if (response.status === 401 && !isRetry && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/register") && !endpoint.includes("/auth/refresh-token")) {
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((newToken) => {
                    return apiRequest(
                        endpoint,
                        {
                            ...options,
                            headers: {
                                ...options.headers,
                                Authorization: `Bearer ${newToken}`,
                            },
                        },
                        true
                    );
                });
            }

            isRefreshing = true;

            try {
                const refreshData = await refreshTokenApi(refreshToken);
                const tokenData = refreshData?.data?.tokens || refreshData?.data;
                if (refreshData && refreshData.success && tokenData?.accessToken) {
                    const newAccessToken = tokenData.accessToken;
                    const newRefreshToken = tokenData.refreshToken || refreshToken;

                    localStorage.setItem("accessToken", newAccessToken);
                    localStorage.setItem("refreshToken", newRefreshToken);

                    processQueue(null, newAccessToken);

                    // Retry original request with newly refreshed token
                    return apiRequest(
                        endpoint,
                        {
                            ...options,
                            headers: {
                                ...options.headers,
                                Authorization: `Bearer ${newAccessToken}`,
                            },
                        },
                        true
                    );
                } else {
                    processQueue(new Error("Session expired"), null);
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    throw new Error("Session expired. Please sign in again.");
                }
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                throw err;
            } finally {
                isRefreshing = false;
            }
        }
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }
    return data;
};

// Auth API
export const loginUser = async (credentials: any) => {
    return apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });
};

export const registerUser = async (userData: any) => {
    return apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
    });
};

export const logoutUser = async (refreshToken: string) => {
    return apiRequest("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
    });
};

export const fetchUserProfile = async () => {
    return apiRequest("/auth/profile");
};

// Product & Category API
export const fetchProducts = async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/products?${query}`);
};

export const fetchProductById = async (id: string) => {
    return apiRequest(`/products/${id}`);
};

export const fetchFeaturedProducts = async () => {
    return apiRequest("/products/featured");
};

export const fetchNewProducts = async () => {
    return apiRequest("/products/new");
};

export const fetchCategories = async () => {
    return apiRequest("/categories");
};

export const fetchTestimonials = async () => {
    return apiRequest("/testimonials");
};

export const fetchHero = async () => {
    return apiRequest("/hero");
};

export const fetchPromo = async () => {
    return apiRequest("/promo");
};

export const fetchActiveBannerSections = async () => {
    return apiRequest("/banner-sections/active");
};

export const fetchSiteSettings = async () => {
    return apiRequest("/settings");
};

export const validateCoupon = async (code: string, cartTotal: number) => {
    return apiRequest("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code, cartTotal }),
    });
};

export const fetchCoupons = async () => {
    return apiRequest("/coupons");
};

export const createOrder = async (orderData: { addressId: string, paymentMethod: string, couponCode?: string, notes?: string }) => {
    return apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
    });
};

export const createStripeCheckoutSessionApi = async (orderId: string) => {
    return apiRequest("/payments/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ orderId }),
    });
};

export const fetchMyOrders = async (page: number = 1, limit: number = 10) => {
    return apiRequest(`/orders/my-orders?page=${page}&limit=${limit}`);
};

export const fetchOrderDetails = async (id: string) => {
    return apiRequest(`/orders/${id}`);
};

export const cancelOrder = async (id: string, reason: string) => {
    return apiRequest(`/orders/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
    });
};

// Cart API
export const fetchCart = async () => {
    return apiRequest("/cart");
};

export const addToCartApi = async (productId: string, quantity: number, variantId?: string) => {
    return apiRequest("/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId, quantity, variantId }),
    });
};

export const mergeCartApi = async (items: Array<{ productId: string; quantity: number }>) => {
    return apiRequest("/cart/merge", {
        method: "POST",
        body: JSON.stringify({ items }),
    });
};

export const updateCartItemApi = async (productId: string, quantity: number) => {
    return apiRequest(`/cart/items/${productId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
    });
};

export const removeFromCartApi = async (productId: string) => {
    return apiRequest(`/cart/items/${productId}`, {
        method: "DELETE",
    });
};

export const clearCartApi = async () => {
    return apiRequest("/cart", {
        method: "DELETE",
    });
};
