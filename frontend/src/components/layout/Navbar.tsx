import React from 'react';
import { NavLink } from 'react-router-dom';
import { Laptop, ShoppingCart, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'white' }}>
          <Laptop size={24} className="text-gradient" />
          <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>TJ Laptops</span>
        </NavLink>
      </div>
      
      <div className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/catalog">Catalog</NavLink>
      </div>
      
      <div className="nav-actions" style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn btn-glass" style={{ padding: '0.5rem' }}>
          <ShoppingCart size={20} />
        </button>
        <button className="btn btn-glass" style={{ padding: '0.5rem' }}>
          <User size={20} />
        </button>
      </div>
    </nav>
  );
};
