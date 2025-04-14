package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.WorkoutsMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Day;
import com.riptFitness.Ript_Fitness_Backend.domain.model.ExerciseModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Workouts;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.ExerciseRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.WorkoutsRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.ExerciseDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.WorkoutsDto;

@Service
public class WorkoutsService {

	private WorkoutsRepository workoutsRepository;
	private final AccountsRepository accountsRepository;
	private final ExerciseRepository exerciseRepository;
	private final AccountsService accountsService;
	private final ExerciseService exerciseService;

	public WorkoutsService(WorkoutsRepository workoutsRepository, AccountsService accountsService,
			ExerciseService exerciseService, AccountsRepository accountsRepository,
			ExerciseRepository exerciseRepository) {
		this.workoutsRepository = workoutsRepository;
		this.accountsService = accountsService;
		this.accountsRepository = accountsRepository;
		this.exerciseService = exerciseService;
		this.exerciseRepository = exerciseRepository;
	}

	@Transactional
    public WorkoutsDto addWorkout(WorkoutsDto workoutsDto) {
        Long currentUserId = accountsService.getLoggedInUserId();
        AccountsModel account = accountsRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // Create a new Workouts entity and set its properties
        Workouts newWorkout = new Workouts();
        newWorkout.setName(workoutsDto.getName());
        newWorkout.setAccount(account); 
        
        if (workoutsDto.getWorkoutDate() != null) {
            newWorkout.setWorkoutDate(workoutsDto.getWorkoutDate());
        } else {
            newWorkout.setWorkoutDate(LocalDate.now());
        }

        List<ExerciseModel> exercises = new ArrayList<>();

        if (workoutsDto.getExerciseIds() != null) {
            for (Long exerciseId : workoutsDto.getExerciseIds()) {
                // Retrieve existing exercise by ID
                ExerciseModel exerciseModel = exerciseRepository.findById(exerciseId)
                        .orElseThrow(() -> new RuntimeException("Exercise not found with ID: " + exerciseId));

                // Verify that the exercise belongs to the current user
                if (!exerciseModel.getAccount().getId().equals(currentUserId)) {
                    throw new RuntimeException("Exercise does not belong to the current user");
                }

                // Add the exercise to the list
                exercises.add(exerciseModel);
            }
        }

        // Set exercises to the workout and save
        newWorkout.setExercises(exercises);
        workoutsRepository.save(newWorkout);

        // Map the saved workout to WorkoutsDto, including the exercises
        WorkoutsDto responseDto = WorkoutsMapper.INSTANCE.toWorkoutsDto(newWorkout);

        return responseDto;
    }


	// Retrieve a single workout object based on a workout Id
	@Transactional
	public WorkoutsDto getWorkout(Long workoutId) {
		Optional<Workouts> optionalWrkout = workoutsRepository.findById(workoutId);
		if (optionalWrkout.isEmpty()) {
			throw new RuntimeException("No workout found with id = " + workoutId);
		}
		Workouts workout = optionalWrkout.get();
		return WorkoutsMapper.INSTANCE.toWorkoutsDto(workout);

	}

	// Retrieves a list of workouts that have the foreign key of the current user
	public List<WorkoutsDto> getUsersWorkouts(Integer startIndex, Integer endIndex) {
		if(startIndex > endIndex)
			throw new RuntimeException("Start index cannot be greater than end index. Start index = " + startIndex + ", end index = " + endIndex);
	
		if(startIndex < 0 || endIndex < 0)
			throw new RuntimeException("Start index and end index must be greater than 0. Start index = " + startIndex + ", end index = " + endIndex);

		Long currentUserId = accountsService.getLoggedInUserId();
		AccountsModel account = accountsRepository.findById(currentUserId)
				.orElseThrow(() -> new RuntimeException("Account not found"));
		List<Workouts> workouts = workoutsRepository.findByAccountId(currentUserId);
		
		if (workouts.isEmpty()) {
	        return Collections.emptyList(); // Return an empty list if no workouts are found
	    }
		
		int workoutsSize = workouts.size();
		if(startIndex < 0 || startIndex > workoutsSize) {
			throw new RuntimeException("Start index out of bounds. Start index = "+ startIndex);
		}
		
		if(endIndex >= workoutsSize) {
			return WorkoutsMapper.INSTANCE.toListWorkoutsDto(workouts).subList(startIndex, workoutsSize);
		}

		return WorkoutsMapper.INSTANCE.toListWorkoutsDto(workouts).subList(startIndex, endIndex + 1);
	}

