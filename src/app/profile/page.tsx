'use client';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { User } from '@/lib/types';
import { Card, CardBody, CardHeader, Label } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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
    <div className="max-w-lg">
      <Card>
        <CardHeader><h2 className="font-semibold">My profile</h2></CardHeader>
        <CardBody>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setFeedback(null); update.mutate(); }}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={me?.email || ''} disabled />
              <div className="text-xs text-slate-500 mt-1">Email cannot be changed here.</div>
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
            <div>
              <Label>Role</Label>
              <div className="text-sm text-slate-700">{me?.role}</div>
            </div>
            {feedback && <div className="text-sm bg-slate-100 rounded p-2">{feedback}</div>}
            <Button type="submit" disabled={update.isPending}>{update.isPending ? 'Saving...' : 'Save changes'}</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      <ProfileContent />
    </ProtectedRoute>
  );
}
