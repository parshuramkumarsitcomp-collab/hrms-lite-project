import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Users, Search, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { employeeApi, getErrorMessage } from '../api';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const schema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(2, 'Department is required'),
});
type FormValues = z.infer<typeof schema>;

export default function Employees() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: employees, isLoading } = useQuery({ queryKey: ['employees'], queryFn: employeeApi.list });
  const createMutation = useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setAddOpen(false);
      reset();
      toast({ title: 'Employee added successfully' });
    },
    onError: (err) => toast({ title: 'Failed to add employee', description: getErrorMessage(err), variant: 'destructive' }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteId(null);
      toast({ title: 'Employee deleted successfully' });
    },
    onError: (err) => toast({ title: 'Failed to delete', description: getErrorMessage(err), variant: 'destructive' }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const filtered = employees?.filter(e =>
    e.fullName.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const inputClass = 'w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-muted-foreground';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Employees</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your workforce directory.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors shadow-lg shadow-purple-600/25">
          <Plus className="w-4 h-4 mr-2" /> Add Employee
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-muted-foreground" />
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-muted/50 animate-pulse rounded-xl" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase">Employee ID</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase">Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase">Department</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Email</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map(emp => (
                  <tr key={emp._id} className="hover:bg-muted/20 group transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{emp.employeeId}</td>
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {emp.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{emp.fullName}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-md bg-purple-600/10 text-purple-400 text-xs font-medium">{emp.department}</span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">{emp.email}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => setDeleteId(emp._id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
            <Users className="w-12 h-12 opacity-20 mb-3" />
            <p>No employees found.</p>
          </div>
        )}
      </div>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Employee">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
          {[
            { name: 'employeeId' as const, label: 'Employee ID', placeholder: 'EMP-001' },
            { name: 'fullName' as const, label: 'Full Name', placeholder: 'Jane Doe' },
            { name: 'email' as const, label: 'Email Address', placeholder: 'jane@company.com' },
            { name: 'department' as const, label: 'Department', placeholder: 'Engineering' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
              <input {...register(f.name)} placeholder={f.placeholder} className={inputClass} />
              {errors[f.name] && <p className="text-xs text-rose-400 mt-1">{errors[f.name]?.message}</p>}
            </div>
          ))}
          <div className="pt-3 flex justify-end gap-3">
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25 disabled:opacity-50 transition-colors">
              {createMutation.isPending ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Deletion">
        <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl mb-5">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">This will permanently delete the employee and all their attendance records.</p>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
          <button onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 transition-colors">
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Employee'}
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
