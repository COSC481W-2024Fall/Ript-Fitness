package com.riptFitness.Ript_Fitness_Backend.web.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.ExerciseService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.ExerciseDto;

@RestController // Always put this at he top of the controller class
@RequestMapping("/exercises") // Put this underneath the RestController annotation
public class ExercisesController {

	// Create an instance of the Exercise Service class so that the endpoints can
	// call methods (business logic) that are defined in the service class
	public ExerciseService exerciseService;

	// Constructor for controller class:
	public ExercisesController(ExerciseService exerciseService) {
		this.exerciseService = exerciseService;
	}

	// Endpoint for adding an exercise:
	@PostMapping("/addExercise")
	public ResponseEntity<ExerciseDto> addExercise(@RequestBody ExerciseDto exerciseDto) {
		ExerciseDto addedExercise = exerciseService.addExercise(exerciseDto);
		return new ResponseEntity<>(addedExercise, HttpStatus.CREATED);
	}

	// Endpoint for deleting an exercise:
	@DeleteMapping("/deleteExercise/{exerciseId}")
	public ResponseEntity<ExerciseDto> deleteExercise(@PathVariable Long exerciseId) {
		ExerciseDto deletedExercise = exerciseService.deleteExercise(exerciseId);
		return new ResponseEntity<>(deletedExercise, HttpStatus.NO_CONTENT);
	}

	// Endpoint for editing reps based on rep number
	@PutMapping("/editReps/{exerciseId}/{setNumber}/{newNumberOfReps}")
	public ResponseEntity<ExerciseDto> updateReps(@PathVariable Long exerciseId, @PathVariable int setNumber, @PathVariable int newNumberOfReps) {
		ExerciseDto editiedExercise = exerciseService.editReps(exerciseId, setNumber, newNumberOfReps);
		return new ResponseEntity<>(editiedExercise, HttpStatus.OK);
	}

	// Endpoint for editing number of sets
	@PutMapping("/editSets/{exerciseId}/{newNumberOfSets}")
	public ResponseEntity<ExerciseDto> updateSets(@PathVariable Long exerciseId, @PathVariable int newNumberOfSets) {
		ExerciseDto editiedExercise = exerciseService.editSets(exerciseId, newNumberOfSets);
		return new ResponseEntity<>(editiedExercise, HttpStatus.OK);
	}
	
	// Endpoint for editing an exercises name:
	@PutMapping("/editExerciseName/{exerciseId}/{newExerciseName}") 
	public ResponseEntity<ExerciseDto> editExerciseName(@PathVariable Long exerciseId, @PathVariable String newExerciseName) {
		ExerciseDto editiedExercise = exerciseService.editExerciseName(exerciseId, newExerciseName);
		return new ResponseEntity<>(editiedExercise, HttpStatus.OK);
	}
	
	// Endpoint for finding a workout by keyWord:
	@GetMapping("/findByKeyword/{keyword}") 
	public ResponseEntity<List<ExerciseDto>> editExerciseName(@PathVariable String keyword) {
		List<ExerciseDto> similarExercises = exerciseService.findByKeyword(keyword);
		return new ResponseEntity<>(similarExercises, HttpStatus.OK);
	}
	
	// Endpoint for getting a List of all exercises associated with account:
	@GetMapping("/getAllExercises/{nMostRecent}")
	public ResponseEntity<List<ExerciseDto>> getExercisesFromCurrentUser(@PathVariable int nMostRecent) {
	    List<ExerciseDto> usersExercises = exerciseService.getExercisesFromCurrentUser(nMostRecent);
	    return new ResponseEntity<>(usersExercises, HttpStatus.OK);
	}

	
	// Endpoint for editing weights for a specific set in an exercise
	@PutMapping("/editWeight/{exerciseId}/{setNumber}/{newWeight}")
	public ResponseEntity<ExerciseDto> editWeight(@PathVariable Long exerciseId, @PathVariable int setNumber, @PathVariable int newWeight) {
	    ExerciseDto editedExercise = exerciseService.editWeight(exerciseId, setNumber, newWeight);
	    return new ResponseEntity<>(editedExercise, HttpStatus.OK);
	}
	
	// Endpoint for updating Exercise with a Body insteead of path variable:
	@PutMapping("updateExercise")
	public ResponseEntity<ExerciseDto> updateExercise(@RequestBody ExerciseDto exerciseDto) {
		ExerciseDto updatedExercise = exerciseService.updateExercise(exerciseDto);
		return new ResponseEntity<>(updatedExercise, HttpStatus.OK);
	}

	// Endpoint for retrieving exercises by type
	@GetMapping("/getByType/{exerciseType}")
	public ResponseEntity<List<ExerciseDto>> getExercisesByType(@PathVariable int exerciseType) {
	    List<ExerciseDto> exercises = exerciseService.getExercisesByType(exerciseType);
	    return new ResponseEntity<>(exercises, HttpStatus.OK);
	}
	
	

	
}
