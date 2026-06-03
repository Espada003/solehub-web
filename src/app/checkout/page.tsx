'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { Cart, Order, ShippingAddress } from '@/lib/types';
import { Card, CardBody, CardHeader, Label } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader><h2 className="font-semibold">Shipping address</h2></CardHeader>
          <CardBody>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setError(null); create.mutate(); }}>
              <div>
                <Label htmlFor="line1">Address line 1</Label>
                <Input id="line1" value={addr.line1} onChange={(e) => update('line1', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="line2">Address line 2 (optional)</Label>
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
                  <Label htmlFor="postalCode">Postal code (optional)</Label>
                  <Input id="postalCode" value={addr.postalCode || ''} onChange={(e) => update('postalCode', e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={addr.phone} onChange={(e) => update('phone', e.target.value)} required />
              </div>
              {error && <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
              <Button type="submit" disabled={create.isPending} className="w-full">
                {create.isPending ? 'Creating order...' : 'Place order'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader><h2 className="font-semibold">Order summary</h2></CardHeader>
          <CardBody className="space-y-2">
            {cart ? (
              <>
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatNGN(cart.subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span>Tax</span><span>{formatNGN(cart.tax)}</span></div>
                <div className="flex justify-between text-sm"><span>Shipping</span><span>{formatNGN(cart.shipping)}</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold text-base"><span>Total</span><span>{formatNGN(cart.grandTotal)}</span></div>
              </>
            ) : <div className="text-slate-500 text-sm">Loading cart...</div>}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute allowRoles={['CUSTOMER']}>
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
