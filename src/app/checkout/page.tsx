'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { Cart, Order, ShippingAddress } from '@/lib/types';
import { Card, CardBody, CardHeader, Label, Eyebrow, DisplayHeading } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/Container';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatNGN } from '@/lib/format';

function CheckoutContent() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: cart } = useQuery({ queryKey: ['cart'], queryFn: () => apiRequest<Cart>('/cart') });
  const [addr, setAddr] = useState<ShippingAddress>({
    line1: '', line2: '', city: '', state: '', country: 'Nigeria', postalCode: '', phone: '',
  });
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => {
      const payload: any = { shippingAddress: { ...addr } };
      if (!payload.shippingAddress.line2) delete payload.shippingAddress.line2;
      if (!payload.shippingAddress.postalCode) delete payload.shippingAddress.postalCode;
      return apiRequest<Order>('/orders', { method: 'POST', body: payload });
    },
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      router.push(`/orders/${order.id}`);
    },
    onError: (e: any) => setError(e?.message || 'Failed to create order'),
  });

  const update = (k: keyof ShippingAddress, v: string) => setAddr((a) => ({ ...a, [k]: v }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <Eyebrow>Step 1</Eyebrow>
            <div className="text-lg font-semibold mt-1 tracking-tight">Where should we ship?</div>
          </CardHeader>
          <CardBody>
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setError(null); create.mutate(); }}>
              <div>
                <Label htmlFor="line1">Address line 1</Label>
                <Input id="line1" value={addr.line1} onChange={(e) => update('line1', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="line2">Address line 2 <span className="text-ink-3 normal-case tracking-normal">(optional)</span></Label>
                <Input id="line2" value={addr.line2 || ''} onChange={(e) => update('line2', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={addr.city} onChange={(e) => update('city', e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={addr.state} onChange={(e) => update('state', e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={addr.country} onChange={(e) => update('country', e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal code <span className="text-ink-3 normal-case tracking-normal">(optional)</span></Label>
                  <Input id="postalCode" value={addr.postalCode || ''} onChange={(e) => update('postalCode', e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={addr.phone} onChange={(e) => update('phone', e.target.value)} required />
              </div>
              {error && (
                <div role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={create.isPending} className="w-full" size="lg">
                {create.isPending ? 'Creating order...' : 'Place order'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <Eyebrow>Summary</Eyebrow>
            <div className="text-lg font-semibold mt-1 tracking-tight">Order total</div>
          </CardHeader>
          <CardBody className="space-y-3">
            {cart ? (
              <>
                <div className="flex justify-between text-sm text-ink-2"><span>Subtotal</span><span className="tabular text-ink">{formatNGN(cart.subtotal)}</span></div>
                <div className="flex justify-between text-sm text-ink-2"><span>Tax</span><span className="tabular text-ink">{formatNGN(cart.tax)}</span></div>
                <div className="flex justify-between text-sm text-ink-2"><span>Shipping</span><span className="tabular text-ink">{formatNGN(cart.shipping)}</span></div>
                <div className="border-t border-rule pt-3 flex justify-between text-base font-semibold"><span>Total</span><span className="tabular">{formatNGN(cart.grandTotal)}</span></div>
              </>
            ) : <div className="text-ink-3 text-sm">Loading cart...</div>}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute allowRoles={['CUSTOMER']}>
      <Container>
        <div className="mb-8">
          <Eyebrow>Checkout</Eyebrow>
          <DisplayHeading as="h1" text="Almost done." accent="done" className="mt-3 text-4xl text-ink" />
        </div>
        <CheckoutContent />
      </Container>
    </ProtectedRoute>
  );
}
