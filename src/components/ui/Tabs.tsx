import { clsx } from 'clsx';

interface Tab<T extends string> { value: T; label: string; count?: number; }

interface TabsProps<T extends string> {
  tabs: readonly Tab<T>[] | Tab<T>[];
  active: T;
  onChange: (value: T) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

export function Tabs<T extends string>({
  tabs, active, onChange, variant = 'underline', className
}: TabsProps<T>) {
  if (variant === 'pill') {
    return (
      <div className={clsx('flex gap-1 p-1 bg-gray-100 rounded-xl w-fit', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5',
              active === tab.value
                ? 'bg-white text-gold-700 shadow-card'
                : 'text-ink-secondary hover:text-ink-primary'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={clsx(
                'text-xs px-1.5 py-0.5 rounded-full font-bold',
                active === tab.value ? 'bg-gold-100 text-gold-600' : 'bg-gray-200 text-ink-muted'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('flex gap-0 border-b border-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 flex items-center gap-1.5',
            active === tab.value
              ? 'border-gold-500 text-gold-600'
              : 'border-transparent text-ink-secondary hover:text-ink-primary hover:border-gray-200'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={clsx(
              'text-xs px-1.5 rounded-full font-bold',
              active === tab.value ? 'text-gold-600 bg-gold-100' : 'text-ink-muted bg-gray-100'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
