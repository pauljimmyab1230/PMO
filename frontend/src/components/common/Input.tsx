import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
          error
            ? 'border-red-500 dark:border-red-400 focus:ring-red-500'
            : 'border-slate-200 dark:border-slate-600'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
