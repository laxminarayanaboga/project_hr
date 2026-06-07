import {apiClient} from './client';
import {
  ApiResponse,
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  TeamLeaveEntry,
} from '../types';

export const leavesApi = {
  submit: (payload: {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }) =>
    apiClient.post<ApiResponse<LeaveRequest>>('/leaves', payload),

  myLeaves: () =>
    apiClient.get<ApiResponse<LeaveRequest[]>>('/leaves/my'),

  pending: (params?: {page?: number; size?: number}) =>
    apiClient.get<ApiResponse<PagedResponse<LeaveRequest>>>('/leaves/pending', {
      params,
    }),

  teamLeaves: (params: {from: string; to: string}) =>
    apiClient.get<ApiResponse<TeamLeaveEntry[]>>('/leaves/team', {params}),

  approve: (id: string, comment?: string) =>
    apiClient.put(`/leaves/${id}/approve`, {comment}),

  reject: (id: string, comment?: string) =>
    apiClient.put(`/leaves/${id}/reject`, {comment}),

  balances: () =>
    apiClient.get<ApiResponse<LeaveBalance[]>>('/leave-balances/me'),

  types: () =>
    apiClient.get<ApiResponse<LeaveType[]>>('/leave-types'),
};
