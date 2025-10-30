import { api } from "./api";

export const getEntries = async () => {
    const res = await api.get(`entries/`);
    return res.data;
}

export const getEntryById = async (id: number) => {
    const res = await api.get(`entries/${id}/`);
    return res.data;
}

export const postEntry = async (id: number, data: any) => {
    const res = await api.post(`entries/${id}/add/`, data);
    return res.data;
}

export const updateEntry = async (id: number, data: any) => {
    const res = await api.patch(`entries/${id}/update/`, data);
    return res.data;
}

export const deleteEntry = async (id: number) => {
    const res = await api.delete(`entries/${id}/delete/`);
    return res.data;
}