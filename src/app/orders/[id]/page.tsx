'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { Order } from '@/lib/types';
import { Card, CardBody, CardHeader, Badge, Eyebrow } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/Container';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatNGN, formatDate } from '@/lib/format';

function OrderDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const id = params.id;

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => apiRequest<Order>(`/orders/${id}`),
  });

  const pay = useMutation({
    mutationFn: () => apiRequest<Order>(`/orders/${id}/pay`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const cancel = useMutation({
    mutationFn: () => apiRequest<Order>(`/orders/${id}/cancel`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  if (isLoading) return <div className="text-ink-2">Loading...</div>;
  if (error || !order) {
    return (
      <div className="space-y-4">
        <div className="text-red-700">Order not found.</div>
        <Button variant="outline" onClick={() => router.push('/orders')}>Back to orders</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-rule">
        <div>
          <Eyebrow>Order</Eyebrow>
          <div className="font-mono text-base text-ink mt-1">{order.id}</div>
        </div>
        <Badge value={order.status} className="text-xs" />
      </div>

      {order.status === 'PENDING_PAYMENT' && (
        <Card className="border-gold/30 bg-gold-tint/60">
          <CardBody className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-ink text-sm">
              <strong>Awaiting payment.</strong> Click <em>Pay now</em> to confirm the order and reserve stock.
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => pay.mutate()} disabled={pay.isPending}>
                {pay.isPending ? 'Processing...' : 'Pay now'}
              </Button>
              <Button variant="outline" onClick={() => cancel.mutate()} disabled={cancel.isPending}>
                {cancel.isPending ? 'Cancelling...' : 'Cancel order'}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {pay.isError && (
        <div role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">
          {(pay.error as any)?.message || 'Payment failed'}
        </div>
      )}
      {cancel.isError && (
        <div role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">
          {(cancel.error as any)?.message || 'Cancel failed'}
        </div>
      )}

      <Card>
        <CardHeader>
          <Eyebrow>Items</Eyebrow>
        </CardHeader>
        <CardBody>
          <table className="w-full text-sm">
            <thead className="text-left text-ink-3">
              <tr>
                <th className="py-2 font-medium text-[11px] uppercase tracking-eyebrow">Product</th>
                <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Unit price</th>
                <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Qty</th>
                <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((it) => (
                <tr key={it.productId} className="border-t border-rule">
                  <td className="py-3 text-ink">{it.name}</td>
                  <td className="text-right tabular text-ink-2">{formatNGN(it.unitPrice)}</td>
                  <td className="text-right tabular text-ink-2">{it.quantity}</td>
                  <td className="text-right tabular text-ink font-medium">{formatNGN(it.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><Eyebrow>Shipping</Eyebrow></CardHeader>
          <CardBody className="text-sm text-ink space-y-1.5">
            {order.shippingAddress ? (
              <>
                <div>{order.shippingAddress.line1}</div>
                {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                {order.shippingAddress.postalCode && <div>{order.shippingAddress.postalCode}</div>}
                <div>{order.shippingAddress.country}</div>
                <div className="pt-2 text-ink-2">Phone: {order.shippingAddress.phone}</div>
              </>
            ) : <div className="text-ink-3">No address on file.</div>}
          </CardBody>
        </Card>
        <Card>
          <CardHeader><Eyebrow>Totals</Eyebrow></CardHeader>
          <CardBody className="text-sm space-y-2.5">
            <div className="flex justify-between text-ink-2"><span>Subtotal</span><span className="tabular text-ink">{formatNGN(order.subtotal)}</span></div>
            <div className="flex justify-between text-ink-2"><span>Tax</span><span className="tabular text-ink">{formatNGN(order.tax)}</span></div>
            <div className="flex justify-between text-ink-2"><span>Shipping</span><span className="tabular text-ink">{formatNGN(order.shipping)}</span></div>
            <div className="border-t border-rule pt-3 flex justify-between text-base font-semibold"><span>Grand total</span><span className="tabular">{formatNGN(order.grandTotal)}</span></div>
            <div className="text-xs text-ink-3 pt-2 leading-relaxed">
              Placed: {formatDate(order.createdAt)}
              {order.paidAt && <><br />Paid: {formatDate(order.paidAt)}</>}
              {order.cancelledAt && <><br />Cancelled: {formatDate(order.cancelledAt)}</>}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <Container>
        <OrderDetail />
      </Container>
    </ProtectedRoute>
  );
}
