import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    }
});


/**
 * Ajouter le token a chaque requete
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


/**
 * Refresh le token automatiquement avant expiration
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepte les erreurs pour gérer l’expiration du token
api.interceptors.response.use(
  (response) => response, // si ok
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 onrefresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const response = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          { refresh: refreshToken }
        );

        const newAccessToken = response.data.access;

        // Sauvegarde le nouveau token
        localStorage.setItem("accessToken", newAccessToken);

        // maj le header
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

        //si echec redirect vesr login
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login"; 
      }
    }

    return Promise.reject(error);
  }
);



