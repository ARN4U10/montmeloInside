import "./destinacio.css";
import Navbar from "../components/nav/nav.jsx";

const categories = [
  { title: "Grades", icon: "🏟️", color: "red-card" },
  { title: "Lavabos", icon: "🚻", color: "blue-card" },
  { title: "Menjar", icon: "🍴", color: "orange-card" },
  { title: "Sortides", icon: "↪", color: "green-card" },
];

const results = [
  { name: "Grada Principal", area: "Àrea Sud", distance: "350m", pin: "📍" },
  { name: "Paddock Food Court", area: "Àrea Est", distance: "820m", pin: "🍔" },
  { name: "VIP Lounge", area: "Àrea Nord", distance: "1.2km", pin: "🚪" },
  { name: "Pàrquing A", area: "Entrada Principal", distance: "500m", pin: "🅿️" },
];

export default function Destinacio() {
  return (
    <div className="mobile-screen">
      <header className="top-bar">
        <button className="back-button">←</button>
        <h1>Cercar destinació</h1>
      </header>

      <main className="screen-content">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar grades, lavabo, menjar..."
          />
        </div>

        <section className="category-grid">
          {categories.map((item) => (
            <button key={item.title} className={`category-card ${item.color}`}>
              <span className="category-icon">{item.icon}</span>
              <span className="category-title">{item.title}</span>
            </button>
          ))}
        </section>

        <section className="recent-section">
          <div className="recent-header">
            <h2>RESULTATS RECENTS</h2>
            <button className="view-all">Veure tot</button>
          </div>

          <div className="results-list">
            {results.map((item) => (
              <div className="result-card" key={item.name}>
                <div className="result-left">
                  <div className="result-pin">{item.pin}</div>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.area}</p>
                  </div>
                </div>
                <span className="result-distance">{item.distance}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Navbar />
    </div>
  );
}