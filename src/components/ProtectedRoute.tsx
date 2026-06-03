'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import type { Role } from '@/lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowRoles?: Role[]; // if omitted, any logged-in user
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, allowRoles, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (allowRoles && !allowRoles.includes(user.role)) {
      router.replace('/');
    }
  }, [user, loading, allowRoles, router]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }
  if (!user) return fallback ?? null;
  if (allowRoles && !allowRoles.includes(user.role)) return fallback ?? null;
  return <>{children}</>;
}
