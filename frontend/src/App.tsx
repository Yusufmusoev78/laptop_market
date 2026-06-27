import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { LaptopDetail } from './pages/LaptopDetail';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <BrowserRouter>
          <div className="app-container">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/catalog/:id" element={<LaptopDetail />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
