const API_BASE_URL = "http://localhost:5000/api";

export const fetchProducts = async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/products?${query}`);
    if (!response.ok) throw new Error("Failed to fetch products");
    return response.json();
};

export const fetchProductById = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error("Failed to fetch product");
    return response.json();
};

export const fetchFeaturedProducts = async () => {
    const response = await fetch(`${API_BASE_URL}/products/featured`);
    if (!response.ok) throw new Error("Failed to fetch featured products");
    return response.json();
};

export const fetchNewProducts = async () => {
    const response = await fetch(`${API_BASE_URL}/products/new`);
    if (!response.ok) throw new Error("Failed to fetch new products");
    return response.json();
};

export const fetchCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
};

export const fetchTestimonials = async () => {
    const response = await fetch(`${API_BASE_URL}/testimonials`);
    if (!response.ok) throw new Error("Failed to fetch testimonials");
    return response.json();
};

export const fetchHero = async () => {
    const response = await fetch(`${API_BASE_URL}/hero`);
    if (!response.ok) throw new Error("Failed to fetch hero data");
    return response.json();
};

export const fetchPromo = async () => {
    const response = await fetch(`${API_BASE_URL}/promo`);
    if (!response.ok) throw new Error("Failed to fetch promo data");
    return response.json();
};
