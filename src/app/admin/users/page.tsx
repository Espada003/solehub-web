'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequestPaginated, apiRequest } from '@/lib/api';
import type { User } from '@/lib/types';
import { Card, CardBody, CardHeader, Label, Select } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>{showCreate ? 'Close form' : 'New user'}</Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><h2 className="font-semibold">Create internal user</h2></CardHeader>
          <CardBody>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); setError(null); create.mutate(); }}>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <Label>Password (initial)</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
              </div>
              <div>
                <Label>First name</Label>
                <Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} required />
              </div>
              <div>
                <Label>Last name</Label>
                <Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} required />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                  <option value="STAFF">Staff</option>
                  <option value="ACCOUNTANT">Accountant</option>
                </Select>
              </div>
              {error && <div className="md:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
              <div className="md:col-span-2">
                <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Creating...' : 'Create user'}</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {isLoading ? (
        <div className="text-slate-500">Loading...</div>
      ) : (
        <Card>
          <CardBody className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="py-2">{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td>
                    <td>
                      <Select
                        className="w-36"
                        value={u.role}
                        onChange={(e) => setRole.mutate({ id: u.id, role: e.target.value })}
                        disabled={u.role === 'SUPER_ADMIN' || u.role === 'CUSTOMER'}
                      >
                        <option value="STAFF">Staff</option>
                        <option value="ACCOUNTANT">Accountant</option>
                        {u.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                        {u.role === 'CUSTOMER' && <option value="CUSTOMER">Customer</option>}
                      </Select>
                    </td>
                    <td>{u.isActive ? <span className="text-green-700">Active</span> : <span className="text-red-700">Deactivated</span>}</td>
                    <td>
                      <Button
                        size="sm"
                        variant={u.isActive ? 'outline' : 'primary'}
                        onClick={() => setStatus.mutate({ id: u.id, isActive: !u.isActive })}
                      >
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
      <AdminUsersContent />
    </ProtectedRoute>
  );
}
