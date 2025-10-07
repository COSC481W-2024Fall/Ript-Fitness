package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import org.springframework.stereotype.Service;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.PlateCalculatorMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.PlateCalculator;
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
	
	public int[] addPlateCalculation(PlateCalculatorDto plateCalculatorDto) {
		PlateCalculator plateCalculatorToBeAdded = PlateCalculatorMapper.INSTANCE.toPlateCalculator(plateCalculatorDto);
		double totalWeight = plateCalculatorDto.totalWeight;
		totalWeight -= plateCalculatorDto.weightOfBar;
		
		if (totalWeight < 0)
			throw new RuntimeException("The weight of the bar cannot be heavier than the total weight!");
		
		double[] availablePlatesAccountingForBothSidesOfBar = new double[plateCalculatorDto.platesAvailable.length];
		
		for (int i = 0; i < availablePlatesAccountingForBothSidesOfBar.length; i++) {
			availablePlatesAccountingForBothSidesOfBar[i] = plateCalculatorDto.platesAvailable[i] * 2;
		}
		
		double[] numberOfPlatesPerWeightOnEachSide = new double[availablePlatesAccountingForBothSidesOfBar.length];
		int indexOfNumberOfPlatesArray = 0;
		
		for (int i = availablePlatesAccountingForBothSidesOfBar.length - 1; i >= 0; i--) {
			double weightOfNextPlate = availablePlatesAccountingForBothSidesOfBar[i];
			int numberOfPlatesUsedForNextPlate = (int) (totalWeight / weightOfNextPlate);
			totalWeight = totalWeight % weightOfNextPlate;
			numberOfPlatesPerWeightOnEachSide[indexOfNumberOfPlatesArray] = numberOfPlatesUsedForNextPlate;
			indexOfNumberOfPlatesArray++;
		}
		
		if (totalWeight != 0)
			throw new RuntimeException("The total weight desired is not possible with the given plate weights.");
		
		int[] numberOfPlatesPerWeightOnBar = new int[numberOfPlatesPerWeightOnEachSide.length];
		
		for (int i = 0; i < numberOfPlatesPerWeightOnBar.length; i++) {
			numberOfPlatesPerWeightOnBar[i] = (int) (numberOfPlatesPerWeightOnEachSide[i] * 2);
		}
		
		return numberOfPlatesPerWeightOnBar;
	}
}
