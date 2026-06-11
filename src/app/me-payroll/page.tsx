'use client';
import { useQuery } from '@tanstack/react-query';
import { apiRequestPaginated } from '@/lib/api';
import type { PayrollRecord } from '@/lib/types';
import { Card, CardBody, CardHeader, Eyebrow, DisplayHeading } from '@/components/ui';
import { Container } from '@/components/Container';
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
      <CardHeader>
        <Eyebrow>History</Eyebrow>
        <div className="text-lg font-semibold mt-1 tracking-tight">All payments to date</div>
      </CardHeader>
      <CardBody className="overflow-x-auto">
        {isLoading ? <div className="text-ink-2">Loading...</div> : data && data.data.length === 0 ? (
          <div className="text-ink-3 py-4">No payroll records yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-ink-3">
              <tr>
                <th className="py-2 font-medium text-[11px] uppercase tracking-eyebrow">Period</th>
                <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Amount</th>
                <th className="font-medium text-[11px] uppercase tracking-eyebrow">Paid on</th>
                <th className="font-medium text-[11px] uppercase tracking-eyebrow">Notes</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((r) => (
                <tr key={r.id} className="border-t border-rule">
                  <td className="py-3 text-ink">{MONTHS[r.periodMonth]} {r.periodYear}</td>
                  <td className="text-right tabular text-ink font-medium">{formatNGN(r.amount)}</td>
                  <td className="text-ink-2">{formatDate(r.paidAt)}</td>
                  <td className="text-ink-3 text-xs">{r.notes || '\u2014'}</td>
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
      <Container>
        <div className="mb-8">
          <Eyebrow>Compensation</Eyebrow>
          <DisplayHeading as="h1" text="My payroll." accent="payroll" className="mt-3 text-4xl text-ink" />
        </div>
        <MyPayrollContent />
      </Container>
    </ProtectedRoute>
  );
}
