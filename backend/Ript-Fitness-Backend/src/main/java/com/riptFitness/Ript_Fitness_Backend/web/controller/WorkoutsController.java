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

import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.WorkoutsService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.WorkoutsDto;

@RestController
@RequestMapping("/workouts")
public class WorkoutsController {
	
	public WorkoutsService workoutsService;
	
	public WorkoutsController(WorkoutsService workoutsService) {
		this.workoutsService = workoutsService;
		
	}
	
	@PostMapping("/addWorkout")
	public ResponseEntity<WorkoutsDto> addWorkout(@RequestBody WorkoutsDto workoutDto){
		WorkoutsDto newWorkout = workoutsService.addWorkout(workoutDto);
		return ResponseEntity.ok(newWorkout);
	}
	
	// Retrieve a workout by ID
    @GetMapping("/{workoutId}")
    public ResponseEntity<WorkoutsDto> getWorkout(@PathVariable Long workoutId) {
        WorkoutsDto workoutDto = workoutsService.getWorkout(workoutId);
        return ResponseEntity.ok(workoutDto);
    }
    
    @GetMapping("/getUsersWorkouts")
    public ResponseEntity<List<WorkoutsDto>> getUsersWorkouts() {
        List<WorkoutsDto> userWorkouts = workoutsService.getUsersWorkouts();
        return ResponseEntity.ok(userWorkouts);
    }

    // Update an existing workout
    @PutMapping("updateWorkout/{workoutId}")
    public ResponseEntity<WorkoutsDto> updateWorkout(@PathVariable Long workoutId, @RequestBody WorkoutsDto workoutsDto) {
        WorkoutsDto updatedWorkout = workoutsService.updateWorkout(workoutId, workoutsDto);
        return ResponseEntity.ok(updatedWorkout);
    }

    // Delete a workout by setting isDeleted flag to true
    @DeleteMapping("/deleteWorkout/{workoutId}")
    public ResponseEntity<WorkoutsDto> deleteWorkout(@PathVariable Long workoutId) {
        WorkoutsDto deletedWorkout = workoutsService.deleteWorkout(workoutId);
        return ResponseEntity.ok(deletedWorkout);
    }
	
}