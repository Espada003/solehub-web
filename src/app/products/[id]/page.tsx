'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import type { Product, ProductVariant } from '@/lib/types';
import { Eyebrow, Label } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/Container';
import { formatNGN } from '@/lib/format';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/cn';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiRequest<Product>(`/products/${id}`, { auth: false }),
  });

  const addToCart = useMutation({
    mutationFn: () => {
      const body: any = { productId: id, quantity: qty };
      if (selectedVariantId) body.variantId = selectedVariantId;
      return apiRequest('/cart/items', { method: 'POST', body });
    },
    onSuccess: () => {
      setFeedback(`Added ${qty} to cart.`);
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (e: any) => setFeedback(e?.message || 'Failed to add to cart'),
  });

  if (isLoading) return (
    <Container>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-rule/30 rounded-lg animate-pulse" />
        <div className="space-y-4">
          <div className="h-3 w-32 bg-rule/30 rounded animate-pulse" />
          <div className="h-10 w-3/4 bg-rule/30 rounded animate-pulse" />
          <div className="h-4 w-full bg-rule/30 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-rule/30 rounded animate-pulse" />
        </div>
      </div>
    </Container>
  );
  if (error || !product) return (
    <Container>
      <div className="text-center py-20">
        <Eyebrow className="mb-2">404</Eyebrow>
        <div className="text-ink font-medium">Product not found.</div>
      </div>
    </Container>
  );

  const isShoe = product.category === 'SHOES';
  const hasVariants = product.hasVariants && (product.variants?.length ?? 0) > 0;
  const aggregateAvailable = product.aggregateStock ?? 0;
  const canPurchase = isShoe ? hasVariants && aggregateAvailable > 0 : product.inStock;

  const onAdd = () => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'CUSTOMER') { setFeedback('Only customers can add items to the cart.'); return; }
    if (isShoe && !selectedVariantId) { setFeedback('Please choose a size first.'); return; }
    setFeedback(null);
    addToCart.mutate();
  };

  return (
    <Container>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        <div>
          <div className="aspect-square bg-gold-tint/40 rounded-lg overflow-hidden border border-rule">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-3 text-sm">No image</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Eyebrow>{product.brand} &middot; {product.category} &middot; {product.gender}</Eyebrow>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tightest text-ink leading-[1.1]">
              {product.name}
            </h1>
          </div>

          <div className="text-3xl font-bold tracking-tight text-ink tabular">
            {formatNGN(product.price)}
          </div>

          <p className="text-ink-2 leading-relaxed whitespace-pre-line">{product.description}</p>

          <div className="pt-2">
            {canPurchase ? (
              <div className="inline-flex items-center gap-2 text-xs text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span className="uppercase tracking-wider">
                  {isShoe ? `In stock across ${product.variants?.filter(v => v.inStock).length} size${(product.variants?.filter(v => v.inStock).length ?? 0) === 1 ? '' : 's'}` : 'In stock'}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-xs text-red-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span className="uppercase tracking-wider">
                  {isShoe && !hasVariants ? 'No sizes available' : 'Out of stock'}
                </span>
              </div>
            )}
          </div>

          {/* Size selector — shoes only */}
          {isShoe && hasVariants && (
            <div className="border-t border-rule pt-6">
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="size-selector" className="mb-0">Select size</Label>
                <span className="text-xs text-ink-3">EU sizes</span>
              </div>
              <div id="size-selector" className="grid grid-cols-5 gap-2">
                {product.variants!.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    id={`size-${v.size}`}
                    disabled={!v.inStock}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={cn(
                      'py-2.5 text-sm font-medium rounded-md border transition-all duration-150 ease-smooth',
                      'focus:outline-none focus:border-ink focus:ring-0',
                      selectedVariantId === v.id
                        ? 'bg-ink text-paper border-ink'
                        : 'bg-paper text-ink border-rule hover:border-ink',
                      !v.inStock && 'opacity-40 cursor-not-allowed line-through hover:border-rule',
                    )}
                    aria-label={`Size ${v.size}${!v.inStock ? ' (out of stock)' : ''}`}
                    aria-pressed={selectedVariantId === v.id}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
              {selectedVariantId && (
                <div className="mt-3 text-xs text-ink-2">
                  Size {product.variants?.find(v => v.id === selectedVariantId)?.size} selected.
                </div>
              )}
            </div>
          )}

          <div className="border-t border-rule pt-6 space-y-4">
            <div className="flex items-end gap-3">
              <div className="w-28">
                <Label htmlFor="qty">Quantity</Label>
                <Input id="qty" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
              </div>
              <Button
                onClick={onAdd}
                disabled={!canPurchase || addToCart.isPending || (isShoe && !selectedVariantId)}
                size="lg"
                className="flex-1 max-w-xs"
              >
                {addToCart.isPending ? 'Adding...' : (isShoe && !selectedVariantId ? 'Choose a size' : 'Add to cart')}
              </Button>
            </div>

            {feedback && (
              <div role="status" className="text-sm text-ink-2 bg-gold-tint/40 border border-gold/20 rounded-md p-3">
                {feedback}
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
