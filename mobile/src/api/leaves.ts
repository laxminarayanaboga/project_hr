import {apiClient} from './client';
import {
  ApiResponse,
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  PagedResponse,
} from '../types';

export const leavesApi = {
  submit: (payload: {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }) =>
    apiClient.post<ApiResponse<LeaveRequest>>('/leaves', payload),

  myLeaves: (params?: {page?: number; size?: number}) =>
    apiClient.get<ApiResponse<PagedResponse<LeaveRequest>>>('/leaves/my', {
      params,
    }),

  pending: (params?: {page?: number; size?: number}) =>
    apiClient.get<ApiResponse<PagedResponse<LeaveRequest>>>('/leaves/pending', {
      params,
    }),

  teamLeaves: (params?: {startDate?: string; endDate?: string}) =>
    apiClient.get<ApiResponse<LeaveRequest[]>>('/leaves/team', {params}),

  approve: (id: string, comment?: string) =>
    apiClient.put(`/leaves/${id}/approve`, {comment}),

  reject: (id: string, comment?: string) =>
    apiClient.put(`/leaves/${id}/reject`, {comment}),

  balances: () =>
    apiClient.get<ApiResponse<LeaveBalance[]>>('/leave-balances/me'),

  types: () =>
    apiClient.get<ApiResponse<LeaveType[]>>('/leave-types'),
};
