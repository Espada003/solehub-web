'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, apiRequestPaginated } from '@/lib/api';
import type { PayrollRecord, Role } from '@/lib/types';
import { Card, CardBody, CardHeader, Label, Select, Eyebrow, DisplayHeading } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/Container';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatNGN, formatDate } from '@/lib/format';

interface SalaryRow {
  id: string; email: string; firstName: string; lastName: string;
  role: Role; monthlySalary: number | null; isActive: boolean;
}

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function AdminPayrollContent() {
  const qc = useQueryClient();
  const [salaryEdits, setSalaryEdits] = useState<Record<string, string>>({});
  const [paymentForm, setPaymentForm] = useState({
    userId: '', periodMonth: new Date().getMonth() + 1, periodYear: new Date().getFullYear(), amount: '', notes: '',
  });
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const salaries = useQuery({ queryKey: ['payroll', 'salaries'], queryFn: () => apiRequest<SalaryRow[]>('/admin/payroll/salaries') });
  const payments = useQuery({ queryKey: ['payroll', 'payments'], queryFn: () => apiRequestPaginated<PayrollRecord>('/admin/payroll/payments', { query: { pageSize: 50 } }) });

  const setSalary = useMutation({
    mutationFn: ({ userId, monthlySalary }: { userId: string; monthlySalary: number }) =>
      apiRequest(`/admin/payroll/salaries/${userId}`, { method: 'PUT', body: { monthlySalary } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll', 'salaries'] }),
  });

  const recordPayment = useMutation({
    mutationFn: () => apiRequest('/admin/payroll/payments', { method: 'POST', body: {
      userId: paymentForm.userId,
      periodMonth: paymentForm.periodMonth,
      periodYear: paymentForm.periodYear,
      amount: Number(paymentForm.amount),
      notes: paymentForm.notes || undefined,
    }}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll', 'payments'] });
      setPaymentForm({ userId: '', periodMonth: new Date().getMonth() + 1, periodYear: new Date().getFullYear(), amount: '', notes: '' });
    },
    onError: (e: any) => setPaymentError(e?.message || 'Failed to record payment'),
  });

  return (
    <div className="space-y-8">
      <div>
        <Eyebrow>Compensation</Eyebrow>
        <DisplayHeading as="h1" text="Payroll." accent="Payroll" className="mt-3 text-4xl text-ink" />
      </div>

      <Card>
        <CardHeader><Eyebrow>Salaries</Eyebrow></CardHeader>
        <CardBody className="overflow-x-auto">
          {salaries.isLoading ? <div className="text-ink-2">Loading...</div> : (
            <table className="w-full text-sm">
              <thead className="text-left text-ink-3">
                <tr>
                  <th className="py-2 font-medium text-[11px] uppercase tracking-eyebrow">Name</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Email</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Role</th>
                  <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Monthly (NGN)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {salaries.data?.map((u) => (
                  <tr key={u.id} className="border-t border-rule">
                    <td className="py-3 text-ink">{u.firstName} {u.lastName}</td>
                    <td className="text-ink-2">{u.email}</td>
                    <td className="text-ink-2">{u.role}</td>
                    <td className="text-right">
                      <Input id={`sal-${u.id}`} type="number" step="0.01" className="w-40 text-right"
                             placeholder={u.monthlySalary !== null ? String(u.monthlySalary) : 'Not set'}
                             value={salaryEdits[u.id] ?? ''}
                             onChange={(e) => setSalaryEdits((s) => ({ ...s, [u.id]: e.target.value }))} />
                    </td>
                    <td>
                      <Button size="sm" disabled={!salaryEdits[u.id] || setSalary.isPending}
                              onClick={() => {
                                const n = Number(salaryEdits[u.id]);
                                if (n > 0) setSalary.mutate({ userId: u.id, monthlySalary: n });
                              }}>
                        Save
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Eyebrow>New</Eyebrow>
          <div className="text-lg font-semibold mt-1 tracking-tight">Record a payment</div>
        </CardHeader>
        <CardBody>
          <form className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end" onSubmit={(e) => { e.preventDefault(); setPaymentError(null); recordPayment.mutate(); }}>
            <div className="md:col-span-2">
              <Label htmlFor="pay-user">User</Label>
              <Select id="pay-user" value={paymentForm.userId} onChange={(e) => setPaymentForm((f) => ({ ...f, userId: e.target.value }))} required>
                <option value="">Select a user...</option>
                {salaries.data?.map((u) => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName} — {u.role}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="pay-month">Month</Label>
              <Select id="pay-month" value={paymentForm.periodMonth} onChange={(e) => setPaymentForm((f) => ({ ...f, periodMonth: Number(e.target.value) }))}>
                {MONTHS.slice(1).map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="pay-year">Year</Label>
              <Input id="pay-year" type="number" value={paymentForm.periodYear} onChange={(e) => setPaymentForm((f) => ({ ...f, periodYear: Number(e.target.value) }))} />
            </div>
            <div>
              <Label htmlFor="pay-amount">Amount (NGN)</Label>
              <Input id="pay-amount" type="number" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))} required />
            </div>
            <div className="md:col-span-5">
              <Label htmlFor="pay-notes">Notes</Label>
              <Input id="pay-notes" value={paymentForm.notes} onChange={(e) => setPaymentForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            {paymentError && (
              <div role="alert" className="md:col-span-5 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">{paymentError}</div>
            )}
            <div className="md:col-span-5">
              <Button type="submit" disabled={recordPayment.isPending}>{recordPayment.isPending ? 'Recording...' : 'Record payment'}</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><Eyebrow>History</Eyebrow></CardHeader>
        <CardBody className="overflow-x-auto">
          {payments.isLoading ? <div className="text-ink-2">Loading...</div> : (
            <table className="w-full text-sm">
              <thead className="text-left text-ink-3">
                <tr>
                  <th className="py-2 font-medium text-[11px] uppercase tracking-eyebrow">Recipient</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Period</th>
                  <th className="text-right font-medium text-[11px] uppercase tracking-eyebrow">Amount</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Paid</th>
                  <th className="font-medium text-[11px] uppercase tracking-eyebrow">Notes</th>
                </tr>
              </thead>
              <tbody>
                {payments.data?.data.map((r) => (
                  <tr key={r.id} className="border-t border-rule">
                    <td className="py-3 text-ink">{r.userFullName} <span className="text-ink-3">({r.userRole})</span></td>
                    <td className="text-ink-2">{MONTHS[r.periodMonth]} {r.periodYear}</td>
                    <td className="text-right tabular text-ink">{formatNGN(r.amount)}</td>
                    <td className="text-ink-2">{formatDate(r.paidAt)}</td>
                    <td className="text-ink-3 text-xs">{r.notes || '—'}</td>
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

export default function AdminPayrollPage() {
  return (
    <ProtectedRoute allowRoles={['ACCOUNTANT', 'SUPER_ADMIN']}>
      <Container>
        <AdminPayrollContent />
      </Container>
    </ProtectedRoute>
  );
}
