'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, API_BASE_URL } from '@/lib/api';
import { tokenStore } from '@/lib/token-store';
import { Card, CardBody, CardHeader, Label, Eyebrow, DisplayHeading } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/Container';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatNGN } from '@/lib/format';

interface Revenue { totalRevenue: number; orderCount: number; averageOrderValue: number; }
interface Profit  { revenue: number; costOfGoodsSold: number; payrollPaid: number; netProfit: number; }
interface CatRow  { category: string; revenue: number; orderCount: number; }
interface TopRow  { productId: string; name: string; unitsSold: number; revenue: number; }

function todayISO() { return new Date().toISOString().slice(0, 10); }
function ninetyDaysAgoISO() {
  const d = new Date(); d.setDate(d.getDate() - 90);
  return d.toISOString().slice(0, 10);
}

function AdminReportsContent() {
  const [start, setStart] = useState(ninetyDaysAgoISO());
  const [end, setEnd] = useState(todayISO());
  const range = { startDate: start, endDate: end };

  const revenue = useQuery({ queryKey: ['report', 'revenue', range], queryFn: () => apiRequest<Revenue>('/admin/reports/revenue', { query: range }) });
  const profit  = useQuery({ queryKey: ['report', 'profit', range],  queryFn: () => apiRequest<Profit>('/admin/reports/profit',  { query: range }) });
  const byCat   = useQuery({ queryKey: ['report', 'byCat', range],   queryFn: () => apiRequest<CatRow[]>('/admin/reports/revenue-by-category', { query: range }) });
  const top     = useQuery({ queryKey: ['report', 'top', range],     queryFn: () => apiRequest<TopRow[]>('/admin/reports/top-products',         { query: { ...range, limit: 10 } }) });

  const downloadCsv = async () => {
    const token = tokenStore.getAccess();
    const url = `${API_BASE_URL}/admin/reports/sales.csv?startDate=${start}&endDate=${end}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `solehub-sales-${start}_to_${end}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8">
      <div>
        <Eyebrow>Finance</Eyebrow>
        <DisplayHeading as="h1" text="Reports." accent="Reports" className="mt-3 text-4xl text-ink" />
      </div>

      <Card>
        <CardBody>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <Label htmlFor="r-start">Start date</Label>
              <Input id="r-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="r-end">End date</Label>
              <Input id="r-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <Button variant="outline" onClick={downloadCsv}>Download sales CSV</Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><Eyebrow>Revenue</Eyebrow></CardHeader>
          <CardBody>
            {revenue.isLoading ? <div className="text-ink-2">Loading...</div> : revenue.data && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-ink-2"><span>Total revenue</span><span className="font-semibold text-ink tabular">{formatNGN(revenue.data.totalRevenue)}</span></div>
                <div className="flex justify-between text-ink-2"><span>Order count</span><span className="tabular text-ink">{revenue.data.orderCount}</span></div>
                <div className="flex justify-between text-ink-2"><span>Average order value</span><span className="tabular text-ink">{formatNGN(revenue.data.averageOrderValue)}</span></div>
              </div>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader><Eyebrow>Profit</Eyebrow></CardHeader>
          <CardBody>
            {profit.isLoading ? <div className="text-ink-2">Loading...</div> : profit.data && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-ink-2"><span>Revenue</span><span className="tabular text-ink">{formatNGN(profit.data.revenue)}</span></div>
                <div className="flex justify-between text-ink-2"><span>Cost of goods sold</span><span className="tabular text-ink">{formatNGN(profit.data.costOfGoodsSold)}</span></div>
                <div className="flex justify-between text-ink-2"><span>Payroll paid</span><span className="tabular text-ink">{formatNGN(profit.data.payrollPaid)}</span></div>
                <div className="flex justify-between font-semibold border-t border-rule pt-2 mt-2"><span>Net profit</span><span className="tabular">{formatNGN(profit.data.netProfit)}</span></div>
              </div>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader><Eyebrow>By category</Eyebrow></CardHeader>
          <CardBody>
            {byCat.isLoading ? <div className="text-ink-2">Loading...</div> : byCat.data && byCat.data.length === 0 ? (
              <div className="text-ink-3 text-sm">No data in this range.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-ink-3">
                  <tr>
                    <th className="font-medium text-[11px] uppercase tracking-eyebrow">Category</th>
                    <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Revenue</th>
                    <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {byCat.data?.map((r) => (
                    <tr key={r.category} className="border-t border-rule">
                      <td className="py-2 text-ink">{r.category}</td>
                      <td className="text-right tabular text-ink-2">{formatNGN(r.revenue)}</td>
                      <td className="text-right tabular text-ink-2">{r.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader><Eyebrow>Top products</Eyebrow></CardHeader>
          <CardBody>
            {top.isLoading ? <div className="text-ink-2">Loading...</div> : top.data && top.data.length === 0 ? (
              <div className="text-ink-3 text-sm">No data in this range.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-ink-3">
                  <tr>
                    <th className="font-medium text-[11px] uppercase tracking-eyebrow">Product</th>
                    <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Units sold</th>
                    <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {top.data?.map((r) => (
                    <tr key={r.productId} className="border-t border-rule">
                      <td className="py-2 text-ink">{r.name}</td>
                      <td className="text-right tabular text-ink-2">{r.unitsSold}</td>
                      <td className="text-right tabular text-ink-2">{formatNGN(r.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <ProtectedRoute allowRoles={['ACCOUNTANT', 'SUPER_ADMIN']}>
      <Container>
        <AdminReportsContent />
      </Container>
    </ProtectedRoute>
  );
}
