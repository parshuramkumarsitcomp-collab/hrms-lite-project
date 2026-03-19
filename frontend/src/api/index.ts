import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export interface Employee {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  createdAt: string;
}

export interface AttendanceRecord {
  _id: string;
  employeeId: string;
  date: string;
  status: 'Present' | 'Absent';
  createdAt: string;
}

export interface AttendanceWithStats {
  records: AttendanceRecord[];
  totalPresent: number;
  totalAbsent: number;
}

export interface DashboardStats {
  totalEmployees: number;
  totalPresentToday: number;
  totalAbsentToday: number;
  departmentCounts: { department: string; count: number }[];
  recentAttendance: AttendanceRecord[];
}

export const employeeApi = {
  list: () => api.get<Employee[]>('/employees').then(r => r.data),
  create: (data: Omit<Employee, '_id' | 'createdAt'>) =>
    api.post<Employee>('/employees', data).then(r => r.data),
  delete: (id: string) => api.delete(`/employees/${id}`),
  getAttendance: (id: string, params?: { startDate?: string; endDate?: string }) =>
    api.get<AttendanceWithStats>(`/employees/${id}/attendance`, { params }).then(r => r.data),
};

export const attendanceApi = {
  mark: (data: { employeeId: string; date: string; status: 'Present' | 'Absent' }) =>
    api.post<AttendanceRecord>('/attendance', data).then(r => r.data),
};

export const dashboardApi = {
  get: () => api.get<DashboardStats>('/dashboard').then(r => r.data),
};

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error || err.message;
  }
  return 'Something went wrong';
}
