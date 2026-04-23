import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Login from "./pages/login/login.jsx";
import Regist from "./pages/regist/regist.jsx";
import Destinacio from "./pages/destinacio/destinacio.jsx";
import Perfil from "./pages/perfil/perfil.jsx";
import Serveis from "./pages/serveis/serveis.jsx";
import Mapa from "./pages/mapa/mapa.jsx";
import Home from "./pages/home/home.jsx";

import PrivateRoute from "./private/PrivateRoute";
import PublicRoute from "./private/PublicRoute";
import ForgotPassword from "./pages/forgotpassword/forgotpassword.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>

        {/* Públicas (si hay token → home) */}
        <Route path="/" element={<PublicRoute><App /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/regist" element={<PublicRoute><Regist /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Privadas (si NO hay token → login) */}
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/mapa" element={<PrivateRoute><Mapa /></PrivateRoute>} />
        <Route path="/destinacio" element={<PrivateRoute><Destinacio /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
        <Route path="/serveis" element={<PrivateRoute><Serveis /></PrivateRoute>} />

        <Route path="*" element={<h1>404</h1>} />

      </Routes>
    </BrowserRouter>
  </StrictMode>
);