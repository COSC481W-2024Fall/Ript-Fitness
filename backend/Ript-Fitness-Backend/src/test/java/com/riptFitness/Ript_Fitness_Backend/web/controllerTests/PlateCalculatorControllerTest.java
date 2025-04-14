package com.riptFitness.Ript_Fitness_Backend.web.controllerTests;

import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.riptFitness.Ript_Fitness_Backend.infrastructure.config.GlobalExceptionHandler;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.PlateCalculatorService;
import com.riptFitness.Ript_Fitness_Backend.web.controller.PlateCalculatorController;

class PlateCalculatorControllerTest {

	private MockMvc mockMvc;

	@Mock
	private PlateCalculatorService plateCalculatorService;

	@InjectMocks
	private PlateCalculatorController plateCalculatorController;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
		mockMvc = MockMvcBuilders.standaloneSetup(plateCalculatorController).setControllerAdvice(new GlobalExceptionHandler()).build();
	}

	@Test
	void testGetPlateCombination_ValidWeight() throws Exception {
	    double inputWeight = 555.0;
	    List<Double> mockPlates = List.of(45.0, 45.0, 45.0, 45.0, 45.0, 25.0, 5.0);

	    when(plateCalculatorService.getPlatesFor(anyDouble())).thenReturn(mockPlates);

	    mockMvc.perform(get("/api/plates")
	            .param("weight", String.valueOf(inputWeight)))
	        .andDo(print())  // helps confirm the exact structure
	        .andExpect(status().isOk())
	        // Because the root is an array, use [0]
	        .andExpect(jsonPath("$.totalWeight").value(inputWeight))
	        .andExpect(jsonPath("$.platesOnOneSide[0]").value(45.0))
	        .andExpect(jsonPath("$.platesOnOneSide[1]").value(45.0))
	        .andExpect(jsonPath("$.platesOnOneSide[2]").value(45.0))
	        .andExpect(jsonPath("$.platesOnOneSide[3]").value(45.0))
	        .andExpect(jsonPath("$.platesOnOneSide[4]").value(45.0))
	        .andExpect(jsonPath("$.platesOnOneSide[5]").value(25.0))
	        .andExpect(jsonPath("$.platesOnOneSide[6]").value(5.0));
	}

	@Test
	public void testGetPlateCombination_InvalidWeight() throws Exception {
	    // Make sure your mock throws for negative weight
	    when(plateCalculatorService.getPlatesFor(-50.0))
	        .thenThrow(new IllegalArgumentException("Total weight cannot be negative."));

	    mockMvc.perform(get("/api/plates").param("weight", "-50"))
	        .andExpect(status().isInternalServerError())
	        .andExpect(content().string("An unexpected error has occurred. Message: Total weight cannot be negative."));
	}


}