import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Navbar from "../components/nav/nav.jsx";
import Mapa from "../mapa/mapa.jsx";
import './home.css';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMap, setShowMap] = useState(false);
  const navigate = useNavigate();

  const quickServices = [
    { id: 1, name: 'Taxi', icon: '🚕', color: '#4CAF50' },
    { id: 2, name: 'Bus', icon: '🚌', color: '#2196F3' },
    { id: 3, name: 'Moto', icon: '🏍️', color: '#FF9800' },
    { id: 4, name: 'Furgoneta', icon: '🚐', color: '#9C27B0' },
  ];
const services = [
  { id: 1, name: 'Busca el teu servei', icon: '🛎️', color: '#e21212' },
  { id: 2, name: 'Troba el Circuit', icon: '🏁', color: '#4e78ac' },
  { id: 3, name: 'Busca la ubicació desitjada', icon: '📍', color: '#6c757d' },
  { id: 4, name: 'Troba el teu esdeveniment', icon: '🎫', color: '#28a745' },
  { id: 5, name: 'Perfil', icon: '👤', color: '#17a2b8' },
];

  return (
    <div className="home-screen">
      {/* Banner Hero */}
      <div className="banner">
        <div className="banner-content">
          <h1>Benvingut a montmeloInside</h1>
          <p>Troba el millor cami per arribar al Circuit de Montmelo</p>
          <div className="search-container">
            <input
              type="text"
              placeholder="Cerca destinació..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div className="services-section">
        <h2>Serveis</h2>
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-item" style={{ '--bg-color': service.color }}>
              <div className="service-icon">{service.icon}</div>
              <div className="service-info">
                <h3>{service.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mapa Section */}
     <div className="map-section">
    <div className="map-header">
      <h2>Mapa en temps real</h2>
    </div>

    <div
      className="map-preview"
      onClick={() => navigate("/mapa")}
    >
      <div className="map-preview-inner">
        🗺️
        <p>Obrir mapa complet</p>
      </div>
    </div>
  </div>

      <Navbar />
    </div>
  );
};

export default Home;