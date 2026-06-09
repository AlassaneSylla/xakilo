import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip?: string;
  color?: 'default' | 'primary' | 'danger' | 'warning' | 'success';
  children: ReactNode;
}

const colors: Record<string, string> = {
  default: 'text-gray-400 hover:text-[var(--black)] hover:bg-base-300',
  primary: 'text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10',
  danger:  'text-gray-400 hover:text-red-500 hover:bg-red-50',
  warning: 'text-gray-400 hover:text-amber-500 hover:bg-amber-50',
  success: 'text-gray-400 hover:text-green-600 hover:bg-green-50',
};

export default function IconButton({
  tooltip,
  color = 'default',
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        'btn btn-xs btn-ghost p-1.5 rounded-lg transition-all duration-150 border-0',
        colors[color],
        tooltip && 'tooltip tooltip-top',
        className
      )}
      data-tip={tooltip}
      {...props}
    >
      {children}
    </button>
  );
}