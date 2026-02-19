const API_BASE_URL =   import.meta.env.VITE_BASE_URL  || "https://e-commerce-server-o9u1.onrender.com";

const getHeader = () => {
    const token = localStorage.getItem("accessToken");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...getHeader(),
            ...options.headers,
        },
    });

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

export const refreshTokenApi = async (refreshToken: string) => {
    return apiRequest("/auth/refresh-token", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
    });
};

export const fetchUserProfile = async () => {
    return apiRequest("/auth/profile");
};

// Existing API
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

export const addToCartApi = async (productId: string, quantity: number) => {
    return apiRequest("/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId, quantity }),
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
