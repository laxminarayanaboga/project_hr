import {apiClient} from './client';
import {ApiResponse, Employee, PagedResponse, Department} from '../types';

export const employeesApi = {
  list: (params?: {
    search?: string;
    departmentId?: string;
    page?: number;
    size?: number;
  }) =>
    apiClient.get<ApiResponse<PagedResponse<Employee>>>('/employees', {params}),

  get: (id: string) =>
    apiClient.get<ApiResponse<Employee>>(`/employees/${id}`),

  departments: () =>
    apiClient.get<ApiResponse<Department[]>>('/departments'),
};
