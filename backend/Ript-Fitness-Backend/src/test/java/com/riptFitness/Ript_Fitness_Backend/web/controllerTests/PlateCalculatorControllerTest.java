package com.riptFitness.Ript_Fitness_Backend.web.controllerTests;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.config.JwtUtil;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.config.SecurityConfig;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.PlateCalculatorService;
import com.riptFitness.Ript_Fitness_Backend.web.controller.PlateCalculatorController;
import com.riptFitness.Ript_Fitness_Backend.web.dto.PlateCalculatorDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.PlateCountDto;

@WebMvcTest(PlateCalculatorController.class)
@ActiveProfiles("test")
@Import(SecurityConfig.class)
public class PlateCalculatorControllerTest {

	@Autowired
	private MockMvc mockMvc;
	
	@MockBean
	private static PlateCalculatorService plateCalculatorService;
	
	@Autowired
	private ObjectMapper objectMapper;
	
	@MockBean
	private JwtUtil jwtUtil;
	
	@MockBean
	private UserDetailsService userDetailsService;

	private PlateCalculatorDto plateCalculatorRequestDto;
	private PlateCalculatorDto plateCalculatorResponseDto;
	private PlateCountDto twoPointFivePlateCountDto;
	private PlateCountDto fivePlateCountDto;
	private PlateCountDto tenPlateCountDto;
	private PlateCountDto twentyFivePlateCountDto;
	private PlateCountDto fortyFivePlateCountDto;

	
	@BeforeAll
	public void setup() {
		plateCalculatorRequestDto = new PlateCalculatorDto();
		plateCalculatorRequestDto.totalWeight = 235;
		plateCalculatorRequestDto.platesAvailable = new double[] {2.5, 5, 10, 25, 35, 45};
		plateCalculatorRequestDto.weightOfBar = 45;
		
		plateCalculatorResponseDto = new PlateCalculatorDto();
		plateCalculatorResponseDto.totalWeight = 235;
		plateCalculatorResponseDto.platesAvailable = new double[] {2.5, 5, 10, 25, 35, 45};
		plateCalculatorResponseDto.weightOfBar = 45;
		
		twoPointFivePlateCountDto = new PlateCountDto();
		twoPointFivePlateCountDto.plateWeight = 2.5;
		twoPointFivePlateCountDto.numberOfPlates = 0;
		
		fivePlateCountDto = new PlateCountDto();
		fivePlateCountDto.plateWeight = 5;
		fivePlateCountDto.numberOfPlates = 2;
		
		tenPlateCountDto = new PlateCountDto();
		tenPlateCountDto.plateWeight = 10;
		tenPlateCountDto.numberOfPlates = 0;
		
		twentyFivePlateCountDto = new PlateCountDto();
		twentyFivePlateCountDto.plateWeight = 25;
		twentyFivePlateCountDto.numberOfPlates = 0;
		
		fortyFivePlateCountDto = new PlateCountDto();
		fortyFivePlateCountDto.plateWeight = 45;
		fortyFivePlateCountDto.numberOfPlates = 2;
		
		plateCalculatorResponseDto.plateCounts = List.of(twoPointFivePlateCountDto, fivePlateCountDto, tenPlateCountDto, twentyFivePlateCountDto, fortyFivePlateCountDto);
	}
	
	@AfterAll
	public static void tearDown() {
		reset(plateCalculatorService);
	}
	
	@Test
	public void testAddPlateCalculation() throws JsonProcessingException, Exception {
		when(plateCalculatorService.addPlateCalculation(any(PlateCalculatorDto.class))).thenReturn(plateCalculatorResponseDto);
		
		mockMvc.perform(post("/plateCalculator/addPlateCalculation")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsBytes(plateCalculatorRequestDto)))
				.andExpect(status().isCreated())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.totalWeight").value(235))
				.andExpect(jsonPath("$.weightOfBar").value(45))
				.andExpect(jsonPath("$.platesAvailable[0]").value(2.5))
				.andExpect(jsonPath("$.plateCounts[1].plateWeight").value(5))
				.andExpect(jsonPath("$.plateCounts[4].numberOfPlates").value(2))
				.andReturn();
	}
}
