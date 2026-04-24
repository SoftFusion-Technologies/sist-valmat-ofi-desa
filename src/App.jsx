import Navbar from './components/Navbar';
import logoValmat from './Images/logo_1.png';
import Hero from './sections/Hero';
import Servicios from './sections/Servicios';
import ServicesVideosShowcase from './components/sections/ServicesVideosShowcase';
import Footer from './components/Footer';
import Contacto from './sections/Contacto';
import Cobertura from './sections/Cobertura';
import ValmatProceso from './components/ValmatProceso';
function App() {
  return (
    <>
      <Navbar logoSrc={logoValmat} />
      <Hero></Hero>
      <Servicios />
      <ValmatProceso/>
      <ServicesVideosShowcase />
      <Cobertura></Cobertura>
      <Contacto></Contacto>
      <Footer logoSrc={logoValmat} />
    </>
  );
}

export default App;
