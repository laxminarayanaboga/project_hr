package com.hrapp.company;

import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.company.dto.CompanyProfileResponse;
import com.hrapp.company.dto.CompanyStatsResponse;
import com.hrapp.company.dto.UpdateCompanyRequest;
import com.hrapp.department.Department;
import com.hrapp.department.DepartmentRepository;
import com.hrapp.employee.Employee;
import com.hrapp.employee.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private static final Path UPLOAD_DIR = Paths.get("uploads/logos");

    private final CompanyRepository companyRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public CompanyProfileResponse getProfile() {
        Company company = findCurrentCompany();
        return CompanyProfileResponse.from(company);
    }

    @Transactional
    public CompanyProfileResponse updateProfile(UpdateCompanyRequest request) {
        Company company = findCurrentCompany();
        company.setName(request.name());
        company.setPhone(request.phone());
        company.setAddress(request.address());
        if (request.country() != null && !request.country().isBlank()) {
            company.setCountry(request.country());
        }
        return CompanyProfileResponse.from(companyRepository.save(company));
    }

    @Transactional
    public CompanyProfileResponse uploadLogo(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        String originalFilename = file.getOriginalFilename();
        String ext = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : ".png";

        Files.createDirectories(UPLOAD_DIR);
        String filename = UUID.randomUUID() + ext;
        Path destination = UPLOAD_DIR.resolve(filename);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        Company company = findCurrentCompany();
        company.setLogoUrl("/uploads/logos/" + filename);
        return CompanyProfileResponse.from(companyRepository.save(company));
    }

    @Transactional(readOnly = true)
    public CompanyStatsResponse getStats() {
        UUID companyId = TenantContext.getCurrentCompany();

        long total = employeeRepository.countByCompanyId(companyId);
        long active = employeeRepository.countByCompanyIdAndEmploymentStatus(companyId, "ACTIVE");
        long departments = departmentRepository.countByCompanyId(companyId);

        LocalDate firstOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate today = LocalDate.now();
        long newHires = employeeRepository.countByCompanyIdAndStartDateBetween(companyId, firstOfMonth, today);

        List<Employee> recent = employeeRepository.findRecentByCompanyId(companyId, PageRequest.of(0, 5));

        Map<UUID, String> deptNames = departmentRepository.findAllById(
                recent.stream()
                        .filter(e -> e.getDepartmentId() != null)
                        .map(Employee::getDepartmentId)
                        .collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(Department::getId, Department::getName));

        List<CompanyStatsResponse.RecentHire> recentHires = recent.stream()
                .map(e -> new CompanyStatsResponse.RecentHire(
                        e.getId(),
                        e.getFirstName(),
                        e.getLastName(),
                        e.getJobTitle(),
                        e.getDepartmentId() != null ? deptNames.get(e.getDepartmentId()) : null
                ))
                .toList();

        return new CompanyStatsResponse(total, active, departments, newHires, recentHires);
    }

    private Company findCurrentCompany() {
        return companyRepository.findById(TenantContext.getCurrentCompany())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
    }
}
