import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      <label
        htmlFor={textareaId}
        className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5"
      >
        {label}
      </label>
      <textarea
        id={textareaId}
        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-vertical ${
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

export default Textarea;
