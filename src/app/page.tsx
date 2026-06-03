'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiRequestPaginated } from '@/lib/api';
import type { Product } from '@/lib/types';
import { Card, CardBody } from '@/components/ui';
import { formatNGN } from '@/lib/format';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'home'],
    queryFn: () => apiRequestPaginated<Product>('/products', { query: { pageSize: 8, sortBy: 'newest' }, auth: false }),
  });

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-r from-brand-700 to-brand-500 text-white rounded-lg p-8 sm:p-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Footwear for every step</h1>
        <p className="text-brand-50 max-w-xl mb-6">
          Shoes for men and women, plus laces, polish, and socks. Fast shipping across Nigeria.
        </p>
        <Link href="/products"><Button size="lg" className="bg-white text-brand-700 hover:bg-slate-100">Shop now</Button></Link>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">New arrivals</h2>
          <Link href="/products" className="text-sm text-brand-600 hover:text-brand-700">View all &rarr;</Link>
        </div>
        {isLoading ? (
          <div className="text-slate-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.data.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardBody>
                    <div className="aspect-square bg-slate-100 rounded mb-3 flex items-center justify-center text-slate-400 text-xs">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        'No image'
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mb-1">{p.brand}</div>
                    <div className="font-medium text-slate-900 line-clamp-1">{p.name}</div>
                    <div className="mt-2 text-brand-700 font-semibold">{formatNGN(p.price)}</div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
