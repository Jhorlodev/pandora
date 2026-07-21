import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/home/Home';
import Formulario from './formulario/Formulario.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/formulario/:producto" element={<Formulario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;