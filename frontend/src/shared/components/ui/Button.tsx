import type { ReactNode, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'dark' | 'secondary' | 'ghost' | 'redghost' | 'greyghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'small';
  loading?: boolean;
}

const base = 'btn font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<string, string> = {
  primary:  'bg-[var(--primary)] text-black border-[var(--primary)] hover:bg-[var(--primary-hover)] hover:border-[var(--primary-hover)] hover:text-white',
  dark:     'bg-[var(--black)] text-[var(--brokenWhite)] border-[var(--black)] hover:opacity-80',
  secondary:'bg-blue-50 border border-blue-300 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500',
  redghost: 'bg-red-50 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500',
  ghost:    'bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-500 hover:text-white hover:border-amber-500',
  greyghost:'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-500 hover:text-white hover:border-gray-500',
  outline:  'bg-transparent border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white',
};

const sizes: Record<string, string> = {
  sm:    'btn-sm',
  md:    'btn-md',
  lg:    'btn-lg',
  small: 'btn-xs',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'sm',
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading
        ? <span className="loading loading-spinner loading-xs" />
        : children}
    </button>
  );
}