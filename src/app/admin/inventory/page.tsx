'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { Card, CardBody, CardHeader, Eyebrow, DisplayHeading } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/Container';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface LowStockItem {
  id: string; name: string; brand: string; category: string;
  stockCount: number; lowStockThreshold: number; lastRestockedAt: string | null;
}

function AdminInventoryContent() {
  const qc = useQueryClient();
  const [restockMap, setRestockMap] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'inventory', 'low'],
    queryFn: () => apiRequest<LowStockItem[]>('/admin/inventory/low-stock'),
  });

  const restock = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      apiRequest(`/admin/inventory/${productId}/restock`, {
        method: 'POST', body: { quantity, reason: 'Restock via admin UI' },
      }),
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
            Products at or below their low-stock threshold. Restock to update.
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
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Brand</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Category</th>
                  <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Current</th>
                  <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Threshold</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Restock</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((p) => (
                  <tr key={p.id} className="border-t border-rule">
                    <td className="py-3 text-ink">{p.name}</td>
                    <td className="text-ink-2">{p.brand}</td>
                    <td className="text-ink-2">{p.category}</td>
                    <td className="text-right tabular text-red-700 font-medium">{p.stockCount}</td>
                    <td className="text-right tabular text-ink-2">{p.lowStockThreshold}</td>
                    <td className="flex items-center gap-2 py-3">
                      <Input
                        id={`restock-${p.id}`}
                        type="number"
                        className="w-24"
                        placeholder="Qty"
                        value={restockMap[p.id] || ''}
                        onChange={(e) => setRestockMap((m) => ({ ...m, [p.id]: e.target.value }))}
                      />
                      <Button size="sm" disabled={restock.isPending} onClick={() => {
                        const q = Number(restockMap[p.id]);
                        if (q > 0) restock.mutate({ productId: p.id, quantity: q });
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
