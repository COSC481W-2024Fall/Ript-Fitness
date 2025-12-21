package com.riptFitness.Ript_Fitness_Backend.web.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
	
	@GetMapping("/getAllPlateCalculationsForUser")
	public ResponseEntity<List<PlateCalculatorDto>> getAllPlateCalculationsForUser() {
		List<PlateCalculatorDto> plateCalculationsForUser = plateCalculatorService.getAllPlateCalculationsForUser();
		return new ResponseEntity<>(plateCalculationsForUser, HttpStatus.OK);
	}
	
	@GetMapping("/getPlateCalculatorById/{id}")
	public ResponseEntity<PlateCalculatorDto> getPlateCalculatorById(@PathVariable Long id) {
		PlateCalculatorDto returnedPlateCalculator = plateCalculatorService.getPlateCalculationById(id);
		return new ResponseEntity<>(returnedPlateCalculator, HttpStatus.OK);
	}
	
	@PutMapping("/editPlateCalculation/{id}")
	public ResponseEntity<PlateCalculatorDto> editPlateCalculation(@PathVariable Long id, @RequestBody PlateCalculatorDto plateCalculator) {
		PlateCalculatorDto editedPlateCalculation = plateCalculatorService.editPlateCalculation(id, plateCalculator);
		return new ResponseEntity<>(editedPlateCalculation, HttpStatus.OK);
	}
}
