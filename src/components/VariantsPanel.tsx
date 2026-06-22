'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { AdminVariant } from '@/lib/types';
import { Card, CardBody, CardHeader, Label, Eyebrow } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface NewVariantForm {
  size: string;
  sku: string;
  stockCount: string;
  lowStockThreshold: string;
}

const emptyForm: NewVariantForm = { size: '', sku: '', stockCount: '0', lowStockThreshold: '5' };

/**
 * Variants management panel for a single SHOES product.
 * Lists variants, allows add/edit/delete and per-variant restock.
 */
export function VariantsPanel({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<NewVariantForm>(emptyForm);
  const [restockMap, setRestockMap] = useState<Record<string, string>>({});
  const [stockEditMap, setStockEditMap] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const { data: variants, isLoading } = useQuery({
    queryKey: ['admin', 'variants', productId],
    queryFn: () =>
      apiRequest<{ data: AdminVariant[] }>(`/admin/products/${productId}/variants`)
        .then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: () => {
      const body: any = {
        size: form.size.trim(),
        stockCount: Number(form.stockCount),
        lowStockThreshold: Number(form.lowStockThreshold),
      };
      if (form.sku.trim()) body.sku = form.sku.trim();
      return apiRequest(`/admin/products/${productId}/variants`, { method: 'POST', body });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'variants', productId] });
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      setShowCreate(false);
      setForm(emptyForm);
    },
    onError: (e: any) => setError(e?.message || 'Failed to create variant'),
  });

  const updateStock = useMutation({
    mutationFn: ({ variantId, stockCount }: { variantId: string; stockCount: number }) =>
      apiRequest(`/admin/products/${productId}/variants/${variantId}`, {
        method: 'PATCH',
        body: { stockCount },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'variants', productId] }),
  });

  const del = useMutation({
    mutationFn: (variantId: string) =>
      apiRequest(`/admin/products/${productId}/variants/${variantId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'variants', productId] }),
    onError: (e: any) => setError(e?.message || 'Failed to delete variant'),
  });

  const restock = useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string; quantity: number }) =>
      apiRequest(`/admin/products/${productId}/variants/${variantId}/restock`, {
        method: 'POST',
        body: { quantity, reason: 'Restock via admin UI' },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'variants', productId] });
      setRestockMap({});
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Eyebrow>Variants</Eyebrow>
            <div className="text-lg font-semibold mt-1 tracking-tight">Sizes &amp; stock per size</div>
          </div>
          <Button size="sm" onClick={() => { setShowCreate(!showCreate); setError(null); }}>
            {showCreate ? 'Close form' : 'Add variant'}
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {showCreate && (
          <div className="mb-6 p-4 border border-rule rounded-md bg-paper">
            <form
              className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
              onSubmit={(e) => { e.preventDefault(); setError(null); create.mutate(); }}
            >
              <div>
                <Label htmlFor="v-size">Size</Label>
                <Input id="v-size" placeholder="42" value={form.size}
                       onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="v-sku">SKU <span className="text-ink-3 normal-case tracking-normal">(optional)</span></Label>
                <Input id="v-sku" placeholder="Auto-generated if blank" value={form.sku}
                       onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="v-stock">Initial stock</Label>
                <Input id="v-stock" type="number" min={0} value={form.stockCount}
                       onChange={(e) => setForm((f) => ({ ...f, stockCount: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="v-threshold">Low-stock threshold</Label>
                <Input id="v-threshold" type="number" min={0} value={form.lowStockThreshold}
                       onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))} />
              </div>
              <div className="md:col-span-5">
                <Button type="submit" size="sm" disabled={create.isPending}>
                  {create.isPending ? 'Adding...' : 'Add variant'}
                </Button>
              </div>
              {error && (
                <div role="alert" className="md:col-span-5 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-ink-2 text-sm">Loading variants...</div>
        ) : !variants || variants.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-rule rounded-md">
            <div className="text-ink font-medium text-sm">No variants yet.</div>
            <div className="text-ink-2 text-xs mt-1">This shoe has no sizes — add at least one to make it purchasable.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-ink-3">
                <tr>
                  <th className="py-2 font-medium text-[11px] uppercase tracking-eyebrow">Size</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">SKU</th>
                  <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Stock</th>
                  <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Threshold</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Restock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => {
                  const isLow = v.stockCount <= v.lowStockThreshold;
                  return (
                    <tr key={v.id} className="border-t border-rule">
                      <td className="py-3 text-ink font-medium">{v.size}</td>
                      <td className="text-ink-3 text-xs font-mono">{v.sku}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Input
                            id={`v-stock-${v.id}`}
                            type="number"
                            min={0}
                            className="w-20 text-right"
                            value={stockEditMap[v.id] ?? String(v.stockCount)}
                            onChange={(e) => setStockEditMap((m) => ({ ...m, [v.id]: e.target.value }))}
                            onBlur={() => {
                              const newVal = Number(stockEditMap[v.id]);
                              if (Number.isFinite(newVal) && newVal !== v.stockCount && newVal >= 0) {
                                updateStock.mutate({ variantId: v.id, stockCount: newVal });
                              }
                            }}
                          />
                          {isLow && <span className="text-[10px] uppercase tracking-wider text-red-700">Low</span>}
                        </div>
                      </td>
                      <td className="text-right tabular text-ink-2">{v.lowStockThreshold}</td>
                      <td className="flex items-center gap-2 py-3">
                        <Input
                          id={`v-restock-${v.id}`}
                          type="number"
                          min={1}
                          className="w-20"
                          placeholder="Qty"
                          value={restockMap[v.id] ?? ''}
                          onChange={(e) => setRestockMap((m) => ({ ...m, [v.id]: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          disabled={restock.isPending}
                          onClick={() => {
                            const q = Number(restockMap[v.id]);
                            if (q > 0) restock.mutate({ variantId: v.id, quantity: q });
                          }}
                        >
                          Restock
                        </Button>
                      </td>
                      <td className="text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Delete size ${v.size}? This cannot be undone if no orders reference it.`)) {
                              setError(null);
                              del.mutate(v.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(del.isError || updateStock.isError || restock.isError) && error && (
              <div role="alert" className="mt-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}