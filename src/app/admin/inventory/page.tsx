'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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
        method: 'POST',
        body: { quantity, reason: 'Restock via admin UI' },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'inventory', 'low'] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Inventory: low stock</h1>
      <Card>
        <CardHeader>
          <div className="text-sm text-slate-600">
            Products with stock at or below their low-stock threshold. Restock to update.
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          {isLoading ? (
            <div className="text-slate-500">Loading...</div>
          ) : data && data.length === 0 ? (
            <div className="text-slate-600 py-4">No low-stock items. Everything's healthy.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2">Product</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th className="text-right">Current</th>
                  <th className="text-right">Threshold</th>
                  <th>Restock</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2">{p.name}</td>
                    <td>{p.brand}</td>
                    <td>{p.category}</td>
                    <td className="text-right">{p.stockCount}</td>
                    <td className="text-right">{p.lowStockThreshold}</td>
                    <td className="space-x-2 flex items-center">
                      <Input
                        type="number"
                        className="w-24"
                        placeholder="Qty"
                        value={restockMap[p.id] || ''}
                        onChange={(e) => setRestockMap((m) => ({ ...m, [p.id]: e.target.value }))}
                      />
                      <Button
                        size="sm"
                        disabled={restock.isPending}
                        onClick={() => {
                          const q = Number(restockMap[p.id]);
                          if (q > 0) restock.mutate({ productId: p.id, quantity: q });
                        }}
                      >
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
      <AdminInventoryContent />
    </ProtectedRoute>
  );
}
