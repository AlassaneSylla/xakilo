import { api } from "./api";


export const getRemovals = async () => {
    const res = await api.get(`removals/`)
    return res.data
}