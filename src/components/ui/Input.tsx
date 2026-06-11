'use client';
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'block w-full rounded-md border border-rule bg-paper px-3.5 py-2.5 text-sm text-ink',
          'placeholder:text-ink-3',
          'focus:outline-none focus:border-ink focus:ring-0',
          'disabled:bg-rule/30 disabled:opacity-60',
          'transition-colors duration-150 ease-smooth',
          className,
        )}
        {...rest}
      />
    );
  },
);
