package com.riptFitness.Ript_Fitness_Backend.web.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.PlateCalculatorService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.PlateCalculatorDto;

@RestController
@RequestMapping("/plateCalculator")
public class PlateCalculatorController {
	
	PlateCalculatorService plateCalculatorService;
	
	public PlateCalculatorController(PlateCalculatorService plateCalculatorService) {
		this.plateCalculatorService = plateCalculatorService;
	}
	
	@PostMapping("/addPlateCalculation")
	public ResponseEntity<PlateCalculatorDto> addPlateCalculation(@RequestBody PlateCalculatorDto plateCalculatorDto) {
		PlateCalculatorDto savedPlateCalculation = plateCalculatorService.addPlateCalculation(plateCalculatorDto);
		return new ResponseEntity<>(savedPlateCalculation, HttpStatus.CREATED);
	}
}
