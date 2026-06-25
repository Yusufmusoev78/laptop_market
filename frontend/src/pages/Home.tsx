import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
      <div style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Discover Your Next <br />
          <span className="text-gradient">Premium Laptop</span>
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          The ultimate marketplace for high-end laptops in Tajikistan. Experience unparalleled performance and design.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button size="lg" variant="primary" onClick={() => navigate('/catalog')}>
            Explore Catalog
          </Button>
          <Button size="lg" variant="glass">
            Learn More
          </Button>
        </div>
      </div>
      
      {/* Decorative background glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(15,23,42,0) 70%)',
        zIndex: -1,
        pointerEvents: 'none',
        animation: 'pulse-glow 4s ease-in-out infinite'
      }} />
    </div>
  );
};
