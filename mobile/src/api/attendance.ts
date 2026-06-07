import {apiClient} from './client';
import {ApiResponse, AttendanceRecord} from '../types';

export const attendanceApi = {
  clockIn: (payload?: {latitude?: number; longitude?: number}) =>
    apiClient.post<ApiResponse<AttendanceRecord>>('/attendance/clock-in', payload),

  clockOut: () =>
    apiClient.post<ApiResponse<AttendanceRecord>>('/attendance/clock-out'),

  today: () =>
    apiClient.get<ApiResponse<AttendanceRecord | null>>('/attendance/today'),

  history: (params?: {startDate?: string; endDate?: string; page?: number}) =>
    apiClient.get<ApiResponse<AttendanceRecord[]>>('/attendance/history', {
      params,
    }),
};
