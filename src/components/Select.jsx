import React from 'react';

const Select = ({ label, options, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <select
        className={`input appearance-none bg-no-repeat bg-right pr-10 ${error ? 'border-toyota-red focus:ring-toyota-red/10' : ''} ${className}`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23111111' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1.5rem', backgroundPosition: 'right 0.75rem center' }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-[10px] font-bold text-toyota-red uppercase tracking-wider">{error}</p>}
    </div>
  );
};

export default Select;
