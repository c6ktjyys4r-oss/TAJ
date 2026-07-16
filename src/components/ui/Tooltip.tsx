import React, { useState } from 'react';
import { clsx } from 'clsx';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const positions = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left:   'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right:  'left-full top-1/2 -translate-y-1/2 ml-1.5',
};

export const Tooltip: React.FC<TooltipProps> = ({
  content, children, side = 'top', className
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className={clsx('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={clsx(
            'absolute z-50 px-2.5 py-1 text-xs font-medium text-white bg-ink-primary rounded-lg whitespace-nowrap pointer-events-none shadow-float',
            positions[side]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};
