import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/useAuth'
import PrivateRoute from './common/PrivateRoute'
import AppLayout from './layout/AppLayout'
import LoginPage from './auth/LoginPage'
import RegisterCompanyPage from './auth/RegisterCompanyPage'
import ForgotPasswordPage from './auth/ForgotPasswordPage'
import ResetPasswordPage from './auth/ResetPasswordPage'
import DashboardPage from './dashboard/DashboardPage'
import EmployeeListPage from './employees/EmployeeListPage'
import EmployeeDetailPage from './employees/EmployeeDetailPage'
import DepartmentListPage from './departments/DepartmentListPage'
import OrgChartPage from './departments/OrgChartPage'
import CompanySettingsPage from './company/CompanySettingsPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterCompanyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/employees" element={<EmployeeListPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/departments" element={<DepartmentListPage />} />
            <Route path="/org-chart" element={<OrgChartPage />} />
            <Route path="/settings/company" element={<CompanySettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
