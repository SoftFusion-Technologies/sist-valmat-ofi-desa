import Navbar from './components/Navbar';
import logoValmat from './Images/logo_1.png';
import Hero from './sections/Hero';
import Servicios from './sections/Servicios';
import ServicesVideosShowcase from './components/sections/ServicesVideosShowcase';
import Footer from './components/Footer';
import Contacto from './sections/Contacto';
function App() {
  return (
    <>
      <Navbar logoSrc={logoValmat} />
      <Hero></Hero>
      <Servicios />
      <ServicesVideosShowcase />
      <Contacto></Contacto>
      <Footer logoSrc={logoValmat} />
    </>
  );
}

export default App;
