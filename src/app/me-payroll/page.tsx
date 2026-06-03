'use client';
import { useQuery } from '@tanstack/react-query';
import { apiRequestPaginated } from '@/lib/api';
import type { PayrollRecord } from '@/lib/types';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatNGN, formatDate } from '@/lib/format';

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function MyPayrollContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['me', 'payroll'],
    queryFn: () => apiRequestPaginated<PayrollRecord>('/me/payroll', { query: { pageSize: 100 } }),
  });

  return (
    <Card>
      <CardHeader><h2 className="font-semibold">My payroll history</h2></CardHeader>
      <CardBody className="overflow-x-auto">
        {isLoading ? 'Loading...' : data && data.data.length === 0 ? (
          <div className="text-slate-500 py-4">No payroll records yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr><th className="py-2">Period</th><th className="text-right">Amount</th><th>Paid on</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {data?.data.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2">{MONTHS[r.periodMonth]} {r.periodYear}</td>
                  <td className="text-right">{formatNGN(r.amount)}</td>
                  <td>{formatDate(r.paidAt)}</td>
                  <td className="text-slate-600 text-xs">{r.notes || '\u2014'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
  );
}

export default function MyPayrollPage() {
  return (
    <ProtectedRoute allowRoles={['STAFF', 'ACCOUNTANT', 'SUPER_ADMIN']}>
      <h1 className="text-2xl font-semibold mb-4">My payroll</h1>
      <MyPayrollContent />
    </ProtectedRoute>
  );
}
