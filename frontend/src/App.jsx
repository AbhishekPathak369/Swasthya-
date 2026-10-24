import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Predictor from './pages/Predictor'; // <-- ADDED IMPORT
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/predict" element={<Predictor />} /> {/* <-- ADDED ROUTE */}
      </Routes>
      <Footer />
    </div>
  );
}

export default App;