import { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** Standard content container used on most pages.
 *  Skip it on full-bleed pages (e.g. login / register split-screen). */
export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10', className)} {...rest} />
  );
}
