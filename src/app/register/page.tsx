'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label, Eyebrow, DisplayHeading } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await auth.register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
      });
      await auth.login(form.email, form.password);
      router.push('/');
      window.location.reload();
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex relative bg-ink text-paper overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30 pointer-events-none" aria-hidden="true" />
        <div className="relative p-16 flex flex-col justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span className="text-base font-semibold tracking-tight">SoleHub</span>
          </div>
          <div>
            <Eyebrow className="text-gold">Welcome</Eyebrow>
            <DisplayHeading
              as="h1"
              text="Start your collection."
              accent="collection"
              className="mt-4 text-4xl lg:text-5xl leading-[1.1]"
            />
            <p className="mt-5 text-paper/70 max-w-md leading-relaxed">
              Create an account to track orders, save your shipping details, and check out faster.
            </p>
          </div>
          <div className="text-xs text-paper/40 uppercase tracking-eyebrow">Lagos &middot; NGN</div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Eyebrow>New account</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold tracking-tightest text-ink">Sign up.</h1>
          <p className="mt-2 text-sm text-ink-2">Takes about a minute.</p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="phone">Phone <span className="text-ink-3 normal-case tracking-normal">(optional)</span></Label>
              <Input id="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} autoComplete="tel" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required autoComplete="new-password" />
              <div className="text-xs text-ink-3 mt-1.5">Min 8 chars, at least one letter and one number.</div>
            </div>
            {error && (
              <div role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}
            <Button type="submit" disabled={busy} className="w-full" size="lg">
              {busy ? 'Creating...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-rule text-sm text-ink-2 text-center">
            Already have an account? <Link href="/login" className="text-ink font-medium hover:text-gold transition-colors duration-150">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
