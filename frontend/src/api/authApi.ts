import { api } from "./api";

export const login = async (username: string, password: string) => {
    try {
        const response = await api.post('token/', { username, password });
        return response.data;    
    } catch (error: any) {
        console.error('Login Error:', error.response?.data || error.message);
        throw error;
    }
}