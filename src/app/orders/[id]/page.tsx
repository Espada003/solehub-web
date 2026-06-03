'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { Order } from '@/lib/types';
import { Card, CardBody, CardHeader, Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
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

  if (isLoading) return <div className="text-slate-500">Loading...</div>;
  if (error || !order) {
    return (
      <div className="space-y-3">
        <div className="text-red-700">Order not found.</div>
        <Button variant="outline" onClick={() => router.push('/orders')}>Back to orders</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs text-slate-500">Order ID</div>
          <div className="font-mono">{order.id}</div>
        </div>
        <Badge value={order.status} className="text-sm" />
      </div>

      {order.status === 'PENDING_PAYMENT' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardBody className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-amber-900 text-sm">
              This order is awaiting payment. Click <strong>Pay now</strong> to confirm it and decrement stock.
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

      {pay.isError && <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{(pay.error as any)?.message || 'Payment failed'}</div>}
      {cancel.isError && <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{(cancel.error as any)?.message || 'Cancel failed'}</div>}

      <Card>
        <CardHeader><h2 className="font-semibold">Items</h2></CardHeader>
        <CardBody>
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Product</th>
                <th className="text-right">Unit price</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((it) => (
                <tr key={it.productId} className="border-t">
                  <td className="py-2">{it.name}</td>
                  <td className="text-right">{formatNGN(it.unitPrice)}</td>
                  <td className="text-right">{it.quantity}</td>
                  <td className="text-right">{formatNGN(it.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="font-semibold">Shipping address</h2></CardHeader>
          <CardBody className="text-sm text-slate-700 space-y-1">
            {order.shippingAddress ? (
              <>
                <div>{order.shippingAddress.line1}</div>
                {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                {order.shippingAddress.postalCode && <div>{order.shippingAddress.postalCode}</div>}
                <div>{order.shippingAddress.country}</div>
                <div className="pt-2">Phone: {order.shippingAddress.phone}</div>
              </>
            ) : <div className="text-slate-500">No address on file.</div>}
          </CardBody>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Totals</h2></CardHeader>
          <CardBody className="text-sm space-y-2">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatNGN(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatNGN(order.tax)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{formatNGN(order.shipping)}</span></div>
            <div className="border-t pt-2 flex justify-between font-semibold text-base"><span>Grand total</span><span>{formatNGN(order.grandTotal)}</span></div>
            <div className="text-xs text-slate-500 pt-2">
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
      <OrderDetail />
    </ProtectedRoute>
  );
}
