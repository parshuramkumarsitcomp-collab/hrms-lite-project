import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, ChevronDown, Filter, CalendarDays } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { employeeApi, attendanceApi, getErrorMessage } from '../api';
import { useToast } from '../components/Toast';

const schema = z.object({
  employeeId: z.string().min(1, 'Select an employee'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['Present', 'Absent']),
});
type FormValues = z.infer<typeof schema>;

const today = new Date().toISOString().split('T')[0];

export default function Attendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: employeeApi.list });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: today, status: 'Present' },
  });
  const status = watch('status');

  const markMutation = useMutation({
    mutationFn: (d: FormValues) => attendanceApi.mark({ employeeId: d.employeeId, date: d.date, status: d.status }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', vars.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Attendance marked successfully' });
      reset({ date: today, status: 'Present', employeeId: '' });
    },
    onError: (err) => toast({ title: 'Action failed', description: getErrorMessage(err), variant: 'destructive' }),
  });

  const [viewId, setViewId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: viewData, isLoading: loadingView } = useQuery({
    queryKey: ['attendance', viewId, startDate, endDate],
    queryFn: () => employeeApi.getAttendance(viewId, { startDate: startDate || undefined, endDate: endDate || undefined }),
    enabled: !!viewId,
  });

  const selectClass = 'w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none';
  const inputClass = 'w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Attendance</h1>
        <p className="text-sm text-muted-foreground mt-1">Record and review daily attendance logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-4">
          <div className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
              <div className="w-9 h-9 rounded-xl bg-purple-600/15 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="font-display font-semibold text-foreground">Log Record</h2>
            </div>

            <form onSubmit={handleSubmit(d => markMutation.mutate(d))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Employee</label>
                <div className="relative">
                  <select {...register('employeeId')} className={selectClass}>
                    <option value="">Select Employee...</option>
                    {employees?.map(e => <option key={e._id} value={e._id}>{e.fullName}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.employeeId && <p className="text-xs text-rose-400 mt-1">{errors.employeeId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
                <input type="date" {...register('date')} max={today} className={inputClass} />
                {errors.date && <p className="text-xs text-rose-400 mt-1">{errors.date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="cursor-pointer">
                    <input type="radio" value="Present" {...register('status')} className="sr-only" />
                    <div className={`py-2.5 rounded-xl border-2 text-center text-sm font-medium transition-all ${status === 'Present' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-border text-muted-foreground hover:border-border/80'}`}>
                      Present
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" value="Absent" {...register('status')} className="sr-only" />
                    <div className={`py-2.5 rounded-xl border-2 text-center text-sm font-medium transition-all ${status === 'Absent' ? 'border-rose-500 bg-rose-500/10 text-rose-400' : 'border-border text-muted-foreground hover:border-border/80'}`}>
                      Absent
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" disabled={markMutation.isPending} className="w-full mt-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium shadow-lg shadow-purple-600/25 disabled:opacity-50 transition-colors">
                {markMutation.isPending ? 'Saving...' : 'Save Record'}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-8">
          <div className="bg-card rounded-2xl border border-border h-full flex flex-col">
            <div className="p-5 border-b border-border space-y-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-display font-semibold text-foreground">View History</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <select value={viewId} onChange={e => setViewId(e.target.value)} className={selectClass}>
                    <option value="">Select Employee...</option>
                    {employees?.map(e => <option key={e._id} value={e._id}>{e.fullName}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="flex-1 p-5 flex flex-col">
              {!viewId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground min-h-[200px]">
                  <CalendarDays className="w-12 h-12 opacity-20 mb-3" />
                  <p className="text-sm">Select an employee to view history</p>
                </div>
              ) : loadingView ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                </div>
              ) : viewData ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-400">Days Present</span>
                      <span className="text-2xl font-bold text-emerald-400">{viewData.totalPresent}</span>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-rose-400">Days Absent</span>
                      <span className="text-2xl font-bold text-rose-400">{viewData.totalAbsent}</span>
                    </div>
                  </div>

                  {viewData.records.length > 0 ? (
                    <div className="flex-1 border border-border rounded-xl overflow-hidden">
                      <div className="overflow-auto max-h-[320px]">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-muted/50">
                            <tr className="border-b border-border">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Logged At</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {viewData.records.map(r => (
                              <tr key={r._id} className="hover:bg-muted/20">
                                <td className="px-4 py-3 font-medium text-foreground">{format(new Date(r.date), 'MMMM d, yyyy')}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.status === 'Present' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                                    {r.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{format(new Date(r.createdAt), 'MMM d, p')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <p className="text-sm">No records found for this period.</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
