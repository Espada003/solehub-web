'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequestPaginated } from '@/lib/api';
import type { Product } from '@/lib/types';
import { Card, CardBody, Label, Select } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatNGN } from '@/lib/format';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState('');
  const [gender, setGender] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { search: searchSubmitted, gender, category, sortBy, page }],
    queryFn: () =>
      apiRequestPaginated<Product>('/products', {
        query: {
          page,
          pageSize: 12,
          search: searchSubmitted || undefined,
          gender: gender || undefined,
          category: category || undefined,
          sortBy,
        },
        auth: false,
      }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Products</h1>

      <Card>
        <CardBody>
          <form
            className="grid grid-cols-1 md:grid-cols-5 gap-3"
            onSubmit={(e) => { e.preventDefault(); setPage(1); setSearchSubmitted(search); }}
          >
            <div className="md:col-span-2">
              <Label htmlFor="search">Search</Label>
              <Input id="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or description" />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select id="gender" value={gender} onChange={(e) => { setGender(e.target.value); setPage(1); }}>
                <option value="">All</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="UNISEX">Unisex</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select id="category" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                <option value="">All</option>
                <option value="SHOES">Shoes</option>
                <option value="LACES">Laces</option>
                <option value="POLISH">Polish</option>
                <option value="SOCKS">Socks</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="sort">Sort</Label>
              <Select id="sort" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
                <option value="newest">Newest</option>
                <option value="price_asc">Price low to high</option>
                <option value="price_desc">Price high to low</option>
                <option value="name_asc">Name A-Z</option>
              </Select>
            </div>
            <div className="md:col-span-5">
              <Button type="submit">Search</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {isLoading ? (
        <div className="text-slate-500">Loading...</div>
      ) : data?.data.length === 0 ? (
        <div className="text-slate-500 py-12 text-center">No products match your filters.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.data.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardBody>
                    <div className="aspect-square bg-slate-100 rounded mb-3 flex items-center justify-center text-slate-400 text-xs overflow-hidden">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        'No image'
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mb-1">{p.brand} &middot; {p.category}</div>
                    <div className="font-medium text-slate-900 line-clamp-1">{p.name}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-brand-700 font-semibold">{formatNGN(p.price)}</span>
                      {!p.inStock && <span className="text-xs text-red-600">Out of stock</span>}
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-slate-600">Page {data.meta.page} of {data.meta.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
