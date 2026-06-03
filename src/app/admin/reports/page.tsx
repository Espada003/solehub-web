'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, API_BASE_URL } from '@/lib/api';
import { tokenStore } from '@/lib/token-store';
import { Card, CardBody, CardHeader, Label } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatNGN } from '@/lib/format';

interface Revenue { totalRevenue: number; orderCount: number; averageOrderValue: number; }
interface Profit  { revenue: number; costOfGoodsSold: number; payrollPaid: number; netProfit: number; }
interface CatRow  { category: string; revenue: number; orderCount: number; }
interface TopRow  { productId: string; name: string; unitsSold: number; revenue: number; }

function todayISO() { return new Date().toISOString().slice(0, 10); }
function ninetyDaysAgoISO() {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().slice(0, 10);
}

function AdminReportsContent() {
  const [start, setStart] = useState(ninetyDaysAgoISO());
  const [end, setEnd] = useState(todayISO());
  const range = { startDate: start, endDate: end };

  const revenue = useQuery({
    queryKey: ['report', 'revenue', range],
    queryFn: () => apiRequest<Revenue>('/admin/reports/revenue', { query: range }),
  });
  const profit = useQuery({
    queryKey: ['report', 'profit', range],
    queryFn: () => apiRequest<Profit>('/admin/reports/profit', { query: range }),
  });
  const byCat = useQuery({
    queryKey: ['report', 'byCat', range],
    queryFn: () => apiRequest<CatRow[]>('/admin/reports/revenue-by-category', { query: range }),
  });
  const top = useQuery({
    queryKey: ['report', 'top', range],
    queryFn: () => apiRequest<TopRow[]>('/admin/reports/top-products', { query: { ...range, limit: 10 } }),
  });

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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      <Card>
        <CardBody>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <Label>Start date</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <Label>End date</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <Button variant="outline" onClick={downloadCsv}>Download sales CSV</Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><h2 className="font-semibold">Revenue</h2></CardHeader>
          <CardBody>
            {revenue.isLoading ? 'Loading...' : revenue.data && (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Total revenue</span><span className="font-semibold">{formatNGN(revenue.data.totalRevenue)}</span></div>
                <div className="flex justify-between"><span>Order count</span><span>{revenue.data.orderCount}</span></div>
                <div className="flex justify-between"><span>Average order value</span><span>{formatNGN(revenue.data.averageOrderValue)}</span></div>
              </div>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Profit</h2></CardHeader>
          <CardBody>
            {profit.isLoading ? 'Loading...' : profit.data && (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Revenue</span><span>{formatNGN(profit.data.revenue)}</span></div>
                <div className="flex justify-between"><span>Cost of goods sold</span><span>{formatNGN(profit.data.costOfGoodsSold)}</span></div>
                <div className="flex justify-between"><span>Payroll paid</span><span>{formatNGN(profit.data.payrollPaid)}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Net profit</span><span>{formatNGN(profit.data.netProfit)}</span></div>
              </div>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Revenue by category</h2></CardHeader>
          <CardBody>
            {byCat.isLoading ? 'Loading...' : byCat.data && byCat.data.length === 0 ? (
              <div className="text-slate-500 text-sm">No data in this range.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr><th>Category</th><th className="text-right">Revenue</th><th className="text-right">Orders</th></tr>
                </thead>
                <tbody>
                  {byCat.data?.map((r) => (
                    <tr key={r.category} className="border-t">
                      <td className="py-1">{r.category}</td>
                      <td className="text-right">{formatNGN(r.revenue)}</td>
                      <td className="text-right">{r.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Top products</h2></CardHeader>
          <CardBody>
            {top.isLoading ? 'Loading...' : top.data && top.data.length === 0 ? (
              <div className="text-slate-500 text-sm">No data in this range.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr><th>Product</th><th className="text-right">Units sold</th><th className="text-right">Revenue</th></tr>
                </thead>
                <tbody>
                  {top.data?.map((r) => (
                    <tr key={r.productId} className="border-t">
                      <td className="py-1">{r.name}</td>
                      <td className="text-right">{r.unitsSold}</td>
                      <td className="text-right">{formatNGN(r.revenue)}</td>
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
      <AdminReportsContent />
    </ProtectedRoute>
  );
}
