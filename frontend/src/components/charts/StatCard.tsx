import React from 'react';
import { motion } from 'framer-motion';
import './charts.css';

interface StatCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  index?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, index = 0 }) => (
  <motion.div
    className="stat-card"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
  >
    {icon && <div className="stat-card-icon">{icon}</div>}
    <div className="stat-card-value">{value}</div>
    <div className="stat-card-label">{label}</div>
  </motion.div>
);
