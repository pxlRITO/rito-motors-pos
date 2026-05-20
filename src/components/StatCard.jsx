import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, color = 'red' }) => {
  const colors = {
    red: 'text-toyota-red bg-red-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    blue: 'text-blue-600 bg-blue-50',
    black: 'text-toyota-black bg-gray-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 border-l-4 border-l-toyota-red"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-sm ${colors[color] || colors.red}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-xs font-black tracking-tighter ${trend > 0 ? 'text-emerald-600' : 'text-toyota-red'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-toyota-charcoal text-[10px] font-black uppercase tracking-[0.15em] mb-1">{title}</p>
        <h3 className="text-2xl font-black text-toyota-black tracking-tight">{value}</h3>
      </div>
    </motion.div>
  );
};

export default StatCard;
