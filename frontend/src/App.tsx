import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import Layout from "./components/Layout";
import "./App.css";
import Login from "./pages/Login";


function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={isAuthenticated ? (<Layout>{null}</Layout>) : (<Navigate to="/login" replace />)}
      />
    </Routes>
  );
}

export default App;
