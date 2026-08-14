import React, { useRef, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useNavigate } from "react-router-dom";
import "./home/home.css";

const MenuHamburguesa = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dotLottieRef = useRef(null);
  const navigate = useNavigate();

  const handleClick = () => {
    if (!dotLottieRef.current) return;
    dotLottieRef.current.setMode(isOpen ? "reverse" : "forward");
    dotLottieRef.current.play();
    setIsOpen(!isOpen);
  };

  const irA = (ruta) => {
    navigate(ruta);
    setIsOpen(false);
    dotLottieRef.current?.setMode("reverse");
    dotLottieRef.current?.play();
  };

  return (
    <div className="menu-container">
      <div className="hamburguesa-toggle" onClick={handleClick}>
        <DotLottieReact
          src="https://lottie.host/fe0cf67d-6c0c-4cca-8648-93b385bb5ff7/S89OGI9ck3.json"
          autoplay={false}
          loop={false}
          className="MenuHamburguesa"
          dotLottieRefCallback={(dotLottie) => {
            dotLottieRef.current = dotLottie;
          }}
        />
      </div>

      {isOpen && (
        <nav className="menu-desplegable">
          <ul>
            <li onClick={() => irA("/formulario/agregar")}>Agregar producto</li>
            <li onClick={() => irA("/formulario/arena")}>Arenas</li>
            <li onClick={() => irA("/formulario/churus")}>Churus</li>
            <li onClick={() => irA("/")}>Inicio</li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default MenuHamburguesa;
