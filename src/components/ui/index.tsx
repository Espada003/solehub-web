'use client';
import { LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

export function Label({ className, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('block text-xs font-medium text-ink-2 mb-1.5 tracking-wide', className)} {...rest} />;
}

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'block w-full rounded-md border border-rule bg-paper px-3.5 py-2.5 text-sm text-ink',
          'focus:outline-none focus:border-ink focus:ring-0',
          'transition-colors duration-150 ease-smooth',
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
          'block w-full rounded-md border border-rule bg-paper px-3.5 py-2.5 text-sm text-ink',
          'placeholder:text-ink-3',
          'focus:outline-none focus:border-ink focus:ring-0',
          'transition-colors duration-150 ease-smooth',
          className,
        )}
        {...rest}
      />
    );
  },
);

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg bg-paper border border-rule',
        'transition-all duration-200 ease-smooth',
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-5 border-b border-rule', className)} {...rest} />;
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-5', className)} {...rest} />;
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-gold-tint text-gold-deep border border-gold/30',
  PAID:            'bg-blue-50 text-blue-800 border border-blue-200',
  PROCESSING:      'bg-indigo-50 text-indigo-800 border border-indigo-200',
  SHIPPED:         'bg-purple-50 text-purple-800 border border-purple-200',
  DELIVERED:       'bg-emerald-50 text-emerald-800 border border-emerald-200',
  CANCELLED:       'bg-rule/40 text-ink-2 border border-rule',
};

export function Badge({ children, value, className }: { children?: React.ReactNode; value?: string; className?: string }) {
  const colour = value && statusColors[value] ? statusColors[value] : 'bg-paper text-ink-2 border border-rule';
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase',
      colour,
      className,
    )}>
      {children ?? value}
    </span>
  );
}

/** Small uppercase eyebrow label. Used above headings to add structure. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('text-[11px] uppercase tracking-eyebrow font-medium text-ink-2', className)}>
      {children}
    </div>
  );
}

/** Display heading where a chosen word is set in serif italic for premium feel.
 *  Usage: <DisplayHeading text="Footwear for every step" accent="step" />
 *  The accent word, if found, is rendered in Instrument Serif italic. */
export function DisplayHeading({
  text,
  accent,
  as: As = 'h1',
  className,
}: {
  text: string;
  accent?: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}) {
  if (!accent || !text.includes(accent)) {
    return <As className={cn('font-bold tracking-tightest', className)}>{text}</As>;
  }
  const [before, ...rest] = text.split(accent);
  const after = rest.join(accent);
  return (
    <As className={cn('font-bold tracking-tightest', className)}>
      {before}
      <span className="font-serif italic font-normal tracking-normal">{accent}</span>
      {after}
    </As>
  );
}
