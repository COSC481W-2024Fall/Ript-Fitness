package com.riptFitness.Ript_Fitness_Backend.web.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.WorkoutsService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.WorkoutsDto;

@RestController
@RequestMapping("/workouts")
public class WorkoutsController {
	
	public WorkoutsService workoutsService;
	
	public WorkoutsController(WorkoutsService workoutsService) {
		this.workoutsService = workoutsService;
		
	}
	
	@PutMapping("/addWorkout")
	public ResponseEntity<WorkoutsDto> addWorkout(WorkoutsDto workoutDto){
		WorkoutsDto newWorkout = workoutsService.addWorkout(workoutDto);
		return ResponseEntity.ok(newWorkout);
	}
}
