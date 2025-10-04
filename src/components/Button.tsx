import type { ReactNode, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'redghost' | 'ghost' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const baseStyles = 'rounded px-4 py-2 font-semibold transition-colors duration-200 min-w-50 cursor-pointer';

const variantStyles = {
    primary: 'btn bg-[var(--primary)] hover:bg-[var(--primary-hover)] hover:text-[var(--brokenWhite)]',
    secondary: 'btn bg-blue-100 border-1 border-blue-300 text-blue-500 hover:bg-blue-400 hover:text-[var(--brokenWhite)]',
    redghost: 'btn bg-red-100 border-1 border-red-300 text-red-500 hover:bg-red-400 hover:text-[var(--brokenWhite)]',
    ghost: 'btn bg-orange-100 border-1 border-orange-300 text-orange-500 hover:bg-orange-400 hover:text-[var(--brokenWhite)]',
};

// const sizeStyles = {
//     sm: 'text-sm py-1 px-2',
//     md: 'text-base py-2 px-4',
//     lg: 'text-lg py-3 px-6',
// };


function Button({
    children,
    variant = 'primary',
    // size = 'sm',
    className,
    ...props
}: ButtonProps) {
  return (
    <button
        className={clsx(baseStyles, variantStyles[variant], className)}
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
