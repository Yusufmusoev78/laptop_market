import React from 'react';
import { Gem } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="main-footer">
    <div className="footer-brand">
      <Gem size={16} style={{ color: 'var(--accent)' }} />
      Somon Comp
    </div>
    <p>&copy; {new Date().getFullYear()} Somon Comp — Premium laptops for Tajikistan, priced in somoni.</p>
  </footer>
);
