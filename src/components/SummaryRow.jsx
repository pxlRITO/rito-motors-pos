import React from 'react';

const SummaryRow = ({ label, value, isTotal = false }) => {
  return (
    <div className={`flex justify-between items-center py-2 ${isTotal ? 'border-t border-slate-800 mt-2 pt-4' : ''}`}>
      <span className={`${isTotal ? 'text-lg font-bold text-slate-100' : 'text-slate-400 font-medium'}`}>
        {label}
      </span>
      <span className={`${isTotal ? 'text-xl font-bold text-blue-500' : 'text-slate-100 font-semibold'}`}>
        {value}
      </span>
    </div>
  );
};

export default SummaryRow;
