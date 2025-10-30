import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    }
});


//for login
export const login = async (email: string, password: string) => {
    const response = await api.post('token/', { email, password });
    return response.data; 
}