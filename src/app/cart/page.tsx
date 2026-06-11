'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import type { Cart } from '@/lib/types';
import { Card, CardBody, CardHeader, Eyebrow, DisplayHeading } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Container } from '@/components/Container';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatNGN } from '@/lib/format';

function CartContent() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['cart'], queryFn: () => apiRequest<Cart>('/cart') });

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

  if (isLoading) return <div className="text-ink-2">Loading...</div>;
  if (!data || data.items.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-rule rounded-lg">
        <Eyebrow className="mb-2">Empty</Eyebrow>
        <div className="text-ink font-medium mb-1">Your cart is empty.</div>
        <div className="text-ink-2 text-sm mb-6">Find something you like.</div>
        <Link href="/products"><Button>Browse products</Button></Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-3">
        {data.items.map((line) => (
          <Card key={line.productId}>
            <CardBody>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gold-tint/40 rounded-md flex-shrink-0 overflow-hidden border border-rule">
                  {line.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={line.imageUrl} alt={line.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink truncate">{line.name}</div>
                  <div className="text-[11px] uppercase tracking-eyebrow text-ink-3 mt-0.5">{line.brand}</div>
                  <div className="text-sm text-ink-2 mt-1 tabular">{formatNGN(line.unitPrice)} each</div>
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
                <div className="text-right w-28 font-semibold text-ink tabular">{formatNGN(line.lineTotal)}</div>
                <Button variant="ghost" size="sm" onClick={() => remove.mutate({ productId: line.productId })}>Remove</Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      <div>
        <Card>
          <CardHeader>
            <Eyebrow>Summary</Eyebrow>
            <div className="text-lg font-semibold mt-1 tracking-tight">Order total</div>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex justify-between text-sm text-ink-2"><span>Subtotal</span><span className="tabular text-ink">{formatNGN(data.subtotal)}</span></div>
            <div className="flex justify-between text-sm text-ink-2"><span>Tax</span><span className="tabular text-ink">{formatNGN(data.tax)}</span></div>
            <div className="flex justify-between text-sm text-ink-2"><span>Shipping</span><span className="tabular text-ink">{formatNGN(data.shipping)}</span></div>
            <div className="border-t border-rule pt-3 flex justify-between text-base font-semibold"><span>Total</span><span className="tabular">{formatNGN(data.grandTotal)}</span></div>
            <Link href="/checkout" className="block"><Button className="w-full mt-3" size="lg">Proceed to checkout</Button></Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute allowRoles={['CUSTOMER']}>
      <Container>
        <div className="mb-8">
          <Eyebrow>Cart</Eyebrow>
          <DisplayHeading as="h1" text="Your selection." accent="selection" className="mt-3 text-4xl text-ink" />
        </div>
        <CartContent />
      </Container>
    </ProtectedRoute>
  );
}
