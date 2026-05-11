import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

import App from "./App.jsx";
import Login from "./pages/login/login.jsx";
import Regist from "./pages/regist/regist.jsx";
import Destinacio from "./pages/destinacio/destinacio.jsx";
import Perfil from "./pages/perfil/perfil.jsx";
import PerfilConvidat from "./pages/perfilconvidat/perfilconvidat.jsx";
import Serveis from "./pages/serveis/serveis.jsx";
import Mapa from "./pages/mapa/mapa.jsx";
import Home from "./pages/home/home.jsx";
import ForgotPassword from "./pages/forgotpassword/forgotpassword.jsx";

import PrivateRoute from "./private/PrivateRoute.jsx";
import PublicRoute from "./private/PublicRoute.jsx";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicRoute><App /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/regist" element={<PublicRoute><Regist /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/home" element={<PrivateRoute allowGuest><Home /></PrivateRoute>} />
          <Route path="/mapa" element={<PrivateRoute allowGuest><Mapa /></PrivateRoute>} />
          <Route path="/destinacio" element={<PrivateRoute allowGuest><Destinacio /></PrivateRoute>} />
          <Route path="/serveis" element={<PrivateRoute allowGuest><Serveis /></PrivateRoute>} />
          <Route path="/perfil-convidat" element={<PrivateRoute allowGuest><PerfilConvidat /></PrivateRoute>} />

          <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />

          <Route path="*" element={<h1>404</h1>} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);