'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiRequestPaginated } from '@/lib/api';
import type { OrderSummary } from '@/lib/types';
import { Card, CardBody, Badge, Eyebrow, DisplayHeading } from '@/components/ui';
import { Container } from '@/components/Container';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatNGN, formatDate } from '@/lib/format';

function OrdersContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: () => apiRequestPaginated<OrderSummary>('/orders', { query: { pageSize: 50 } }),
  });
  if (isLoading) return <div className="text-ink-2">Loading...</div>;
  if (!data || data.data.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-rule rounded-lg">
        <Eyebrow className="mb-2">No history</Eyebrow>
        <div className="text-ink font-medium">You haven't placed any orders yet.</div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {data.data.map((o) => (
        <Link key={o.id} href={`/orders/${o.id}`}>
          <Card className="hover:shadow-soft hover:border-ink/30">
            <CardBody>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-[11px] uppercase tracking-eyebrow text-ink-3">Order</div>
                  <div className="font-mono text-sm text-ink">{o.id.slice(0, 8)}...</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-eyebrow text-ink-3">Placed</div>
                  <div className="text-sm text-ink">{formatDate(o.createdAt)}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-eyebrow text-ink-3">Items</div>
                  <div className="text-sm text-ink tabular">{o.itemCount}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-eyebrow text-ink-3">Total</div>
                  <div className="font-semibold text-ink tabular">{formatNGN(o.grandTotal)}</div>
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
      <Container>
        <div className="mb-8">
          <Eyebrow>History</Eyebrow>
          <DisplayHeading as="h1" text="My orders." accent="orders" className="mt-3 text-4xl text-ink" />
        </div>
        <OrdersContent />
      </Container>
    </ProtectedRoute>
  );
}
