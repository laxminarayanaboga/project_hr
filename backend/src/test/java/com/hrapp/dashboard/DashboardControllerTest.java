package com.hrapp.dashboard;

import com.hrapp.common.exception.GlobalExceptionHandler;
import com.hrapp.dashboard.dto.ManagerDashboardResponse;
import com.hrapp.dashboard.dto.TeamAbsenceStats;
import com.hrapp.dashboard.dto.UpcomingLeaveEntry;
import com.hrapp.dashboard.dto.WhoIsOffEntry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

    @Mock DashboardService dashboardService;
    @InjectMocks DashboardController controller;

    private MockMvc mvc;
    private final UUID EMP_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    private ManagerDashboardResponse stubResponse() {
        WhoIsOffEntry off = new WhoIsOffEntry(EMP_ID, "Bob Smith", "Annual Leave",
                LocalDate.now(), LocalDate.now().plusDays(1));
        UpcomingLeaveEntry upcoming = new UpcomingLeaveEntry(EMP_ID, "Bob Smith", "Annual Leave",
                LocalDate.now().plusDays(5), LocalDate.now().plusDays(7), BigDecimal.valueOf(2));
        TeamAbsenceStats stats = new TeamAbsenceStats(EMP_ID, "Bob Smith",
                BigDecimal.valueOf(2), BigDecimal.valueOf(9.1));
        return new ManagerDashboardResponse(List.of(off), List.of(upcoming), List.of(stats));
    }

    @Test
    void getManagerStats_returns200() throws Exception {
        when(dashboardService.getManagerStats()).thenReturn(stubResponse());

        mvc.perform(get("/api/v1/dashboard/manager-stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.whoIsOffToday[0].name").value("Bob Smith"))
                .andExpect(jsonPath("$.data.upcomingLeaves[0].leaveType").value("Annual Leave"))
                .andExpect(jsonPath("$.data.absenceStats[0].daysAbsentThisMonth").value(2));
    }

    @Test
    void getManagerStats_returnsEmptyLists_whenNoTeam() throws Exception {
        when(dashboardService.getManagerStats()).thenReturn(
                new ManagerDashboardResponse(List.of(), List.of(), List.of()));

        mvc.perform(get("/api/v1/dashboard/manager-stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.whoIsOffToday").isArray())
                .andExpect(jsonPath("$.data.whoIsOffToday").isEmpty());
    }
}