	//updates workout
	@Transactional
	public WorkoutsDto updateWorkout(Long workoutId, WorkoutsDto workoutsDto) {
	    Long currentUserId = accountsService.getLoggedInUserId();

	    // Retrieve the workout to be updated
	    Workouts workoutToBeUpdated = workoutsRepository.findById(workoutId)
	            .orElseThrow(() -> new RuntimeException("No workout found with id = " + workoutId));

	    // Verify that the workout belongs to the current user
	    if (!workoutToBeUpdated.getAccount().getId().equals(currentUserId)) {
	        throw new RuntimeException("You do not have permission to update this workout");
	    }

	    // Update the workout name if provided
	    if (workoutsDto.getName() != null) {
	        workoutToBeUpdated.setName(workoutsDto.getName());
	    }

	    // Update the exercises if exerciseIds are provided
	    if (workoutsDto.getExerciseIds() != null) {
	        List<ExerciseModel> newExercises = new ArrayList<>();

	        for (Long exerciseId : workoutsDto.getExerciseIds()) {
	            // Retrieve the exercise
	            ExerciseModel exerciseModel = exerciseRepository.findById(exerciseId)
	                    .orElseThrow(() -> new RuntimeException("Exercise not found with ID: " + exerciseId));

	            // Verify that the exercise belongs to the current user
	            if (!exerciseModel.getAccount().getId().equals(currentUserId)) {
	                throw new RuntimeException("Exercise with ID " + exerciseId + " does not belong to the current user");
	            }

	            newExercises.add(exerciseModel);
	        }

	        // Update the exercises associated with the workout
	        workoutToBeUpdated.setExercises(newExercises);
	    }

	    // Save the updated workout entity
	    Workouts updatedWorkout = workoutsRepository.save(workoutToBeUpdated);

	    // Map the updated workout to WorkoutsDto and return
	    WorkoutsDto responseDto = WorkoutsMapper.INSTANCE.toWorkoutsDto(updatedWorkout);
	    return responseDto;
	}


	public WorkoutsDto deleteWorkout(Long workoutId) {
		Optional<Workouts> optWorkoutToBeDeleted = workoutsRepository.findById(workoutId);

		if (optWorkoutToBeDeleted.isEmpty()) {
			throw new RuntimeException("Workouts object not found in database with id = " + workoutId);
		}
		Workouts workoutToBeDeleted = optWorkoutToBeDeleted.get();
		workoutToBeDeleted.isDeleted = true;
		workoutsRepository.save(workoutToBeDeleted);
		return WorkoutsMapper.INSTANCE.toWorkoutsDto(workoutToBeDeleted);
	}
	
	public Map<LocalDate, List<WorkoutsDto>> getWeeklyWorkoutTrends() {
        return getWorkoutTrendsForXDays(7);
    }

    public Map<LocalDate, List<WorkoutsDto>> getMonthlyWorkoutTrends() {
        return getWorkoutTrendsForXDays(30);
    }

	public Map<LocalDate, ExerciseDto> getWorkoutTrendsfor7Days() {
		Long currentlyLoggedInUserId = accountsService.getLoggedInUserId();
		LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);		
		return null;
	}
	
	private Map<LocalDate, List<WorkoutsDto>> getWorkoutTrendsForXDays(int days) {
	    Long userId = accountsService.getLoggedInUserId();
	    LocalDate startDate = LocalDate.now().minusDays(days);
	    List<Workouts> workouts = workoutsRepository.findWorkoutsByDateRange(userId, startDate);

	    // Group workouts by date, then map each group to a list of WorkoutsDto
	    Map<LocalDate, List<Workouts>> grouped = workouts.stream()
	        .collect(Collectors.groupingBy(Workouts::getWorkoutDate));

	    Map<LocalDate, List<WorkoutsDto>> result = new HashMap<>();
	    for (Map.Entry<LocalDate, List<Workouts>> entry : grouped.entrySet()) {
	        List<WorkoutsDto> dtos = entry.getValue().stream()
	            .map(WorkoutsMapper.INSTANCE::toWorkoutsDto) // convert each Workouts to DTO
	            .collect(Collectors.toList());
	        result.put(entry.getKey(), dtos);
	    }
	    return result;
	}
	
	public List<WorkoutsDto> getWorkoutDataByDate(LocalDate date) {
	    Long currentUserId = accountsService.getLoggedInUserId();
	    List<Workouts> workoutList = workoutsRepository.findWorkoutsByDate(currentUserId, date);
	    return workoutList.stream()
                .map(WorkoutsMapper.INSTANCE::toWorkoutsDto)
                .collect(Collectors.toList());
}
	
	public WorkoutsDto createWorkoutWithClonedExercises(String name, List<Long> exerciseIds) {
	    Long currentUserId = accountsService.getLoggedInUserId();
	    AccountsModel account = accountsRepository.findById(currentUserId)
	        .orElseThrow(() -> new RuntimeException("Account not found"));

	    Workouts newWorkout = new Workouts();
	    newWorkout.setName(name);
	    newWorkout.setAccount(account);
	    workoutsRepository.save(newWorkout); 

	    for (Long id : exerciseIds) {
	        ExerciseModel original = exerciseRepository.findById(id)
	            .orElseThrow(() -> new RuntimeException("Exercise not found: " + id));

	        ExerciseModel copy = new ExerciseModel();
	        copy.setNameOfExercise(original.getNameOfExercise());
	        copy.setSets(original.getSets());
	        copy.setReps(new ArrayList<>(original.getReps()));
	        copy.setWeight(new ArrayList<>(original.getWeight()));
	        copy.setDescription(original.getDescription());
	        copy.setExerciseType(original.getExerciseType());
	        copy.setAccount(account);
	        copy.setWorkout(newWorkout);
	        copy.setIsDeleted(false);

	        exerciseRepository.save(copy);
	        newWorkout.getExercises().add(copy); 
	    }

	    workoutsRepository.save(newWorkout); 

	    return WorkoutsMapper.INSTANCE.toWorkoutsDto(newWorkout);
	}
	
}
