'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import type { Product } from '@/lib/types';
import { Card, CardBody, Label } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatNGN } from '@/lib/format';
import { useAuth } from '@/components/AuthProvider';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiRequest<Product>(`/products/${id}`, { auth: false }),
  });

  const addToCart = useMutation({
    mutationFn: () => apiRequest('/cart/items', { method: 'POST', body: { productId: id, quantity: qty } }),
    onSuccess: () => {
      setFeedback(`Added ${qty} to cart.`);
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (e: any) => setFeedback(e?.message || 'Failed to add to cart'),
  });

  if (isLoading) return <div className="text-slate-500">Loading...</div>;
  if (error || !product) return <div className="text-red-600">Product not found.</div>;

  const onAdd = () => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'CUSTOMER') { setFeedback('Only customers can add items to the cart.'); return; }
    addToCart.mutate();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardBody>
          <div className="aspect-square bg-slate-100 rounded flex items-center justify-center text-slate-400 overflow-hidden">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span>No image</span>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="space-y-4">
        <div className="text-sm text-slate-500">{product.brand} &middot; {product.category} &middot; {product.gender}</div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-slate-700 whitespace-pre-line">{product.description}</p>
        <div className="text-3xl font-bold text-brand-700">{formatNGN(product.price)}</div>

        {product.inStock ? (
          <div className="text-green-700 text-sm">In stock</div>
        ) : (
          <div className="text-red-600 text-sm">Out of stock</div>
        )}

        <div className="flex items-end gap-3">
          <div className="w-24">
            <Label htmlFor="qty">Quantity</Label>
            <Input id="qty" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
          </div>
          <Button onClick={onAdd} disabled={!product.inStock || addToCart.isPending}>
            {addToCart.isPending ? 'Adding...' : 'Add to cart'}
          </Button>
        </div>

        {feedback && <div className="text-sm text-slate-700 bg-slate-100 rounded p-2">{feedback}</div>}
      </div>
    </div>
  );
}
