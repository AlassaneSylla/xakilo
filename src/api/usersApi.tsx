import { api } from './api';

export const getUsers = async () => {
    const res = await api.get(`users/`);
    return res.data;
}

export const getUserById = async (id: number) => {
    const res = await api.get(`users/${id}/`);
    return res.data;
}

export const postUser = async (data: any) => {
    const res = await api.post(`users/add`, data);
    return res.data;
}

export const updateUser = async (data: any, id: number) => {
    const res = await api.patch(`users/${id}/update/`, data);
    return res.data
}

export const deleteUser = async (id: number) => {
    const res = await api.delete(`users/${id}/delete/`);
    return res.data;
}