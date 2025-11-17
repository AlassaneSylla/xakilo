import { api } from "./api";


const REMOVALS_PRODUCT = "http://127.0.0.1:8000/api/removals/";

//get removals for one product
export const getRemovalsByProductId = async (productId: number) => {
  const res = await api.get(`${REMOVALS_PRODUCT}product/${productId}/`);
  return res.data;
};

export const getRemovals = async () => {
  const res = await api.get(`removals/`)
  return res.data
}

export const getRemovalById = async (id: number) => {
  const res = await api.get(`removals/${id}/`);
  return res.data;
}

export const postRemoval = async (data: any) => {
  const res = await api.post(`removals/add/`, data);
  return res.data
} 
