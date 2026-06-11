'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequestPaginated, apiRequest } from '@/lib/api';
import type { OrderSummary } from '@/lib/types';
import { Card, CardBody, CardHeader, Badge, Label, Select, Eyebrow, DisplayHeading } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/Container';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatNGN, formatDate } from '@/lib/format';
import Link from 'next/link';

const TRANSITION_OPTIONS: Record<string, string[]> = {
  PAID:       ['PROCESSING'],
  PROCESSING: ['SHIPPED'],
  SHIPPED:    ['DELIVERED'],
};

function AdminOrdersContent() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { status }],
    queryFn: () => apiRequestPaginated<OrderSummary>('/admin/orders', { query: { pageSize: 50, status: status || undefined } }),
  });

  const transition = useMutation({
    mutationFn: ({ id, to }: { id: string; to: string }) =>
      apiRequest(`/admin/orders/${id}/transition`, { method: 'POST', body: { to } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  });

  return (
    <div className="space-y-8">
      <div>
        <Eyebrow>Operations</Eyebrow>
        <DisplayHeading as="h1" text="All orders." accent="orders" className="mt-3 text-4xl text-ink" />
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Label htmlFor="status-filter" className="mb-0">Filter by status</Label>
            <Select id="status-filter" value={status} onChange={(e) => setStatus(e.target.value)} className="w-52">
              <option value="">All</option>
              <option value="PENDING_PAYMENT">Pending payment</option>
              <option value="PAID">Paid</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          {isLoading ? <div className="text-ink-2">Loading...</div> : (
            <table className="w-full text-sm">
              <thead className="text-left text-ink-3">
                <tr>
                  <th className="py-2 font-medium text-[11px] uppercase tracking-eyebrow">Order</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Customer</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Placed</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Items</th>
                  <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Total</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Status</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((o) => {
                  const nextStates = TRANSITION_OPTIONS[o.status] || [];
                  return (
                    <tr key={o.id} className="border-t border-rule">
                      <td className="py-3 font-mono text-xs text-ink">{o.id.slice(0, 8)}...</td>
                      <td className="text-ink-2">{o.customerEmail || o.customerId?.slice(0, 8) + '...'}</td>
                      <td className="text-ink-2">{formatDate(o.createdAt)}</td>
                      <td className="text-ink-2 tabular">{o.itemCount}</td>
                      <td className="text-right tabular text-ink font-medium">{formatNGN(o.grandTotal)}</td>
                      <td><Badge value={o.status} /></td>
                      <td className="space-x-2 py-3">
                        <Link href={`/orders/${o.id}`} className="text-ink-2 text-xs hover:text-ink transition-colors duration-150 underline-offset-4 hover:underline">View</Link>
                        {nextStates.map((next) => (
                          <Button key={next} size="sm" variant="outline" disabled={transition.isPending}
                                  onClick={() => transition.mutate({ id: o.id, to: next })}>
                            → {next}
                          </Button>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <ProtectedRoute allowRoles={['STAFF', 'SUPER_ADMIN']}>
      <Container>
        <AdminOrdersContent />
      </Container>
    </ProtectedRoute>
  );
}
