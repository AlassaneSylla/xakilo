import { api } from "./api";


const ENTRIES_PRODUCT = "http://127.0.0.1:8000/api/entries/";

//les entrees d'un produit donne
export const getEntriesByProductId = async (productId: number) => {
  const res = await api.get(`${ENTRIES_PRODUCT}product/${productId}/`);
  return res.data;
};

export const getEntries = async () => {
    const res = await api.get(`entries/`);
    return res.data;
}

export const getEntryById = async (id: number) => {
    const res = await api.get(`entries/${id}/`);
    return res.data;
}

export const postEntry = async (data: any) => {
  const res = await api.post(`entries/add/`, data);
  return res.data;
};

export const updateEntry = async (id: number, data: any) => {
    const res = await api.patch(`entries/${id}/update/`, data);
    return res.data;
}

export const deleteEntry = async (id: number) => {
    const res = await api.delete(`entries/${id}/delete/`);
    return res.data;
}