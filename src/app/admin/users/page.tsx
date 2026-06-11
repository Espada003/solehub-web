'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequestPaginated, apiRequest } from '@/lib/api';
import type { User } from '@/lib/types';
import { Card, CardBody, CardHeader, Label, Select, Eyebrow, DisplayHeading } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/Container';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function AdminUsersContent() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'STAFF' });
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiRequestPaginated<User>('/admin/users', { query: { pageSize: 100 } }),
  });

  const create = useMutation({
    mutationFn: () => apiRequest('/admin/users', { method: 'POST', body: form }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setShowCreate(false);
      setForm({ email: '', password: '', firstName: '', lastName: '', role: 'STAFF' });
    },
    onError: (e: any) => setError(e?.message || 'Failed to create user'),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest(`/admin/users/${id}/status`, { method: 'PATCH', body: { isActive } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const setRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiRequest(`/admin/users/${id}/role`, { method: 'PATCH', body: { role } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <Eyebrow>Access control</Eyebrow>
          <DisplayHeading as="h1" text="Users." accent="Users" className="mt-3 text-4xl text-ink" />
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>{showCreate ? 'Close form' : 'New user'}</Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <Eyebrow>New</Eyebrow>
            <div className="text-lg font-semibold mt-1 tracking-tight">Create internal user</div>
          </CardHeader>
          <CardBody>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); setError(null); create.mutate(); }}>
              <div>
                <Label htmlFor="u-email">Email</Label>
                <Input id="u-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="u-password">Password (initial)</Label>
                <Input id="u-password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="u-first">First name</Label>
                <Input id="u-first" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="u-last">Last name</Label>
                <Input id="u-last" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="u-role">Role</Label>
                <Select id="u-role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                  <option value="STAFF">Staff</option>
                  <option value="ACCOUNTANT">Accountant</option>
                </Select>
              </div>
              {error && (
                <div role="alert" className="md:col-span-2 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>
              )}
              <div className="md:col-span-2">
                <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Creating...' : 'Create user'}</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {isLoading ? <div className="text-ink-2">Loading...</div> : (
        <Card>
          <CardBody className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-ink-3">
                <tr>
                  <th className="py-2 font-medium text-[11px] uppercase tracking-eyebrow">Name</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Email</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Role</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Status</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((u) => (
                  <tr key={u.id} className="border-t border-rule">
                    <td className="py-3 text-ink">{u.firstName} {u.lastName}</td>
                    <td className="text-ink-2">{u.email}</td>
                    <td>
                      <Select className="w-36" value={u.role}
                              onChange={(e) => setRole.mutate({ id: u.id, role: e.target.value })}
                              disabled={u.role === 'SUPER_ADMIN' || u.role === 'CUSTOMER'}>
                        <option value="STAFF">Staff</option>
                        <option value="ACCOUNTANT">Accountant</option>
                        {u.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                        {u.role === 'CUSTOMER' && <option value="CUSTOMER">Customer</option>}
                      </Select>
                    </td>
                    <td>
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span className="uppercase tracking-wider">Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          <span className="uppercase tracking-wider">Disabled</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <Button size="sm" variant={u.isActive ? 'outline' : 'primary'}
                              onClick={() => setStatus.mutate({ id: u.id, isActive: !u.isActive })}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowRoles={['SUPER_ADMIN']}>
      <Container>
        <AdminUsersContent />
      </Container>
    </ProtectedRoute>
  );
}
