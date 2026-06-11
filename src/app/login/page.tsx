'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label, Eyebrow, DisplayHeading } from '@/components/ui';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const tokens = await auth.login(email, password);
      setUser(tokens.user);
      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2">
      {/* Brand panel — hidden on small screens */}
      <div className="hidden lg:flex relative bg-ink text-paper overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30 pointer-events-none" aria-hidden="true" />
        <div className="relative p-16 flex flex-col justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span className="text-base font-semibold tracking-tight">SoleHub</span>
          </div>
          <div>
            <Eyebrow className="text-gold">Welcome back</Eyebrow>
            <DisplayHeading
              as="h1"
              text="Good to see you again."
              accent="again"
              className="mt-4 text-4xl lg:text-5xl leading-[1.1]"
            />
            <p className="mt-5 text-paper/70 max-w-md leading-relaxed">
              Log in to track your orders, manage your profile, or pick up where you left off in the cart.
            </p>
          </div>
          <div className="text-xs text-paper/40 uppercase tracking-eyebrow">Lagos &middot; NGN</div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <Eyebrow>Account</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold tracking-tightest text-ink">Log in.</h1>
          <p className="mt-2 text-sm text-ink-2">Use your email and password.</p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            {error && (
              <div role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}
            <Button type="submit" disabled={busy} className="w-full" size="lg">
              {busy ? 'Logging in...' : 'Log in'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-rule text-sm text-ink-2 text-center">
            No account? <Link href="/register" className="text-ink font-medium hover:text-gold transition-colors duration-150">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
