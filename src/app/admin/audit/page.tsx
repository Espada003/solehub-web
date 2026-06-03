'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequestPaginated } from '@/lib/api';
import type { AuditEntry } from '@/lib/types';
import { Card, CardBody, CardHeader, Label } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatDate } from '@/lib/format';

function AdminAuditContent() {
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit', { action, entityType }],
    queryFn: () => apiRequestPaginated<AuditEntry>('/admin/audit', {
      query: { pageSize: 50, action: action || undefined, entityType: entityType || undefined },
    }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Audit log</h1>
      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <Label>Filter by action</Label>
              <Input placeholder="e.g. USER_DEACTIVATE" value={action} onChange={(e) => setAction(e.target.value)} />
            </div>
            <div>
              <Label>Filter by entity type</Label>
              <Input placeholder="e.g. User, Order" value={entityType} onChange={(e) => setEntityType(e.target.value)} />
            </div>
            <Button variant="outline" onClick={() => { setAction(''); setEntityType(''); }}>Clear filters</Button>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          {isLoading ? 'Loading...' : data && data.data.length === 0 ? (
            <div className="text-slate-500 py-4">No audit entries match.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2">When</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Before</th>
                  <th>After</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((e) => (
                  <tr key={e.id} className="border-t align-top">
                    <td className="py-2 whitespace-nowrap">{formatDate(e.createdAt)}</td>
                    <td className="text-xs">{e.actorEmail || e.actorUserId?.slice(0, 8) || 'system'}</td>
                    <td className="font-mono text-xs">{e.action}</td>
                    <td className="text-xs">{e.entityType}<br/><span className="text-slate-400">{e.entityId?.slice(0, 8)}</span></td>
                    <td className="text-xs font-mono text-slate-600">{e.before ? JSON.stringify(e.before) : '—'}</td>
                    <td className="text-xs font-mono text-slate-600">{e.after ? JSON.stringify(e.after) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function AdminAuditPage() {
  return (
    <ProtectedRoute allowRoles={['SUPER_ADMIN']}>
      <AdminAuditContent />
    </ProtectedRoute>
  );
}
