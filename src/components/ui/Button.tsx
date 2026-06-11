'use client';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-ink text-paper hover:bg-gold hover:text-ink active:scale-[0.98] ' +
    'transition-all duration-150 ease-smooth',
  secondary:
    'bg-paper text-ink border border-rule hover:border-ink ' +
    'transition-colors duration-150 ease-smooth',
  danger:
    'bg-red-700 text-paper hover:bg-red-800 active:scale-[0.98] ' +
    'transition-all duration-150 ease-smooth',
  ghost:
    'bg-transparent text-ink hover:bg-gold-tint ' +
    'transition-colors duration-150 ease-smooth',
  outline:
    'bg-transparent text-ink border border-rule hover:border-ink hover:bg-paper ' +
    'transition-colors duration-150 ease-smooth',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs tracking-wide',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    />
  );
});
