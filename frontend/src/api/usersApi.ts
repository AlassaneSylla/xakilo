import { api } from "./api";


export const getUsers = async () => {
    const res = await api.get('users/');
    return res.data;
}

export const getUserById = async (id: number) => {
    const res = await api.get(`users/${id}/`);
    return res.data;
}

export const postUsers = async (data: any) => {
    const response = await api.post(`users/add/`, data);
    return response.data
}

export const updateUser = async (id: number, data: any) => {
    const res = await api.patch(`users/${id}/update/`, data);
    return res.data; 
}

export const deleteUser = async (id: number) => {
    const res = await api.delete(`users/${id}/delete/`);
    return res.data;
}