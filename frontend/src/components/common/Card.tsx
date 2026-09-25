import React from 'react';
import { ChevronRight } from 'lucide-react';

interface CardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  color?: string;
  badge?: string | number;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  icon,
  onClick,
  color = 'primary',
  badge,
  className = '',
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 dark:bg-primary-900/30 text-primary-500 dark:text-primary-400',
    success: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400',
    warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400',
    danger: 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400',
    info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400',
    violet: 'bg-violet-50 dark:bg-violet-900/30 text-violet-500 dark:text-violet-400',
    slate: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
  };

  const Wrapper = onClick ? 'button' : 'div';
  const wrapperProps = onClick ? { onClick, type: 'button' as const } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`p-5 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 
        hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all text-left group 
        ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}>
            {icon}
          </div>
        )}
        {badge && (
          <span className="px-2 py-0.5 text-xs font-medium bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full">
            {badge}
          </span>
        )}
        {onClick && (
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors" />
        )}
      </div>
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {title}
      </h4>
      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{description}</p>
      )}
    </Wrapper>
  );
};

export default Card;
