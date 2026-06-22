'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { LowStockRow } from '@/lib/types';
import { Card, CardBody, CardHeader, Eyebrow, DisplayHeading } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/Container';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function AdminInventoryContent() {
  const qc = useQueryClient();
  const [restockMap, setRestockMap] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'inventory', 'low'],
    queryFn: () => apiRequest<LowStockRow[]>('/admin/inventory/low-stock'),
  });

  /** Routes restock to the correct endpoint based on whether the row is a product or variant. */
  const restock = useMutation({
    mutationFn: ({ row, quantity }: { row: LowStockRow; quantity: number }) => {
      if (row.kind === 'variant' && row.variantId) {
        return apiRequest(
          `/admin/products/${row.productId}/variants/${row.variantId}/restock`,
          { method: 'POST', body: { quantity, reason: 'Restock via admin UI' } },
        );
      }
      return apiRequest(`/admin/inventory/${row.productId}/restock`, {
        method: 'POST',
        body: { quantity, reason: 'Restock via admin UI' },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'inventory', 'low'] }),
  });

  return (
    <div className="space-y-8">
      <div>
        <Eyebrow>Operations</Eyebrow>
        <DisplayHeading as="h1" text="Low stock." accent="stock" className="mt-3 text-4xl text-ink" />
      </div>
      <Card>
        <CardHeader>
          <div className="text-sm text-ink-2">
            Products and shoe sizes at or below their low-stock threshold. Restock to update.
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          {isLoading ? <div className="text-ink-2">Loading...</div> : data && data.length === 0 ? (
            <div className="text-ink-2 py-4">No low-stock items. Everything's healthy.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-ink-3">
                <tr>
                  <th className="py-2 font-medium text-[11px] uppercase tracking-eyebrow">Product</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Size</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Brand</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Category</th>
                  <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Current</th>
                  <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Threshold</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Restock</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((row) => (
                  <tr key={row.id} className="border-t border-rule">
                    <td className="py-3 text-ink">{row.name}</td>
                    <td className="text-ink-2">{row.size ?? '\u2014'}</td>
                    <td className="text-ink-2">{row.brand}</td>
                    <td className="text-ink-2">{row.category}</td>
                    <td className="text-right tabular text-red-700 font-medium">{row.stockCount}</td>
                    <td className="text-right tabular text-ink-2">{row.lowStockThreshold}</td>
                    <td className="flex items-center gap-2 py-3">
                      <Input
                        id={`restock-${row.id}`}
                        type="number"
                        className="w-24"
                        placeholder="Qty"
                        value={restockMap[row.id] || ''}
                        onChange={(e) => setRestockMap((m) => ({ ...m, [row.id]: e.target.value }))}
                      />
                      <Button size="sm" disabled={restock.isPending} onClick={() => {
                        const q = Number(restockMap[row.id]);
                        if (q > 0) restock.mutate({ row, quantity: q });
                      }}>
                        Restock
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function AdminInventoryPage() {
  return (
    <ProtectedRoute allowRoles={['STAFF', 'SUPER_ADMIN']}>
      <Container>
        <AdminInventoryContent />
      </Container>
    </ProtectedRoute>
  );
}
