import React, { useState } from 'react';
import Navbar from "../components/nav/nav.jsx";
import Mapa from "../mapa/mapa.jsx";
import './home.css';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMap, setShowMap] = useState(false);

  const quickServices = [
    { id: 1, name: 'Taxi', icon: '🚕', color: '#4CAF50' },
    { id: 2, name: 'Bus', icon: '🚌', color: '#2196F3' },
    { id: 3, name: 'Moto', icon: '🏍️', color: '#FF9800' },
    { id: 4, name: 'Furgoneta', icon: '🚐', color: '#9C27B0' },
  ];

  const services = [
    { id: 1, name: 'Sol·licitar servei', icon: '📞', color: '#e21212' },
    { id: 2, name: 'Historial viatges', icon: '📋', color: '#4e78ac' },
    { id: 3, name: 'Pagaments', icon: '💳', color: '#28a745' },
    { id: 4, name: 'Perfil', icon: '👤', color: '#6c757d' },
    { id: 5, name: 'Suport', icon: '❓', color: '#ffc107' },
    { id: 6, name: 'Configuració', icon: '⚙️', color: '#17a2b8' },
  ];

  return (
    <div className="home-screen">
      {/* Banner Hero */}
      <div className="banner">
        <div className="banner-content">
          <h1>Benvingut a la teva app de transport</h1>
          <p>Troba el millor transport ràpidament</p>
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

      {/* Accesos directos */}
      <div className="quick-access">
        <h2>Accés ràpid</h2>
        <div className="quick-grid">
          {quickServices.map((service) => (
            <div key={service.id} className="quick-item" style={{ '--bg-color': service.color }}>
              <div className="quick-icon">{service.icon}</div>
              <span>{service.name}</span>
            </div>
          ))}
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
          <button className="map-toggle" onClick={() => setShowMap(!showMap)}>
            {showMap ? '📋 Llista' : '🗺️ Mapa'}
          </button>
        </div>
        {showMap ? (
          <Mapa />
        ) : (
          <div className="map-placeholder">
            <div className="placeholder-content">
              <div className="map-icon">🗺️</div>
                <p>Clica "Mapa" per veure les rutes disponibles</p>
            </div>
          </div>
        )}
      </div>

      <Navbar />
    </div>
  );
};

export default Home;