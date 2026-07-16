import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

interface LaunchpadCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  badge?: string | number;
  accentColor?: string;
}

export const LaunchpadCard: React.FC<LaunchpadCardProps> = ({
  icon, title, description, to, badge, accentColor = 'from-gold-50 to-white'
}) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className={clsx(
        'group relative flex flex-col items-start gap-4 p-6 rounded-2xl border border-border',
        'bg-white shadow-card hover:shadow-card-hover hover:border-gold-200',
        'transition-all duration-200 text-left w-full focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-1'
      )}
    >
      {/* Icon */}
      <div className={clsx(
        'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
        'text-gold-600 group-hover:scale-105 transition-transform duration-200',
        accentColor
      )}>
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink-primary group-hover:text-gold-700 transition-colors font-serif">
            {title}
          </span>
          {badge !== undefined && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-100 text-gold-700">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-ink-muted mt-1 leading-relaxed">{description}</p>
      </div>

      {/* Gold corner accent */}
      <div className="absolute bottom-0 right-0 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-gold-100 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5h6M5 2l3 3-3 3" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </button>
  );
};
