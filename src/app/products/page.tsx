'use client';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiRequestPaginated } from '@/lib/api';
import type { Product } from '@/lib/types';
import { Card, CardBody, Label, Select, Eyebrow, DisplayHeading } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/Container';
import { formatNGN } from '@/lib/format';

export default function ProductsPage() {
  return (
    <Suspense fallback={<Container><div className="text-ink-2">Loading...</div></Container>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [search, setSearch] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState('');
  const [gender, setGender] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  // Sync category if URL param changes
  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

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
    <Container>
      <div className="mb-10">
        <Eyebrow>Catalogue</Eyebrow>
        <DisplayHeading
          as="h1"
          text="All products."
          accent="products"
          className="mt-3 text-4xl sm:text-5xl text-ink"
        />
      </div>

      {/* Filters */}
      <div className="mb-8 pb-8 border-b border-rule">
        <form
          className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
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
            <Label htmlFor="sort">Sort by</Label>
            <Select id="sort" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price low to high</option>
              <option value="price_desc">Price high to low</option>
              <option value="name_asc">Name A to Z</option>
            </Select>
          </div>
          <div className="md:col-span-5">
            <Button type="submit">Search</Button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-rule/30 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-rule rounded-lg">
          <Eyebrow className="mb-2">Nothing here</Eyebrow>
          <div className="text-ink font-medium">No products match your filters.</div>
          <div className="text-ink-2 text-sm mt-1">Try widening the search.</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data?.data.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group">
                <Card className="overflow-hidden hover:shadow-soft hover:border-ink/30 h-full">
                  <div className="aspect-square bg-gold-tint/40 relative overflow-hidden">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 ease-smooth group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-ink-3 text-xs">No image</div>
                    )}
                  </div>
                  <CardBody>
                    <div className="text-[11px] uppercase tracking-eyebrow text-ink-3 mb-1">{p.brand} &middot; {p.category}</div>
                    <div className="font-medium text-ink line-clamp-1">{p.name}</div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-ink font-semibold tabular">{formatNGN(p.price)}</span>
                      {!p.inStock && <span className="text-[10px] uppercase tracking-wider text-red-700">Out of stock</span>}
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-10 mt-10 border-t border-rule">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Previous</Button>
              <span className="text-sm text-ink-2 tabular">Page {data.meta.page} of {data.meta.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next →</Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
