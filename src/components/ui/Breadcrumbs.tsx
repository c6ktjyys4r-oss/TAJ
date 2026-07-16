import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface Crumb { label: string; to?: string; }

interface BreadcrumbsProps { crumbs: Crumb[]; className?: string; }

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ crumbs, className }) => (
  <nav className={clsx('flex items-center gap-1 text-xs', className)} aria-label="Breadcrumb">
    {crumbs.map((crumb, i) => {
      const isLast = i === crumbs.length - 1;
      return (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight size={12} className="text-ink-muted shrink-0" />}
          {crumb.to && !isLast ? (
            <Link
              to={crumb.to}
              className="text-ink-secondary hover:text-gold-600 transition-colors font-medium"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className={clsx(isLast ? 'text-ink-primary font-semibold' : 'text-ink-secondary')}>
              {crumb.label}
            </span>
          )}
        </React.Fragment>
      );
    })}
  </nav>
);
