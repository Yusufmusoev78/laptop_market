import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { MonthlySalesPoint } from '../../api/stats';
import './charts.css';

interface Props {
  data: MonthlySalesPoint[];
  title: string;
  emptyLabel: string;
}

export const RevenueTrendChart: React.FC<Props> = ({ data, title, emptyLabel }) => (
  <motion.div className="chart-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
    <h3 className="chart-title">{title}</h3>
    {data.length === 0 ? (
      <p className="chart-empty">{emptyLabel}</p>
    ) : (
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
          <YAxis stroke="var(--text-muted)" fontSize={11} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: 'var(--text-primary)' }}
          />
          <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#revenueGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    )}
  </motion.div>
);
