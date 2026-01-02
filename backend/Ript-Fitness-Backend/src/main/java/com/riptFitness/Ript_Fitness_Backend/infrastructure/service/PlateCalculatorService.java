package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.mapper.PlateCalculatorMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.PlateCalculator;
import com.riptFitness.Ript_Fitness_Backend.domain.model.PlateCount;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.PlateCalculatorRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.PlateCalculatorDto;

@Service
public class PlateCalculatorService {

	private PlateCalculatorRepository plateCalculatorRepository;
	
	private AccountsService accountsService;
	
	private AccountsRepository accountsRepository;

	public PlateCalculatorService(PlateCalculatorRepository plateCalculatorRepository, AccountsService accountsService, AccountsRepository accountsRepository) {
		this.plateCalculatorRepository = plateCalculatorRepository;
		this.accountsService = accountsService;
		this.accountsRepository = accountsRepository;
	}
	
	public PlateCalculatorDto addPlateCalculation(PlateCalculatorDto plateCalculatorDto) {
		PlateCalculator plateCalculatorToBeAdded = calculatePlateCountsFromDto(plateCalculatorDto);
		
		PlateCalculatorDto returnedDto = savePlateCalculatorToDatabase(plateCalculatorToBeAdded, plateCalculatorDto.platesAvailable);
		
		returnedDto.platesAvailable = plateCalculatorDto.platesAvailable;
		
		return returnedDto;
	}
	
	public List<PlateCalculatorDto> getAllPlateCalculationsForUser() {
		AccountsModel currentlyLoggedInUser = getCurrentlyLoggedInUser();
		ArrayList<PlateCalculator> plateCalcualationsForUserInDatabase = plateCalculatorRepository.getPlateCalculatorsFromAccountId(currentlyLoggedInUser.getId()).get();
		return PlateCalculatorMapper.INSTANCE.toPlateCalculatorDtoList(plateCalcualationsForUserInDatabase);	
	}
	
	public PlateCalculatorDto getPlateCalculationById(Long id) {
		PlateCalculator plateCalculatorReturnedFromDatabase = getPlateCalculatorFromDatabaseAndCheckItIsNotDeleted(id);
		
		return PlateCalculatorMapper.INSTANCE.toPlateCalculatorDto(plateCalculatorReturnedFromDatabase);
	}
	
	public PlateCalculatorDto editPlateCalculation(Long id, PlateCalculatorDto plateCalculatorDto) {
		PlateCalculator plateCalculatorToBeEdited = getPlateCalculatorFromDatabaseAndCheckItIsNotDeleted(id);
		
		PlateCalculatorMapper.INSTANCE.updatePlateCalculatorRowFromDto(plateCalculatorDto, plateCalculatorToBeEdited);
		
		AccountsModel currentlyLoggedInUser = getCurrentlyLoggedInUser();
		plateCalculatorToBeEdited.account = currentlyLoggedInUser;
		
		PlateCalculator plateCalculatorModelWithCorrectPlateCounts = calculatePlateCountsFromDto(plateCalculatorDto);
		
		plateCalculatorToBeEdited.plateCounts.clear();
		plateCalculatorToBeEdited.plateCounts.addAll(plateCalculatorModelWithCorrectPlateCounts.plateCounts);
		
		for (PlateCount plateCount : plateCalculatorToBeEdited.plateCounts) {
			plateCount.plateCalculator = plateCalculatorToBeEdited;
		}
		
		plateCalculatorRepository.save(plateCalculatorToBeEdited);
		
		return PlateCalculatorMapper.INSTANCE.toPlateCalculatorDto(plateCalculatorToBeEdited);
	}
	
	public PlateCalculatorDto deletePlateCalculation(Long id) {
		PlateCalculator plateCalculatorToBeDeleted = getPlateCalculatorFromDatabaseAndCheckItIsNotDeleted(id);
		
		plateCalculatorToBeDeleted.isDeleted = true;
		
		plateCalculatorRepository.save(plateCalculatorToBeDeleted);
		
		return PlateCalculatorMapper.INSTANCE.toPlateCalculatorDto(plateCalculatorToBeDeleted);
	}
	
