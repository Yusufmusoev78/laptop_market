import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { BrandPerformancePoint } from '../../api/stats';
import './charts.css';

interface Props {
  data: BrandPerformancePoint[];
  title: string;
  emptyLabel: string;
}

const COLORS = ['var(--primary)', 'var(--gold)', 'var(--success)', 'var(--gold-bright)', 'var(--primary-dark)'];

export const BrandPerformanceChart: React.FC<Props> = ({ data, title, emptyLabel }) => (
  <motion.div className="chart-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
    <h3 className="chart-title">{title}</h3>
    {data.length === 0 ? (
      <p className="chart-empty">{emptyLabel}</p>
    ) : (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="brand_name" stroke="var(--text-muted)" fontSize={11} />
          <YAxis stroke="var(--text-muted)" fontSize={11} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: 'var(--text-primary)' }}
          />
          <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.brand_id} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )}
  </motion.div>
);
