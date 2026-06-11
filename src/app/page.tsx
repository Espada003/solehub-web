'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiRequestPaginated } from '@/lib/api';
import type { Product } from '@/lib/types';
import { Card, CardBody, Eyebrow, DisplayHeading } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/Container';
import { formatNGN } from '@/lib/format';

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'home'],
    queryFn: () => apiRequestPaginated<Product>('/products', { query: { pageSize: 8, sortBy: 'newest' }, auth: false }),
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-rule">
        <div className="gradient-mesh absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <Eyebrow>New for the season</Eyebrow>
            <DisplayHeading
              as="h1"
              text="Footwear for every step."
              accent="step"
              className="mt-5 text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-ink"
            />
            <p className="mt-6 text-lg text-ink-2 max-w-xl leading-relaxed">
              Shoes for men and women, plus laces, polish, and socks.
              Considered selection. Honest pricing. Shipped across Nigeria.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link href="/products">
                <Button size="lg">Shop the catalogue</Button>
              </Link>
              <Link href="/products?category=SHOES" className="text-sm text-ink-2 hover:text-ink transition-colors duration-150 underline-offset-4 hover:underline">
                Browse shoes &rarr;
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured */}
      <section className="border-b border-rule">
        <Container className="py-16 sm:py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Eyebrow>Featured</Eyebrow>
              <DisplayHeading
                as="h2"
                text="New arrivals."
                accent="arrivals"
                className="mt-3 text-3xl sm:text-4xl text-ink"
              />
            </div>
            <Link href="/products" className="text-sm text-ink-2 hover:text-ink transition-colors duration-150 underline-offset-4 hover:underline">
              View all &rarr;
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-rule/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
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
                      <div className="text-[11px] uppercase tracking-eyebrow text-ink-3 mb-1">{p.brand}</div>
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
          )}
        </Container>
      </section>

      {/* By category */}
      <section>
        <Container className="py-16 sm:py-20">
          <Eyebrow>By category</Eyebrow>
          <DisplayHeading
            as="h2"
            text="Everything for the shoe."
            accent="shoe"
            className="mt-3 text-3xl sm:text-4xl text-ink"
          />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Shoes', value: 'SHOES', tone: 'col-span-1 sm:col-span-2 lg:col-span-2' },
              { label: 'Laces', value: 'LACES', tone: '' },
              { label: 'Polish', value: 'POLISH', tone: '' },
              { label: 'Socks', value: 'SOCKS', tone: 'col-span-1 sm:col-span-2 lg:col-span-4' },
            ].map((c) => (
              <Link key={c.value} href={`/products?category=${c.value}`} className={`block ${c.tone} group`}>
                <Card className="bg-ink text-paper border-ink overflow-hidden p-10 h-full hover:bg-gold transition-colors duration-200 ease-smooth">
                  <div className="text-[11px] uppercase tracking-eyebrow opacity-70 mb-3">Shop</div>
                  <div className="text-3xl font-bold tracking-tightest">{c.label}.</div>
                  <div className="mt-6 text-xs uppercase tracking-eyebrow opacity-70 group-hover:opacity-100 transition-opacity">Browse &rarr;</div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
