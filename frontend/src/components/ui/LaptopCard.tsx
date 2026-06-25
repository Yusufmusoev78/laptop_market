import React from 'react';
import { Cpu, HardDrive, MemoryStick } from 'lucide-react';
import { Laptop } from '../../api/laptops';
import { Button } from './Button';
import './LaptopCard.css';

interface LaptopCardProps {
  laptop: Laptop;
}

export const LaptopCard: React.FC<LaptopCardProps> = ({ laptop }) => {
  return (
    <div className="laptop-card glass-panel animate-fade-in">
      <div className="card-image-placeholder">
        {/* Placeholder for actual image */}
        <div className="laptop-brand-badge">{laptop.brand}</div>
      </div>
      
      <div className="card-content">
        <h3 className="laptop-title">{laptop.brand} {laptop.model_name}</h3>
        
        <div className="specs-grid">
          <div className="spec-item">
            <Cpu size={16} className="spec-icon" />
            <span>{laptop.cpu}</span>
          </div>
          <div className="spec-item">
            <MemoryStick size={16} className="spec-icon" />
            <span>{laptop.ram_gb} GB RAM</span>
          </div>
          <div className="spec-item">
            <HardDrive size={16} className="spec-icon" />
            <span>{laptop.storage_gb} GB SSD</span>
          </div>
        </div>
        
        <div className="card-footer">
          <div className="price-tag">
            <span className="currency">TJS</span>
            <span className="amount">{laptop.price_tjs.toLocaleString()}</span>
          </div>
          <Button variant="primary" size="sm">View Details</Button>
        </div>
      </div>
    </div>
  );
};
