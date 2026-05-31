export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'SUPER_ADMIN';
  companyId: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  departmentId?: string;
  departmentName?: string;
  managerId?: string;
  avatarUrl?: string;
  employmentStatus: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
}

export interface Department {
  id: string;
  name: string;
  parentId?: string;
}

export interface LeaveType {
  id: string;
  name: string;
  daysAllowed: number;
}

export interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  requestedAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  clockInTime: string;
  clockOutTime?: string;
  clockInLatitude?: number;
  clockInLongitude?: number;
  hoursWorked?: number;
  date: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
