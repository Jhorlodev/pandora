import CatChow from '../../assets/cat-chow-delimix-19-kg.webp';
import Arena from '../../assets/arena.webp';
import './home.css'
import churus from '../../assets/churus.jpg';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className='container'>
      <h3>home</h3>
      <section className='articulo'>
        <img
          className='imgCatchow'
          src={CatChow}
          alt='carchow adulto 19.5 kg'
          onClick={() => navigate('/formulario/CatChow')}
        />
        <p>CatChow adultos 19.5 kg</p>
      </section>

      <section className='articulo'>
        <img
          className='imgCatchow'
          src={Arena}
          alt='Arena sanitaria 5 kg'
          onClick={() => navigate('/formulario/Arena')}
        />
        <p>Arena sanitaria 5 kg</p>
      </section>

      <section className='articulo'>
        <img
          className='imgCatchow'
          src={churus}
          alt='churus tuna'
          onClick={() => navigate('/formulario/Churus')}
        />
        <p>churus tuna</p>
      </section>
    </div>
  )
}

export default Home;