import type { ReactNode, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'redghost' | 'ghost' | 'secondary' | 'greyghost';
    size?: 'sm' | 'md' | 'lg' | 'small';
    className?: string;
}

const baseStyles = 'rounded px-4 py-2 font-semibold transition-colors duration-200 min-w-50 cursor-pointer';

const variantStyles = {
    primary: 'btn bg-[var(--primary)] hover:bg-[var(--primary-hover)] hover:text-[var(--brokenWhite)]',
    secondary: 'btn bg-blue-100 border-1 border-blue-300 text-blue-500 hover:bg-blue-400 hover:text-[var(--brokenWhite)]',
    redghost: 'btn bg-red-100 border-1 border-red-300 text-red-500 hover:bg-red-400 hover:text-[var(--brokenWhite)]',
    ghost: 'btn bg-orange-100 border-1 border-orange-300 text-orange-500 hover:bg-orange-400 hover:text-[var(--brokenWhite)]',
    greyghost: 'btn bg-gray-300 border-1 border-gray-400 text-gray-800 hover:bg-gray-500 hover:text-[var(--brokenWhite)]'
};

const sizeStyles = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
    small: "btn-xs"
};

function Button({
    children,
    variant = 'primary',
    size = 'sm',
    className,
    ...props
}: ButtonProps) {
  return (
    <button
        className={clsx(
            baseStyles, 
            variantStyles[variant], 
            sizeStyles[size],
            className
        )}
        {...props}
    >
        {children}
    </button>
  );
}

export default Button;

{/* <Button>Par défaut</Button>
<Button variant="secondary" size="lg">Secondaire large</Button>
<Button variant="ghost" size="sm">Ghost small</Button> */}
