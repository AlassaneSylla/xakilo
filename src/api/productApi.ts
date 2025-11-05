import { api } from "./api";

export const getProducts = async () => {
    const res = await api.get(`products/`);
    return res.data;
}

export const getProductById = async (id: number) => {
    const res = await api.get(`products/${id}/`);
    return res.data;
}

export const postProduct = async (data: any) => {
    const res = await api.post(`products/add/`, data);
    return res.data;
}

export const updateProduct = async (id: number, data: any) => {
    const res = await api.patch(`products/${id}/update/`, data);
    return res.data;
}

export const deleteProduct = async (id: number) => {
    const res = await api.delete(`products/${id}/delete/`);
    return res.data;
}