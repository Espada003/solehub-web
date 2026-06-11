'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequestPaginated } from '@/lib/api';
import type { AuditEntry } from '@/lib/types';
import { Card, CardBody, CardHeader, Label, Eyebrow, DisplayHeading } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/Container';
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
    <div className="space-y-8">
      <div>
        <Eyebrow>Compliance</Eyebrow>
        <DisplayHeading as="h1" text="Audit log." accent="log" className="mt-3 text-4xl text-ink" />
      </div>
      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <Label htmlFor="a-action">Filter by action</Label>
              <Input id="a-action" placeholder="e.g. USER_DEACTIVATE" value={action} onChange={(e) => setAction(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="a-entity">Filter by entity type</Label>
              <Input id="a-entity" placeholder="e.g. User, Order" value={entityType} onChange={(e) => setEntityType(e.target.value)} />
            </div>
            <Button variant="outline" onClick={() => { setAction(''); setEntityType(''); }}>Clear filters</Button>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          {isLoading ? <div className="text-ink-2">Loading...</div> : data && data.data.length === 0 ? (
            <div className="text-ink-3 py-4">No audit entries match.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-ink-3">
                <tr>
                  <th className="py-2 font-medium text-[11px] uppercase tracking-eyebrow">When</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Actor</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Action</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Entity</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Before</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">After</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((e) => (
                  <tr key={e.id} className="border-t border-rule align-top">
                    <td className="py-3 whitespace-nowrap text-ink-2 text-xs">{formatDate(e.createdAt)}</td>
                    <td className="text-xs text-ink">{e.actorEmail || e.actorUserId?.slice(0, 8) || 'system'}</td>
                    <td className="font-mono text-xs text-ink">{e.action}</td>
                    <td className="text-xs text-ink-2">{e.entityType}<br/><span className="text-ink-3 font-mono">{e.entityId?.slice(0, 8)}</span></td>
                    <td className="text-xs font-mono text-ink-3 max-w-xs truncate">{e.before ? JSON.stringify(e.before) : '—'}</td>
                    <td className="text-xs font-mono text-ink-3 max-w-xs truncate">{e.after ? JSON.stringify(e.after) : '—'}</td>
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
      <Container>
        <AdminAuditContent />
      </Container>
    </ProtectedRoute>
  );
}
