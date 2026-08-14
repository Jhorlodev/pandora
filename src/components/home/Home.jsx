import { useState } from "react";
import CatChow from "../../assets/cat-chow-delimix-19-kg.webp";
import Arena from "../../assets/arena.webp";
import "./home.css";
import churus from "../../assets/churus.jpg";
import { useNavigate } from "react-router-dom";
import MenuHamburguesa from "../MenuHamburguesa.jsx";

const DURACION_SALIDA = 380; // ms, debe coincidir con la transición en home.css

function Home() {
  const navigate = useNavigate();
  const [saliendo, setSaliendo] = useState(null);

  const irAFormulario = (ruta, id) => {
    if (saliendo) return; // evita doble click mientras anima
    setSaliendo(id);
    setTimeout(() => navigate(ruta), DURACION_SALIDA);
  };

  return (
    <div className="container">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="navbar-paw">🐾</span>
          <div className="navbar-titulos">
            <span className="navbar-nombre">Pandora</span>
            <span className="navbar-tagline">pet shop</span>
          </div>
        </div>
        <MenuHamburguesa className="navMenu" />
      </nav>

      <h3 className="titulo">Productos</h3>

      <section className="articulo">
        <img
          className={`imgCatchow ${saliendo === "catchow" ? "imgSaliendo" : ""}`}
          src={CatChow}
          alt="catchow adulto 19.5 kg"
          onClick={() => irAFormulario("/formulario/CatChow", "catchow")}
        />
        <p className="titulo">CatChow adultos 19.5 kg</p>
      </section>

      <section className="articulo">
        <img
          className={`imgCatchow ${saliendo === "arena" ? "imgSaliendo" : ""}`}
          src={Arena}
          alt="Arena sanitaria 5 kg"
          onClick={() => irAFormulario("/formulario/Arena", "arena")}
        />
        <p className="titulo">Arena sanitaria 5 kg</p>
      </section>

      <section className="articulo">
        <img
          className={`imgCatchow ${saliendo === "churus" ? "imgSaliendo" : ""}`}
          src={churus}
          alt="churus tuna"
          onClick={() => irAFormulario("/formulario/Churus", "churus")}
        />
        <p className="titulo">churus tuna</p>
      </section>
    </div>
  );
}

export default Home;
