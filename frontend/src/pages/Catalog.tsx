import React, { useEffect, useState } from 'react';
import { getLaptops, Laptop } from '../api/laptops';
import { LaptopCard } from '../components/ui/LaptopCard';
import { Loader } from 'lucide-react';

export const Catalog: React.FC = () => {
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaptops = async () => {
      try {
        const data = await getLaptops();
        setLaptops(data);
      } catch (err) {
        setError('Failed to load laptops. Is the server running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLaptops();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader className="animate-spin text-gradient" size={48} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--danger)' }}>
        <h3 style={{ color: 'var(--danger)' }}>{error}</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Make sure the FastAPI backend and Database are correctly configured and running.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="text-gradient" style={{ fontSize: '3rem' }}>Laptop Catalog</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>Find the perfect machine for your needs in Tajikistan.</p>
      </div>
      
      {laptops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p>No laptops currently available in the database.</p>
        </div>
      ) : (
        <div className="grid-layout">
          {laptops.map((laptop) => (
            <LaptopCard key={laptop.id} laptop={laptop} />
          ))}
        </div>
      )}
    </div>
  );
};
