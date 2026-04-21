/*
    Permet de rester sur la meme page apres reload d'une page 
*/
import React, { createContext, useState, useEffect } from "react";
import { api } from "../api/api";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // si un token est déjà dans le localStorage
        const token = localStorage.getItem("access");
        if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = (token: string) => {
        localStorage.setItem("access", token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        delete api.defaults.headers.common["Authorization"];
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
