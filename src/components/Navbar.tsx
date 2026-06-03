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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-semibold text-brand-700">SoleHub</Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-slate-700">
            <Link href="/products" className="hover:text-brand-600">Products</Link>
            {user?.role === 'CUSTOMER' && (
              <>
                <Link href="/cart" className="hover:text-brand-600">Cart</Link>
                <Link href="/orders" className="hover:text-brand-600">My orders</Link>
              </>
            )}
            {user && (user.role === 'STAFF' || user.role === 'SUPER_ADMIN') && (
              <Link href="/admin/products" className="hover:text-brand-600">Manage products</Link>
            )}
            {user && (user.role === 'STAFF' || user.role === 'SUPER_ADMIN') && (
              <Link href="/admin/inventory" className="hover:text-brand-600">Inventory</Link>
            )}
            {user && (user.role === 'STAFF' || user.role === 'SUPER_ADMIN') && (
              <Link href="/admin/orders" className="hover:text-brand-600">All orders</Link>
            )}
            {user && (user.role === 'ACCOUNTANT' || user.role === 'SUPER_ADMIN') && (
              <Link href="/admin/reports" className="hover:text-brand-600">Reports</Link>
            )}
            {user && (user.role === 'ACCOUNTANT' || user.role === 'SUPER_ADMIN') && (
              <Link href="/admin/payroll" className="hover:text-brand-600">Payroll</Link>
            )}
            {user?.role === 'SUPER_ADMIN' && (
              <Link href="/admin/users" className="hover:text-brand-600">Users</Link>
            )}
            {user?.role === 'SUPER_ADMIN' && (
              <Link href="/admin/audit" className="hover:text-brand-600">Audit</Link>
            )}
            {user && (user.role === 'STAFF' || user.role === 'ACCOUNTANT' || user.role === 'SUPER_ADMIN') && (
              <Link href="/me-payroll" className="hover:text-brand-600">My payroll</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/profile" className="text-sm text-slate-600 hover:text-brand-600">
                {user.firstName} ({user.role})
              </Link>
              <Button variant="outline" size="sm" onClick={onLogout}>Log out</Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="outline" size="sm">Log in</Button></Link>
              <Link href="/register"><Button size="sm">Sign up</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
