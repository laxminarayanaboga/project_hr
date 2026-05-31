package com.hrapp.reports;

import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.department.Department;
import com.hrapp.department.DepartmentRepository;
import com.hrapp.employee.Employee;
import com.hrapp.employee.EmployeeRepository;
import com.hrapp.leaverequest.LeaveRequest;
import com.hrapp.leaverequest.LeaveRequestRepository;
import com.hrapp.leavetype.LeaveType;
import com.hrapp.leavetype.LeaveTypeRepository;
import com.hrapp.reports.dto.LeaveReportResponse;
import com.hrapp.reports.dto.LeaveReportRow;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportsService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveTypeRepository leaveTypeRepository;

    @Transactional(readOnly = true)
    public LeaveReportResponse getLeaveReport(LocalDate from, LocalDate to,
                                               UUID employeeId, UUID departmentId, UUID leaveTypeId) {
        UUID companyId = TenantContext.getCurrentCompany();

        Collection<UUID> scopedEmployeeIds = resolveEmployeeScope(companyId, employeeId, departmentId);
        List<LeaveRequest> requests = leaveRequestRepository.findForReport(
                companyId, from, to, employeeId, leaveTypeId, scopedEmployeeIds);

        Map<UUID, Employee> employees = buildEmployeeMap(companyId, requests);
        Map<UUID, String> deptNames = buildDeptNameMap(employees.values());
        Map<UUID, String> leaveTypeNames = buildLeaveTypeNameMap(companyId);

        List<LeaveReportRow> rows = requests.stream()
                .map(lr -> toRow(lr, employees, deptNames, leaveTypeNames))
                .toList();

        Map<String, BigDecimal> totalsByType = rows.stream()
                .collect(Collectors.groupingBy(
                        LeaveReportRow::leaveType,
                        Collectors.reducing(BigDecimal.ZERO, LeaveReportRow::workingDays, BigDecimal::add)));

        BigDecimal grandTotal = rows.stream()
                .map(LeaveReportRow::workingDays)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new LeaveReportResponse(rows, totalsByType, grandTotal);
    }

    public byte[] exportCsv(LocalDate from, LocalDate to,
                            UUID employeeId, UUID departmentId, UUID leaveTypeId) {
        LeaveReportResponse report = getLeaveReport(from, to, employeeId, departmentId, leaveTypeId);

        StringBuilder sb = new StringBuilder();
        sb.append("Employee,Employee Number,Department,Leave Type,Start Date,End Date,Working Days,Status\n");
        for (LeaveReportRow row : report.rows()) {
            sb.append(csv(row.employeeName())).append(',')
              .append(csv(row.employeeNumber())).append(',')
              .append(csv(row.department())).append(',')
              .append(csv(row.leaveType())).append(',')
              .append(row.startDate()).append(',')
              .append(row.endDate()).append(',')
              .append(row.workingDays()).append(',')
              .append(row.status()).append('\n');
        }
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    public byte[] exportPdf(LocalDate from, LocalDate to,
                            UUID employeeId, UUID departmentId, UUID leaveTypeId) throws IOException {
        LeaveReportResponse report = getLeaveReport(from, to, employeeId, departmentId, leaveTypeId);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate(), 30, 30, 30, 30);
        PdfWriter.getInstance(doc, baos);
        doc.open();

        Font titleFont = new Font(Font.HELVETICA, 14, Font.BOLD);
        Font subFont  = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.GRAY);
        Font headerFont = new Font(Font.HELVETICA, 8, Font.BOLD, Color.WHITE);
        Font cellFont   = new Font(Font.HELVETICA, 8);

        Paragraph title = new Paragraph("Leave & Absence Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);

        Paragraph sub = new Paragraph("Period: " + from + " — " + to, subFont);
        sub.setAlignment(Element.ALIGN_CENTER);
        sub.setSpacingAfter(12);
        doc.add(sub);

        String[] headers = {"Employee", "Emp #", "Department", "Leave Type", "From", "To", "Days", "Status"};
        PdfPTable table = new PdfPTable(headers.length);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3, 1.5f, 2, 2, 1.5f, 1.5f, 1, 1.5f});

        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(new Color(59, 130, 246));
            cell.setPadding(5);
            cell.setBorderColor(Color.WHITE);
            table.addCell(cell);
        }

        for (LeaveReportRow row : report.rows()) {
            addCell(table, row.employeeName(), cellFont);
            addCell(table, Objects.toString(row.employeeNumber(), ""), cellFont);
            addCell(table, Objects.toString(row.department(), ""), cellFont);
            addCell(table, row.leaveType(), cellFont);
            addCell(table, row.startDate().toString(), cellFont);
            addCell(table, row.endDate().toString(), cellFont);
            addCell(table, row.workingDays().toPlainString(), cellFont);
            addCell(table, row.status(), cellFont);
        }
        doc.add(table);

        Font summaryFont = new Font(Font.HELVETICA, 9, Font.BOLD);
        Paragraph summary = new Paragraph("\nTotal: " + report.grandTotal() + " days", summaryFont);
        summary.setSpacingBefore(8);
        doc.add(summary);

        doc.close();
        return baos.toByteArray();
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(4);
        table.addCell(cell);
    }

    private Collection<UUID> resolveEmployeeScope(UUID companyId, UUID employeeId, UUID departmentId) {
        if (employeeId != null) return null;
        if (departmentId != null) {
            return employeeRepository.findByCompanyIdAndDepartmentId(companyId, departmentId)
                    .stream().map(Employee::getId).toList();
        }
        return null;
    }

    private Map<UUID, Employee> buildEmployeeMap(UUID companyId, List<LeaveRequest> requests) {
        Set<UUID> ids = requests.stream().map(LeaveRequest::getEmployeeId).collect(Collectors.toSet());
        if (ids.isEmpty()) return Map.of();
        return employeeRepository.findByCompanyId(companyId).stream()
                .filter(e -> ids.contains(e.getId()))
                .collect(Collectors.toMap(Employee::getId, e -> e));
    }

    private Map<UUID, String> buildDeptNameMap(Collection<Employee> employees) {
        Set<UUID> deptIds = employees.stream()
                .filter(e -> e.getDepartmentId() != null)
                .map(Employee::getDepartmentId)
                .collect(Collectors.toSet());
        if (deptIds.isEmpty()) return Map.of();
        return departmentRepository.findAllById(deptIds).stream()
                .collect(Collectors.toMap(Department::getId, Department::getName));
    }

    private Map<UUID, String> buildLeaveTypeNameMap(UUID companyId) {
        return leaveTypeRepository.findByCompanyIdOrderByNameAsc(companyId).stream()
                .collect(Collectors.toMap(LeaveType::getId, LeaveType::getName));
    }

    private LeaveReportRow toRow(LeaveRequest lr, Map<UUID, Employee> employees,
                                  Map<UUID, String> deptNames, Map<UUID, String> typeNames) {
        Employee emp = employees.get(lr.getEmployeeId());
        String name = emp != null ? emp.getFirstName() + " " + emp.getLastName() : "Unknown";
        String empNum = emp != null ? emp.getEmployeeNumber() : null;
        String dept = (emp != null && emp.getDepartmentId() != null)
                ? deptNames.getOrDefault(emp.getDepartmentId(), "") : "";
        String typeName = typeNames.getOrDefault(lr.getLeaveTypeId(), "Unknown");
        return new LeaveReportRow(lr.getId(), name, empNum, dept, typeName,
                lr.getStartDate(), lr.getEndDate(), lr.getWorkingDays(), lr.getStatus().name());
    }

    private String csv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
