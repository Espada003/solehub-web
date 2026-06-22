'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { auth } from '@/lib/auth';
import { Button } from './ui/Button';

export function Navbar() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const onLogout = async () => {
    await auth.logout();
    setUser(null);
    router.push('/');
  };

  return (
    <header className="bg-paper/80 backdrop-blur-md border-b border-rule sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-2 h-2 rounded-full bg-gold transition-colors duration-150 group-hover:bg-ink" />
            <span className="text-base font-semibold tracking-tight text-ink">SoleHub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-ink-2">
            <Link href="/products" className="hover:text-ink transition-colors duration-150">Products</Link>
            {user?.role === 'CUSTOMER' && (
              <>
                <Link href="/cart" className="hover:text-ink transition-colors duration-150">Cart</Link>
                <Link href="/orders" className="hover:text-ink transition-colors duration-150">My orders</Link>
              </>
            )}
            {user && (user.role === 'STAFF' || user.role === 'SUPER_ADMIN') && (
              <Link href="/admin/products" className="hover:text-ink transition-colors duration-150">Catalogue</Link>
            )}
            {user && (user.role === 'STAFF' || user.role === 'SUPER_ADMIN') && (
              <Link href="/admin/inventory" className="hover:text-ink transition-colors duration-150">Inventory</Link>
            )}
            {user && (user.role === 'STAFF' || user.role === 'SUPER_ADMIN') && (
              <Link href="/admin/orders" className="hover:text-ink transition-colors duration-150">Orders</Link>
            )}
            {user && (user.role === 'ACCOUNTANT' || user.role === 'SUPER_ADMIN') && (
              <Link href="/admin/reports" className="hover:text-ink transition-colors duration-150">Reports</Link>
            )}
            {user && (user.role === 'ACCOUNTANT' || user.role === 'SUPER_ADMIN') && (
              <Link href="/admin/payroll" className="hover:text-ink transition-colors duration-150">Payroll</Link>
            )}
            {user?.role === 'SUPER_ADMIN' && (
              <Link href="/admin/users" className="hover:text-ink transition-colors duration-150">Users</Link>
            )}
            {user?.role === 'SUPER_ADMIN' && (
              <Link href="/admin/audit" className="hover:text-ink transition-colors duration-150">Audit</Link>
            )}
            {user && (user.role === 'STAFF' || user.role === 'ACCOUNTANT' || user.role === 'SUPER_ADMIN') && (
              <Link href="/me-payroll" className="hover:text-ink transition-colors duration-150">My payroll</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/profile" className="hidden sm:flex items-center gap-2 text-xs text-ink-2 hover:text-ink transition-colors duration-150">
                <span className="w-7 h-7 rounded-full bg-gold-tint text-gold-deep flex items-center justify-center text-[11px] font-semibold uppercase">
                  {user.firstName?.charAt(0) ?? '?'}
                </span>
                <span className="hidden lg:inline">{user.firstName} &middot; <span className="uppercase tracking-wider">{user.role}</span></span>
              </Link>
              <Button variant="outline" size="sm" onClick={onLogout}>Log out</Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link href="/register"><Button size="sm">Sign up</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
