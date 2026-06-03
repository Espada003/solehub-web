'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import type { Cart } from '@/lib/types';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatNGN } from '@/lib/format';

function CartContent() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => apiRequest<Cart>('/cart'),
  });

  const update = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      apiRequest(`/cart/items/${productId}`, { method: 'PATCH', body: { quantity } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  const remove = useMutation({
    mutationFn: ({ productId }: { productId: string }) =>
      apiRequest(`/cart/items/${productId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  if (isLoading) return <div className="text-slate-500">Loading...</div>;
  if (!data || data.items.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <div className="text-slate-700 mb-4">Your cart is empty.</div>
          <Link href="/products"><Button>Browse products</Button></Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-3">
        {data.items.map((line) => (
          <Card key={line.productId}>
            <CardBody>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded flex-shrink-0 overflow-hidden">
                  {line.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={line.imageUrl} alt={line.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{line.name}</div>
                  <div className="text-xs text-slate-500">{line.brand}</div>
                  <div className="text-sm text-slate-700 mt-1">{formatNGN(line.unitPrice)} each</div>
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    min={1}
                    max={line.stockCount}
                    value={line.quantity}
                    onChange={(e) => {
                      const q = Math.max(1, Number(e.target.value) || 1);
                      update.mutate({ productId: line.productId, quantity: q });
                    }}
                  />
                </div>
                <div className="text-right w-28 font-semibold text-slate-900">{formatNGN(line.lineTotal)}</div>
                <Button variant="ghost" size="sm" onClick={() => remove.mutate({ productId: line.productId })}>Remove</Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      <div>
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Order summary</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatNGN(data.subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span>Tax</span><span>{formatNGN(data.tax)}</span></div>
            <div className="flex justify-between text-sm"><span>Shipping</span><span>{formatNGN(data.shipping)}</span></div>
            <div className="border-t pt-2 flex justify-between font-semibold text-base"><span>Total</span><span>{formatNGN(data.grandTotal)}</span></div>
            <Link href="/checkout" className="block"><Button className="w-full mt-3">Proceed to checkout</Button></Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute allowRoles={['CUSTOMER']}>
      <h1 className="text-2xl font-semibold mb-4">Your cart</h1>
      <CartContent />
    </ProtectedRoute>
  );
}
