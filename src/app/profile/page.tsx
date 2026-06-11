'use client';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { User } from '@/lib/types';
import { Card, CardBody, CardHeader, Label, Eyebrow, DisplayHeading } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/Container';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';

function ProfileContent() {
  const qc = useQueryClient();
  const { setUser } = useAuth();
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => apiRequest<User>('/me') });
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (me) setForm({ firstName: me.firstName, lastName: me.lastName, phone: me.phone || '' });
  }, [me]);

  const update = useMutation({
    mutationFn: () => apiRequest<User>('/me', {
      method: 'PATCH',
      body: { firstName: form.firstName, lastName: form.lastName, phone: form.phone || undefined },
    }),
    onSuccess: (user) => {
      setUser(user);
      qc.invalidateQueries({ queryKey: ['me'] });
      setFeedback('Profile updated.');
    },
    onError: (e: any) => setFeedback(e?.message || 'Update failed'),
  });

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader>
          <Eyebrow>Profile</Eyebrow>
          <div className="text-lg font-semibold mt-1 tracking-tight">Personal details</div>
        </CardHeader>
        <CardBody>
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setFeedback(null); update.mutate(); }}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={me?.email || ''} disabled />
              <div className="text-xs text-ink-3 mt-1.5">Email cannot be changed here.</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} required />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="pt-2 border-t border-rule">
              <Label>Role</Label>
              <div className="text-sm text-ink uppercase tracking-wider">{me?.role}</div>
            </div>
            {feedback && (
              <div role="status" className="text-sm bg-gold-tint/50 border border-gold/30 rounded-md p-3 text-ink">
                {feedback}
              </div>
            )}
            <Button type="submit" disabled={update.isPending} size="lg">{update.isPending ? 'Saving...' : 'Save changes'}</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Container>
        <div className="mb-8">
          <Eyebrow>Account</Eyebrow>
          <DisplayHeading as="h1" text="My profile." accent="profile" className="mt-3 text-4xl text-ink" />
        </div>
        <ProfileContent />
      </Container>
    </ProtectedRoute>
  );
}
