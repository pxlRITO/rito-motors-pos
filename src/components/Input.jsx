import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <input
        className={`input ${error ? 'border-toyota-red focus:ring-toyota-red/10' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-[10px] font-bold text-toyota-red uppercase tracking-wider">{error}</p>}
    </div>
  );
};

export default Input;
