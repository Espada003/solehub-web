'use client';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-rule mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold" />
              <span className="text-base font-semibold tracking-tight text-ink">SoleHub</span>
            </div>
            <p className="mt-3 text-sm text-ink-2 max-w-md leading-relaxed">
              Footwear and accessories, shipped across Nigeria. Considered selection. Honest pricing.
            </p>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-eyebrow font-medium text-ink-2 mb-3">Shop</div>
            <ul className="space-y-2 text-sm text-ink-2">
              <li><Link href="/products" className="hover:text-ink transition-colors duration-150">All products</Link></li>
              <li><Link href="/products?category=SHOES" className="hover:text-ink transition-colors duration-150">Shoes</Link></li>
              <li><Link href="/products?category=LACES" className="hover:text-ink transition-colors duration-150">Laces</Link></li>
              <li><Link href="/products?category=POLISH" className="hover:text-ink transition-colors duration-150">Polish</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-eyebrow font-medium text-ink-2 mb-3">Account</div>
            <ul className="space-y-2 text-sm text-ink-2">
              <li><Link href="/login" className="hover:text-ink transition-colors duration-150">Log in</Link></li>
              <li><Link href="/register" className="hover:text-ink transition-colors duration-150">Sign up</Link></li>
              <li><Link href="/orders" className="hover:text-ink transition-colors duration-150">Orders</Link></li>
              <li><Link href="/profile" className="hover:text-ink transition-colors duration-150">Profile</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-rule mt-10 pt-6 flex items-center justify-between text-xs text-ink-3">
          <div>&copy; {new Date().getFullYear()} SoleHub. Made in Nigeria.</div>
          <div>NGN &middot; Lagos</div>
        </div>
      </div>
    </footer>
  );
}
