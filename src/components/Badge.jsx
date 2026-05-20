import React from 'react';
import { twMerge } from 'tailwind-merge';

const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-toyota-gray text-toyota-charcoal border-gray-200',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    danger: 'bg-red-50 text-toyota-red border-red-100',
    info: 'bg-toyota-red/5 text-toyota-red border-toyota-red/10',
  };

  return (
    <span className={twMerge(
      'px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-widest inline-flex items-center',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export default Badge;
