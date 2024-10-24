package com.riptFitness.Ript_Fitness_Backend.web.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.riptFitness.Ript_Fitness_Backend.domain.model.ExerciseModel;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.ExerciseService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.ExerciseDto;

@RestController // Always put this at he top of the controller class
@RequestMapping("/exercises") // Put this underneath the RestController annotation
public class ExercisesController {
	
	// Create an instance of the Exercise Service class so that the endpoints can call methods (business logic) that are defined in the service class
	public ExerciseService exerciseService;
	
	// Constructor for controller class:
	public ExercisesController(ExerciseService exerciseService) {
		this.exerciseService = exerciseService;
	}
	
	
	// Endpoint for adding an exercise:
	@PostMapping("/addExercise")
	public ResponseEntity <ExerciseDto> addExercise(@RequestBody ExerciseDto exerciseDto) {
		// Attempt to create/add a new exercise:
		ExerciseDto addedExercise = exerciseService.addExercise(exerciseDto);
		return new ResponseEntity<>(addedExercise, HttpStatus.CREATED);
	}
	
	// Endpoint for deleting an exercise:
	@DeleteMapping("/deleteExercise/{exerciseId}")
	public ResponseEntity <ExerciseDto> deleteExercise(@PathVariable Long exerciseId) {
		// Attempty to delete the given exercise:
		ExerciseDto deletedExercise = exerciseService.deleteExercise(exerciseId);
		return new ResponseEntity<>(deletedExercise, HttpStatus.NO_CONTENT);
	}
	

}
