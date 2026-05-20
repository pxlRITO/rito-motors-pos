import React from 'react';

const SummaryRow = ({ label, value, isTotal = false }) => {
  return (
    <div className={`flex justify-between items-center py-3 ${isTotal ? 'border-t-2 border-toyota-black mt-4 pt-4' : 'border-b border-gray-100'}`}>
      <span className={`${isTotal ? 'text-sm font-black text-toyota-black uppercase tracking-widest' : 'text-[11px] font-bold text-gray-500 uppercase tracking-wider'}`}>
        {label}
      </span>
      <span className={`${isTotal ? 'text-2xl font-black text-toyota-red tracking-tighter' : 'text-sm font-bold text-toyota-black'}`}>
        {value}
      </span>
    </div>
  );
};

export default SummaryRow;
