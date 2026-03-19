import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, UserX, Building2, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { dashboardApi, employeeApi } from '../api';

const PIE_COLORS = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get });
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: employeeApi.list });

  const recentAttendance = data?.recentAttendance.map(att => ({
    ...att,
    employeeName: employees?.find(e => e._id === att.employeeId)?.fullName || `ID: ${att.employeeId}`,
  })) || [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-card rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-card rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="h-72 bg-card rounded-2xl" />
          <div className="lg:col-span-2 h-72 bg-card rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = [
    { title: 'Total Employees', value: data?.totalEmployees || 0, icon: Users, gradient: 'from-purple-600 to-purple-800' },
    { title: 'Present Today', value: data?.totalPresentToday || 0, icon: UserCheck, gradient: 'from-emerald-500 to-emerald-700' },
    { title: 'Absent Today', value: data?.totalAbsentToday || 0, icon: UserX, gradient: 'from-rose-500 to-rose-700' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your organization's attendance and workforce.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className={`rounded-2xl p-5 bg-gradient-to-br ${stat.gradient} flex items-center justify-between`}>
            <div>
              <p className="text-sm font-medium text-white/80">{stat.title}</p>
              <h3 className="text-4xl font-display font-bold text-white mt-1">{stat.value}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
              <stat.icon className="w-7 h-7 text-white" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl p-5 border border-border flex flex-col">
          <div className="flex items-center mb-4">
            <Building2 className="w-4 h-4 text-muted-foreground mr-2" />
            <h3 className="font-display font-semibold text-foreground">Departments</h3>
          </div>
          {data?.departmentCounts && data.departmentCounts.length > 0 ? (
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.departmentCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="count" nameKey="department">
                    {data.departmentCounts.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(230 20% 10%)', border: '1px solid hsl(230 15% 16%)', borderRadius: 12, color: '#fff' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: 'hsl(215 20% 55%)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground min-h-[200px]">
              <Building2 className="w-10 h-10 opacity-20 mb-2" />
              <p className="text-sm">No department data</p>
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border lg:col-span-2">
          <div className="flex items-center mb-4">
            <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
            <h3 className="font-display font-semibold text-foreground">Recent Attendance</h3>
          </div>
          {recentAttendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Employee</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentAttendance.map((r) => (
                    <tr key={r._id} className="hover:bg-muted/30">
                      <td className="py-3 font-medium text-foreground">{r.employeeName}</td>
                      <td className="py-3 text-muted-foreground">{format(new Date(r.date), 'MMM d, yyyy')}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.status === 'Present' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
              <Calendar className="w-10 h-10 opacity-20 mb-2" />
              <p className="text-sm">No recent attendance records</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
