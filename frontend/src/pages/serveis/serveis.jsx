import { useState } from "react";
import Navbar from "../components/nav/nav.jsx";
import "./serveis.css";

const filters = ["Tots", "Lavabos", "Restauració", "Pàrquing"];

const serveisData = [
  {
    id: 1,
    nom: "Lavabos Tribuna G",
    distancia: "150m de distància",
    tipus: "Lavabos",
    icona: "🚻",
    afluencia: "BAIXA",
  },
  {
    id: 2,
    nom: "Food Court Zone 3",
    distancia: "420m de distància",
    tipus: "Restauració",
    icona: "🍴",
    afluencia: "MITJANA",
  },
  {
    id: 3,
    nom: "Lavabos Paddock",
    distancia: "850m de distància",
    tipus: "Lavabos",
    icona: "🚻",
    afluencia: "ALTA",
  },
  {
    id: 4,
    nom: "Pàrquing VIP Nord",
    distancia: "1.2km de distància",
    tipus: "Pàrquing",
    icona: "🅿",
    afluencia: "BAIXA",
  },
];

export default function Serveis() {
  const [activeFilter, setActiveFilter] = useState("Tots");

  const filteredServeis =
    activeFilter === "Tots"
      ? serveisData
      : serveisData.filter((servei) => servei.tipus === activeFilter);

  const getBadgeClass = (afluencia) => {
    switch (afluencia) {
      case "BAIXA":
        return "badge baixa";
      case "MITJANA":
        return "badge mitjana";
      case "ALTA":
        return "badge alta";
      default:
        return "badge";
    }
  };

  return (
    <div className="serveis-screen">
      <header className="serveis-header">
        <button className="back-btn">←</button>
        <h1>Serveis propers</h1>
      </header>

      <main className="serveis-content">
        <div className="filters-row">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-chip ${
                activeFilter === filter ? "active" : ""
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="serveis-list">
          {filteredServeis.map((servei) => (
            <div className="servei-card" key={servei.id}>
              <div className="servei-left">
                <div className="servei-icon">{servei.icona}</div>

                <div className="servei-info">
                  <h3>{servei.nom}</h3>
                  <p>{servei.distancia}</p>
                </div>
              </div>

              <div className="servei-right">
                <span className={getBadgeClass(servei.afluencia)}>
                  <span className="badge-dot"></span>
                  {servei.afluencia}
                </span>

                <button className="go-btn">↗ Anar-hi</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Navbar />
    </div>
  );
}