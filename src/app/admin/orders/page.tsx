'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequestPaginated, apiRequest } from '@/lib/api';
import type { OrderSummary } from '@/lib/types';
import { Card, CardBody, CardHeader, Badge, Label, Select } from '@/components/ui';
import { Button } from '@/components/ui/Button';
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">All orders</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Label htmlFor="status" className="mb-0">Filter by status</Label>
            <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-48">
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
          {isLoading ? (
            <div className="text-slate-500">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2">Order</th>
                  <th>Customer</th>
                  <th>Placed</th>
                  <th>Items</th>
                  <th className="text-right">Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((o) => {
                  const nextStates = TRANSITION_OPTIONS[o.status] || [];
                  return (
                    <tr key={o.id} className="border-t">
                      <td className="py-2 font-mono">{o.id.slice(0, 8)}...</td>
                      <td>{o.customerEmail || o.customerId?.slice(0, 8) + '...'}</td>
                      <td>{formatDate(o.createdAt)}</td>
                      <td>{o.itemCount}</td>
                      <td className="text-right">{formatNGN(o.grandTotal)}</td>
                      <td><Badge value={o.status} /></td>
                      <td className="space-x-2">
                        <Link href={`/orders/${o.id}`} className="text-brand-600 text-xs hover:underline">View</Link>
                        {nextStates.map((next) => (
                          <Button
                            key={next}
                            size="sm"
                            variant="outline"
                            disabled={transition.isPending}
                            onClick={() => transition.mutate({ id: o.id, to: next })}
                          >
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
      <AdminOrdersContent />
    </ProtectedRoute>
  );
}
