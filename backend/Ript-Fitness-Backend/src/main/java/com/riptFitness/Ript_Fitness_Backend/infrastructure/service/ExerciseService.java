package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.ExerciseMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.ExerciseModel;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.ExerciseRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.ExerciseDto;

@Service // This annotation tells Spring to manage this class as a service bean
public class ExerciseService {
	// Create an instance of the repository layer & accounts service layer:
	private final ExerciseRepository exerciseRepository;
	private final AccountsRepository accountsRepository;
	private final AccountsService accountsService;

	// Constructor:
	public ExerciseService(ExerciseRepository exerciseRepository, AccountsService accountsService,
			AccountsRepository accountsRepository) {
		this.exerciseRepository = exerciseRepository;
		this.accountsService = accountsService;
		this.accountsRepository = accountsRepository;
	}

	// Method to add a new exercise:
	public ExerciseDto addExercise(ExerciseDto exerciseDto) {
		// Get the ID of the user that is trying to add the exercise:
		Long currentUserId = accountsService.getLoggedInUserId();

		// Retrieve the account associated with the current user
		AccountsModel account = accountsRepository.findById(currentUserId)
				.orElseThrow(() -> new RuntimeException("Account not found"));

		// Convert DTO to model
		ExerciseModel newExercise = ExerciseMapper.INSTANCE.convertToModel(exerciseDto);

		// Set the account in the ExerciseModel
		newExercise.setAccount(account);

		// Save the exercise to the database:
		exerciseRepository.save(newExercise);

		// Convert the saved entity back to DTO and return
		return ExerciseMapper.INSTANCE.convertToDto(newExercise);
	}

	// Method to delete an exercise:
	public ExerciseDto deleteExercise(Long exerciseId) {
		// Get the account ID using JWT:
		Long currentUserId = accountsService.getLoggedInUserId();

		// Get a List exercises that are associated with that user, try to match the
		// exercise ID that was given:
		List<ExerciseModel> exercisesToDelete = exerciseRepository.findByAccountIdAndNotDeleted(currentUserId);

		// Given a list of exercises associated with currently logged in user, mark the
		// exercise deleted if the 'exerciseId' matches exercise_id in DB:
		ExerciseDto deletedExercise = null;
		for (ExerciseModel exercise : exercisesToDelete) {
			Long currentExerciseId = exercise.getExerciseId();
			if (currentExerciseId.equals(exerciseId)) {
				// Set deleted to true
				exercise.setIsDeleted(true);
				// Save the model in the database
				exerciseRepository.save(exercise);
				deletedExercise = ExerciseMapper.INSTANCE.convertToDto(exercise);
				break;
			}
		}

		// If no exercise was found to delete, throw an exception or return a message:
		if (deletedExercise == null) {
			throw new RuntimeException("Exercise not found for the current user.");
		}

		return deletedExercise;
	}

	// Method to edit the reps on an exercise:
	public ExerciseDto editReps(Long exerciseId, int setNumber, int rep) {
		// Since the exercise_id is unique; we do not need to worry about who is logged
		// in:
		ExerciseModel editedReps = exerciseRepository.getReferenceById(exerciseId);
		// Edit the reps:
		return null;
	}

}
