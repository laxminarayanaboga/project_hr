package com.hrapp.employee;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeRepositoryTest {

    @Mock
    EmployeeRepository employeeRepository;

    private Employee stubEmployee(UUID companyId, String firstName) {
        Employee e = new Employee();
        e.setId(UUID.randomUUID());
        e.setCompanyId(companyId);
        e.setFirstName(firstName);
        e.setLastName("Smith");
        e.setEmploymentStatus("ACTIVE");
        e.setStartDate(LocalDate.now());
        return e;
    }

    // ── findRecentByCompanyId ─────────────────────────────────────────────────

    @Test
    void findRecentByCompanyId_returnsEmployeesForCompany() {
        UUID companyId = UUID.randomUUID();
        List<Employee> expected = List.of(stubEmployee(companyId, "Alice"), stubEmployee(companyId, "Bob"));

        when(employeeRepository.findRecentByCompanyId(companyId, PageRequest.of(0, 5)))
                .thenReturn(expected);

        List<Employee> result = employeeRepository.findRecentByCompanyId(companyId, PageRequest.of(0, 5));

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getFirstName()).isEqualTo("Alice");
        assertThat(result.get(1).getFirstName()).isEqualTo("Bob");
    }

    @Test
    void findRecentByCompanyId_respectsPageLimit() {
        UUID companyId = UUID.randomUUID();
        List<Employee> fiveEmployees = List.of(
                stubEmployee(companyId, "A"), stubEmployee(companyId, "B"),
                stubEmployee(companyId, "C"), stubEmployee(companyId, "D"),
                stubEmployee(companyId, "E")
        );

        when(employeeRepository.findRecentByCompanyId(companyId, PageRequest.of(0, 5)))
                .thenReturn(fiveEmployees);

        List<Employee> result = employeeRepository.findRecentByCompanyId(companyId, PageRequest.of(0, 5));

        assertThat(result).hasSize(5);
    }

    @Test
    void findRecentByCompanyId_returnsEmptyList_whenNoEmployees() {
        UUID companyId = UUID.randomUUID();

        when(employeeRepository.findRecentByCompanyId(companyId, PageRequest.of(0, 5)))
                .thenReturn(List.of());

        List<Employee> result = employeeRepository.findRecentByCompanyId(companyId, PageRequest.of(0, 5));

        assertThat(result).isEmpty();
    }
}
