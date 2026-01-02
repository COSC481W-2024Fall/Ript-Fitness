package com.riptFitness.Ript_Fitness_Backend.infrastructure.serviceTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.mapper.PlateCalculatorMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.PlateCalculator;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.PlateCalculatorRepository;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.AccountsService;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.PlateCalculatorService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.PlateCalculatorDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.PlateCountDto;


public class PlateCalculatorServiceTest {

	@Mock
	private PlateCalculatorRepository plateCalculatorRepository;
	
	@Mock
	private AccountsService accountsService;
	
	@Mock
	private AccountsRepository accountsRepository;
	
	@InjectMocks
	private PlateCalculatorService plateCalculatorService;
	
	private final ObjectMapper objectMapper = new ObjectMapper();
	
	private PlateCalculatorDto plateCalculatorDto;
	private PlateCalculator plateCalculator;
	private double[] platesAvailable = new double[] {2.5, 5, 10, 25, 35, 45};
	private List<PlateCountDto> expectedPlateCountDtoList;
	private AccountsModel account = new AccountsModel();
	
	@BeforeEach
	public void setUp() {
		MockitoAnnotations.openMocks(this);
		
		plateCalculatorDto = new PlateCalculatorDto();
		plateCalculator = new PlateCalculator();
				
		expectedPlateCountDtoList = new ArrayList<>();
		
		account.setId(1L);
		plateCalculator.account = account;
	}
	
	@Test
	void testAddPlateCalculationValid() {
		buildPlateCalculatorDto(plateCalculatorDto, 250, platesAvailable, 45);
		
		int[] expectedNumberOfPlates = new int[] {2, 0, 2, 0, 0, 4};
				
		buildExpectedPlateCountDtoList(platesAvailable, expectedNumberOfPlates);
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));
		when(plateCalculatorRepository.save(any(PlateCalculator.class))).thenReturn(plateCalculator);
		
		PlateCalculatorDto result = plateCalculatorService.addPlateCalculation(plateCalculatorDto);		
		
		assertNotNull(result);
		assertEquals(convertObjectToString(expectedPlateCountDtoList), convertObjectToString(result.plateCounts));		
	}
	
	@Test
	void testAddPlateCalculationInvalid_WeightOfBarHeavierThanTotalWeight() {
		buildPlateCalculatorDto(plateCalculatorDto, 40, platesAvailable, 45);
		
		RuntimeException exception = assertThrows(
			RuntimeException.class,
			() -> {
				plateCalculatorService.addPlateCalculation(plateCalculatorDto);
			}
		);
		
		assertNotNull(exception);
		assertEquals("The weight of the bar cannot be heavier than the total weight!", exception.getMessage());
	}
	
	@Test
	void testAddPlateCalculationInvalid_TotalWeightNotPossibleWithGivenPlatesAvailable() {
		buildPlateCalculatorDto(plateCalculatorDto, 249, platesAvailable, 45);
		
		RuntimeException exception = assertThrows(
			RuntimeException.class,
			() -> {
				plateCalculatorService.addPlateCalculation(plateCalculatorDto);
			}
		);
		
		assertNotNull(exception);
		assertEquals("The total weight desired is not possible with the given plate weights.", exception.getMessage());
	}
	
	@Test
	void testGetAllPlateCalculationsForUser() {
		ArrayList<PlateCalculator> returnedListOfPlateCalcualtors = new ArrayList<>(List.of(plateCalculator));
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));		
		when(plateCalculatorRepository.getPlateCalculatorsFromAccountId(1L)).thenReturn(Optional.of(returnedListOfPlateCalcualtors));
		
		List<PlateCalculatorDto> result = plateCalculatorService.getAllPlateCalculationsForUser();
		
		assertNotNull(result);
		assertEquals(1, result.size());
	}
	
	private void buildPlateCalculatorDto(PlateCalculatorDto plateCalculatorDto, double totalWeight, double[] platesAvailable, int weightOfBar) {
		plateCalculatorDto.totalWeight = totalWeight;
		plateCalculatorDto.platesAvailable = platesAvailable;
		plateCalculatorDto.weightOfBar = weightOfBar;
	}
	
	private void buildExpectedPlateCountDtoList(double[] plateWeights, int[] numberOfPlatesPerPlateWeight) {
		for (int i = 0; i < plateWeights.length; i++) {
			expectedPlateCountDtoList.add(new PlateCountDto(plateWeights[i], numberOfPlatesPerPlateWeight[i]));
		}
	}
	
	private String convertObjectToString(Object obj) {
		try {
			return objectMapper.writeValueAsString(obj);
		} catch (JsonProcessingException ex) {
			return "{}";
		}	
	}
}
