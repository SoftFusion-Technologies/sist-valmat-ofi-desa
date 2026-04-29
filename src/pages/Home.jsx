// Benjamin Orellana - 2026/04/24 - Home concentra toda la landing principal de VALMAT.

import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../sections/Hero';
import Servicios from '../sections/Servicios';
import ServicesVideosShowcase from '../components/sections/ServicesVideosShowcase';
import Contacto from '../sections/Contacto';
import Cobertura from '../sections/Cobertura';
import ValmatProceso from '../components/ValmatProceso';

const Home = ({ logoSrc }) => {
  return (
    <>
      <Navbar logoSrc={logoSrc} />
      <Hero />
      <Servicios />
      <ValmatProceso />
      <ServicesVideosShowcase />
      <Cobertura />
      <Contacto />
      {/* <Footer logoSrc={logoSrc} /> */}
    </>
  );
};

export default Home;
