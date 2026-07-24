import { BrowserRouter, Route, Routes } from "react-router-dom";
import Churus from "./formulario/churus.jsx";
import Home from "./components/home/Home";
import Arena from "./formulario/arena.jsx";
import Formulario from "./formulario/Formulario.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/formulario/CatChow" element={<Formulario />} />
        <Route path="/formulario/Arena" element={<Arena />} />
        <Route path="/formulario/Churus" element={<Churus />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
