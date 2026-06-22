'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequestPaginated, apiRequest } from '@/lib/api';
import type { Product } from '@/lib/types';
import { Card, CardBody, CardHeader, Label, Select, Eyebrow, DisplayHeading } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/Container';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { VariantsPanel } from '@/components/VariantsPanel';
import { formatNGN } from '@/lib/format';

interface ProductForm {
  name: string; description: string; price: string; costPrice: string;
  gender: string; category: string; brand: string;
  stockCount: string; lowStockThreshold: string;
}

const empty: ProductForm = {
  name: '', description: '', price: '', costPrice: '',
  gender: 'UNISEX', category: 'SHOES', brand: '',
  stockCount: '0', lowStockThreshold: '5',
};

function AdminProductsContent() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(empty);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => apiRequestPaginated<Product>('/products', { query: { pageSize: 100 } }),
  });

  const submit = useMutation({
    mutationFn: () => {
      const body = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        costPrice: Number(form.costPrice),
        gender: form.gender,
        category: form.category,
        brand: form.brand,
        stockCount: Number(form.stockCount),
        lowStockThreshold: Number(form.lowStockThreshold),
      };
      if (editId) return apiRequest(`/admin/products/${editId}`, { method: 'PATCH', body });
      return apiRequest('/admin/products', { method: 'POST', body });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      setShowCreate(false); setEditId(null); setForm(empty);
    },
    onError: (e: any) => setError(e?.message || 'Failed to save'),
  });

  const del = useMutation({
    mutationFn: (id: string) => apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });

  const startEdit = (p: Product) => {
    setEditId(p.id);
    setShowCreate(true);
    setForm({
      name: p.name, description: p.description, price: p.price,
      costPrice: '0', gender: p.gender, category: p.category, brand: p.brand,
      stockCount: String(p.stockCount ?? 0),
      lowStockThreshold: String(p.lowStockThreshold ?? 5),
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <Eyebrow>Catalogue</Eyebrow>
          <DisplayHeading as="h1" text="Manage products." accent="products" className="mt-3 text-4xl text-ink" />
        </div>
        <Button onClick={() => { setEditId(null); setForm(empty); setShowCreate(!showCreate); }}>
          {showCreate ? 'Close form' : 'New product'}
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <Eyebrow>{editId ? 'Edit' : 'New'}</Eyebrow>
            <div className="text-lg font-semibold mt-1 tracking-tight">{editId ? 'Edit product' : 'Create product'}</div>
          </CardHeader>
          <CardBody>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); setError(null); submit.mutate(); }}>
              <div className="md:col-span-2">
                <Label htmlFor="p-name">Name</Label>
                <Input id="p-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="p-description">Description</Label>
                <Input id="p-description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="p-price">Price (NGN)</Label>
                <Input id="p-price" type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="p-cost">Cost price (NGN)</Label>
                <Input id="p-cost" type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="p-brand">Brand</Label>
                <Input id="p-brand" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="p-gender">Gender</Label>
                <Select id="p-gender" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="UNISEX">Unisex</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="p-category">Category</Label>
                <Select id="p-category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  <option value="SHOES">Shoes</option>
                  <option value="LACES">Laces</option>
                  <option value="POLISH">Polish</option>
                  <option value="SOCKS">Socks</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="p-stock">Stock count {form.category === 'SHOES' && <span className="text-ink-3 normal-case tracking-normal">(aggregated from variants)</span>}</Label>
                <Input id="p-stock" type="number" value={form.stockCount} onChange={(e) => setForm((f) => ({ ...f, stockCount: e.target.value }))} disabled={form.category === 'SHOES' && !!editId} />
              </div>
              <div>
                <Label htmlFor="p-threshold">Low-stock threshold</Label>
                <Input id="p-threshold" type="number" value={form.lowStockThreshold} onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))} />
              </div>
              {error && (
                <div role="alert" className="md:col-span-2 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>
              )}
              <div className="md:col-span-2">
                <Button type="submit" disabled={submit.isPending}>
                  {submit.isPending ? 'Saving...' : (editId ? 'Save changes' : 'Create product')}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Variant management — only when editing a shoe */}
      {showCreate && editId && form.category === 'SHOES' && (
        <VariantsPanel productId={editId} />
      )}

      {isLoading ? (
        <div className="text-ink-2">Loading...</div>
      ) : (
        <Card>
          <CardBody className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-ink-3">
                <tr>
                  <th className="py-2 font-medium text-[11px] uppercase tracking-eyebrow">Name</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Brand</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Category</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Gender</th>
                  <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Price</th>
                  <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((p) => (
                  <tr key={p.id} className="border-t border-rule">
                    <td className="py-3 text-ink">{p.name}</td>
                    <td className="text-ink-2">{p.brand}</td>
                    <td className="text-ink-2">{p.category}</td>
                    <td className="text-ink-2">{p.gender}</td>
                    <td className="text-right tabular text-ink">{formatNGN(p.price)}</td>
                    <td className="text-right tabular text-ink-2">{p.stockCount ?? '\u2014'}</td>
                    <td className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(p)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => { if (confirm(`Delete ${p.name}?`)) del.mutate(p.id); }}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <ProtectedRoute allowRoles={['STAFF', 'SUPER_ADMIN']}>
      <Container>
        <AdminProductsContent />
      </Container>
    </ProtectedRoute>
  );
}
