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
import ForgotPassword from "./pages/forgotpassword/forgotpassword.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/regist" element={<Regist />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/destinacio" element={<Destinacio />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/serveis" element={<Serveis />} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);