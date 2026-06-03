'use client';
import { LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

export function Label({ className, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('block text-sm font-medium text-slate-700 mb-1', className)} {...rest} />;
}

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
          className,
        )}
        {...rest}
      />
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
          className,
        )}
        {...rest}
      />
    );
  },
);

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg bg-white border border-slate-200 shadow-sm', className)} {...rest} />;
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4 border-b border-slate-200', className)} {...rest} />;
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...rest} />;
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-800',
  PAID:            'bg-blue-100 text-blue-800',
  PROCESSING:      'bg-indigo-100 text-indigo-800',
  SHIPPED:         'bg-purple-100 text-purple-800',
  DELIVERED:       'bg-green-100 text-green-800',
  CANCELLED:       'bg-slate-200 text-slate-700',
};

export function Badge({ children, value, className }: { children?: React.ReactNode; value?: string; className?: string }) {
  const colour = value && statusColors[value] ? statusColors[value] : 'bg-slate-100 text-slate-700';
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', colour, className)}>
      {children ?? value}
    </span>
  );
}
