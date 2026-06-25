import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { CustomCursor } from './components/ui/CustomCursor';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
