'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiRequestPaginated } from '@/lib/api';
import type { OrderSummary } from '@/lib/types';
import { Card, CardBody, Badge } from '@/components/ui';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatNGN, formatDate } from '@/lib/format';

function OrdersContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: () => apiRequestPaginated<OrderSummary>('/orders', { query: { pageSize: 50 } }),
  });
  if (isLoading) return <div className="text-slate-500">Loading...</div>;
  if (!data || data.data.length === 0) {
    return <div className="text-slate-600">You haven't placed any orders yet.</div>;
  }
  return (
    <div className="space-y-3">
      {data.data.map((o) => (
        <Link key={o.id} href={`/orders/${o.id}`}>
          <Card className="hover:shadow-md transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs text-slate-500">Order ID</div>
                  <div className="font-mono text-sm">{o.id.slice(0, 8)}...</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Placed</div>
                  <div className="text-sm">{formatDate(o.createdAt)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Items</div>
                  <div className="text-sm">{o.itemCount}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Total</div>
                  <div className="font-semibold">{formatNGN(o.grandTotal)}</div>
                </div>
                <Badge value={o.status} />
              </div>
            </CardBody>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute allowRoles={['CUSTOMER']}>
      <h1 className="text-2xl font-semibold mb-4">My orders</h1>
      <OrdersContent />
    </ProtectedRoute>
  );
}
