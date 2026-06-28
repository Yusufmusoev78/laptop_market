import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { RequireAuth } from './components/auth/RequireAuth';
import { RequireAdmin } from './components/auth/RequireAdmin';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { LaptopDetail } from './pages/LaptopDetail';
import { PhoneDetail } from './pages/PhoneDetail';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { BrandOnboarding } from './pages/BrandOnboarding';
import { MyStats } from './pages/MyStats';
import { AIChatbot } from './components/ui/AIChatbot';
import { MarketProvider } from './context/MarketContext';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <MarketProvider>
          <BrowserRouter>
            <AuthProvider>
              <NotificationsProvider>
                <div className="app-container">
                  <Toaster position="top-right" />
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/catalog/:id" element={<LaptopDetail />} />
                      <Route path="/catalog/phone/:id" element={<PhoneDetail />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                      <Route path="/brands/new" element={<RequireAuth><BrandOnboarding /></RequireAuth>} />
                      <Route path="/my-stats" element={<RequireAuth><MyStats /></RequireAuth>} />
                      <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
                    </Routes>
                  </main>
                  <Footer />
                  <AIChatbot />
                </div>
              </NotificationsProvider>
            </AuthProvider>
          </BrowserRouter>
        </MarketProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