	private static PlateCalculator calculatePlateCountsFromDto(PlateCalculatorDto plateCalculatorDto) {
		Arrays.sort(plateCalculatorDto.platesAvailable);
		PlateCalculator plateCalculator = PlateCalculatorMapper.INSTANCE.toPlateCalculator(plateCalculatorDto);
		double totalWeight = plateCalculator.totalWeight;
		totalWeight -= plateCalculator.weightOfBar;
		
		if (totalWeight < 0)
			throw new RuntimeException("The weight of the bar cannot be heavier than the total weight!");
		
		int[] numberOfPlatesPerWeightOnBar = calculateNumberOfPlatesPerWeightOnBar(plateCalculator, totalWeight, plateCalculatorDto.platesAvailable);

		mapIntegerArrayOfPlateCountsToListOfPlateCounts(numberOfPlatesPerWeightOnBar, plateCalculator, plateCalculatorDto.platesAvailable);
		
		return plateCalculator;
	}
	
	private static int[] calculateNumberOfPlatesPerWeightOnBar(PlateCalculator plateCalculator, double totalWeight, double[] platesAvailable) {
		double[] availablePlatesAccountingForBothSidesOfBar = new double[platesAvailable.length];
		
		for (int i = 0; i < availablePlatesAccountingForBothSidesOfBar.length; i++) {
			availablePlatesAccountingForBothSidesOfBar[i] = platesAvailable[i] * 2;
		}
		
		double[] numberOfPlatesPerWeightOnEachSide = new double[availablePlatesAccountingForBothSidesOfBar.length];
		
		for (int i = availablePlatesAccountingForBothSidesOfBar.length - 1; i >= 0; i--) {
			double weightOfNextPlate = availablePlatesAccountingForBothSidesOfBar[i];
			int numberOfPlatesUsedForNextPlate = (int) (totalWeight / weightOfNextPlate);
			totalWeight = totalWeight % weightOfNextPlate;
			numberOfPlatesPerWeightOnEachSide[i] = numberOfPlatesUsedForNextPlate;
		}
		
		if (totalWeight != 0)
			throw new RuntimeException("The total weight desired is not possible with the given plate weights.");
		
		int[] numberOfPlatesPerWeightOnBar = new int[numberOfPlatesPerWeightOnEachSide.length];
		
		for (int i = 0; i < numberOfPlatesPerWeightOnBar.length; i++) {
			numberOfPlatesPerWeightOnBar[i] = (int) (numberOfPlatesPerWeightOnEachSide[i] * 2);
		}
		
		return numberOfPlatesPerWeightOnBar;
	}
	
	private static void mapIntegerArrayOfPlateCountsToListOfPlateCounts(int[] plateCounts, PlateCalculator plateCalculator, double[] platesAvailable) {
		ArrayList<PlateCount> listOfPlateCounts = new ArrayList<>();
		
		for (int i = 0; i < plateCounts.length; i++) {
			listOfPlateCounts.add(new PlateCount(platesAvailable[i], plateCounts[i], plateCalculator));
		}
		
		plateCalculator.plateCounts = listOfPlateCounts;
	}
	
	private PlateCalculator getPlateCalculatorFromDatabaseAndCheckItIsNotDeleted(Long id) {
		Optional<PlateCalculator> optionalPlateCalculatorCurrentlyInDatabase = plateCalculatorRepository.findByIdAndIsDeletedFalse(id);
		
		if (optionalPlateCalculatorCurrentlyInDatabase.isEmpty())
			throw new RuntimeException("Plate Calculator object not found in database with ID = " + id);
		
		return optionalPlateCalculatorCurrentlyInDatabase.get();
	}
	
	private PlateCalculatorDto savePlateCalculatorToDatabase(PlateCalculator plateCalculator, double[] platesAvailable) {
		AccountsModel currentlyLoggedInAccount = getCurrentlyLoggedInUser();
		plateCalculator.account = currentlyLoggedInAccount;
		plateCalculator.platesAvailable = mapDoubleArrayToString(platesAvailable);
		plateCalculatorRepository.save(plateCalculator);
		return PlateCalculatorMapper.INSTANCE.toPlateCalculatorDto(plateCalculator);
	}
	
	private AccountsModel getCurrentlyLoggedInUser() {
		Long currentlyLoggedInUserId = accountsService.getLoggedInUserId();
		return accountsRepository.findById(currentlyLoggedInUserId).get();
	}
	
	private String mapDoubleArrayToString(double[] array) {
		ObjectMapper mapper = new ObjectMapper();
		
		try {
			return mapper.writeValueAsString(array);
		} catch (JsonProcessingException ex) {
			throw new RuntimeException("There was an error converting the platesAvailable array to a String in the mapDoubleArrayToString method.");
		}
	}
}
