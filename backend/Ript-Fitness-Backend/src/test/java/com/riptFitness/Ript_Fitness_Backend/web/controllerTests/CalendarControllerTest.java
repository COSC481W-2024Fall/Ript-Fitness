package com.riptFitness.Ript_Fitness_Backend.web.controllerTests;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.riptFitness.Ript_Fitness_Backend.infrastructure.config.JwtUtil;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.config.SecurityConfig;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.CalendarService;
import com.riptFitness.Ript_Fitness_Backend.web.controller.CalendarController;
import com.riptFitness.Ript_Fitness_Backend.web.dto.CalendarDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.WorkoutsDto;

@WebMvcTest(CalendarController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
public class CalendarControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private CalendarService calendarService;

	@MockBean
	private JwtUtil jwtUtil;

	@BeforeEach
	public void setUp() {
		when(jwtUtil.extractUsername(any(String.class))).thenReturn("test-user");
	}

	@Test
	public void testLogWorkoutDay() throws Exception {
	    mockMvc.perform(post("/calendar/logWorkout")
	            .param("workoutId", "101")
	            .header("Authorization", "Bearer test-token")
	            .contentType(MediaType.APPLICATION_JSON))
	        .andExpect(status().isOk());
	}


	@Test
	public void testLogRestDay() throws Exception {
		mockMvc.perform(post("/calendar/logRestDay?timeZone=Etc/GMT%2B5").header("Authorization", "Bearer test-token")
				.contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk());
	}

	@Test
	public void testGetMonth() throws Exception {
	    CalendarDto calendarDto = new CalendarDto(LocalDateTime.parse("2024-11-01T00:00:00"), 1, "America/New_York");

	    when(calendarService.getMonth(any(LocalDateTime.class), any(LocalDateTime.class)))
	            .thenReturn(List.of(calendarDto));

	    mockMvc.perform(get("/calendar/getMonth")
	            .param("startYear", "2024")
	            .param("startMonth", "11")
	            .param("endYear", "2024")
	            .param("endMonth", "11")
	            .header("Authorization", "Bearer test-token")
	            .contentType(MediaType.APPLICATION_JSON))
	            .andExpect(status().isOk())
	            .andExpect(jsonPath("$[0].date").value("2024-11-01T00:00:00")) // Check the date value
	            .andExpect(jsonPath("$[0].activityType").value(1)) // Check the activityType value
	            .andExpect(jsonPath("$[0].timeZoneWhenLogged").value("America/New_York")); // Check the new timezone field
	}
	
	@Test
	public void testGetWorkoutsByDate() throws Exception {
	    // Given
	    String testDate = "2025-03-18";

	    WorkoutsDto workout1 = new WorkoutsDto();
	    workout1.setName("Push Day");
	    workout1.setWorkoutDate(LocalDate.parse(testDate));

	    WorkoutsDto workout2 = new WorkoutsDto();
	    workout2.setName("Pull Day");
	    workout2.setWorkoutDate(LocalDate.parse(testDate));

	    when(calendarService.getWorkoutsByDate(LocalDate.parse(testDate)))
	        .thenReturn(List.of(workout1, workout2));

	    // When/Then
	    mockMvc.perform(get("/calendar/getWorkoutsByDate/{date}", testDate)
	            .header("Authorization", "Bearer test-token")
	            .contentType(MediaType.APPLICATION_JSON))
	            .andExpect(status().isOk())
	            .andExpect(jsonPath("$.length()").value(2))
	            .andExpect(jsonPath("$[0].name").value("Push Day"))
	            .andExpect(jsonPath("$[1].name").value("Pull Day"));
	}


}
