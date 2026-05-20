import React from 'react';

const Select = ({ label, options, error, ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <select
        className={`input appearance-none ${error ? 'border-red-500 focus:ring-red-500/50' : ''}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
