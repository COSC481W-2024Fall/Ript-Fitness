package com.riptFitness.Ript_Fitness_Backend.infrastructure.serviceTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.context.ActiveProfiles;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.WorkoutsMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.ExerciseModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Workouts;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.ExerciseRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.WorkoutsRepository;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.AccountsService;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.WorkoutsService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.ExerciseDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.WorkoutsDto;

@ActiveProfiles("test")
public class WorkoutsServiceTest {

    @Mock
    private WorkoutsRepository workoutsRepository;
    
    @Mock
    private AccountsRepository accountsRepository;
    
    @Mock
    private AccountsService accountsService;

    @Mock
    private ExerciseRepository exerciseRepository; // Add this mock

    @InjectMocks
    private WorkoutsService workoutsService;
    
    @Mock
    private WorkoutsMapper workoutsMapper; // Add this mock

    private WorkoutsDto workoutDto;
    private WorkoutsDto workoutDto2;
    private Workouts workout;
    private Workouts workout2;
    private AccountsModel account;
    private ExerciseModel exercise;
    private ExerciseDto exerciseDto;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // Initialize ExerciseDto
        exerciseDto = new ExerciseDto();
        exerciseDto.setExerciseId(1L);
        exerciseDto.setNameOfExercise("Test Exercise");
        // Other fields can be set as needed
        
        // List of exercise IDs for the workoutDto
        List<Long> exerciseIds = new ArrayList<>();
        exerciseIds.add(exerciseDto.getExerciseId());
        
        // Initialize WorkoutsDto
        workoutDto = new WorkoutsDto();
        workoutDto.setWorkoutsId(1L);
        workoutDto.setName("Test Workout");
        workoutDto.setExerciseIds(exerciseIds);
        
        workoutDto2 = new WorkoutsDto();
        workoutDto2.setWorkoutsId(2L);
        workoutDto2.setName("Workout 2");
        
        // Initialize AccountsModel
        account = new AccountsModel();
        account.setId(1L);
        // Other fields can be set as needed
        
        // Initialize ExerciseModel
        exercise = new ExerciseModel();
        exercise.setExerciseId(1L);
        exercise.setNameOfExercise("Test Exercise");
        // Set the workout in the exercise (optional based on your data model)
        // exercise.setWorkout(workout); // Commented out to avoid circular reference in setup
        
        // List of exercises for the workout
        List<ExerciseModel> exercises = new ArrayList<>();
        exercises.add(exercise);
        
        // Initialize Workouts
        workout = new Workouts();
        workout.workoutsId = (1L);
        workout.name = ("Test Workout");
        workout.setAccount(account);
        workout.setExercises(exercises);
        workout.setWorkoutDate(LocalDate.now());
        
        // Set the workout in the exercise after initializing workout
        exercise.setWorkout(workout);
        
        workout2 = new Workouts();
        workout2.workoutsId = (2L);
        workout2.name = ("Workout 2");
        workout2.setAccount(account);
        workout2.setWorkoutDate(LocalDate.now().minusDays(2));
        // Add exercises if needed
    }

    @Test
    public void testAddWorkout() {
        // Create and set up the account
        AccountsModel account = new AccountsModel();
        account.setId(1L);
        account.setUsername("testUser");
        // ... set other necessary fields

        // Create and set up the exercise
        ExerciseModel exercise = new ExerciseModel();
        exercise.setExerciseId(1L);
        exercise.setNameOfExercise("Test Exercise");
        exercise.setAccount(account); // Set the account
        // ... set other necessary fields

        // Create and set up the workout DTO
        WorkoutsDto workoutDto = new WorkoutsDto();
        workoutDto.setName("Test Workout");
        workoutDto.setExerciseIds(Arrays.asList(1L));

        // Mock dependencies
        when(accountsService.getLoggedInUserId()).thenReturn(1L);
        when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));
        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(exercise));
        when(workoutsRepository.save(any(Workouts.class))).thenAnswer(invocation -> {
            Workouts savedWorkout = invocation.getArgument(0);
            savedWorkout.workoutsId = (1L); // Simulate auto-generated ID
            return savedWorkout;
        });

        // Call the service method
        WorkoutsDto result = workoutsService.addWorkout(workoutDto);

        // Assertions
        assertNotNull(result);
        assertEquals("Test Workout", result.getName());
        assertNotNull(result.getExercises());
        assertEquals(1, result.getExercises().size());
        assertEquals(1L, result.getExercises().get(0).getExerciseId());
    }


    @Test
    public void testGetWorkoutById() {
        // Create and set up the account
        AccountsModel account = new AccountsModel();
        account.setId(1L);
        account.setUsername("testUser");
        // ... set other necessary fields

        // Create and set up the exercise
        ExerciseModel exercise = new ExerciseModel();
        exercise.setExerciseId(1L);
        exercise.setNameOfExercise("Test Exercise");
        exercise.setAccount(account);

        // Create and set up the workout
        Workouts workout = new Workouts();
        workout.workoutsId = (1L);
        workout.setName("Test Workout");
        workout.setAccount(account);
        workout.setExercises(Arrays.asList(exercise));

        // Mock dependencies
        when(workoutsRepository.findById(1L)).thenReturn(Optional.of(workout));

        // Call the service method
        WorkoutsDto result = workoutsService.getWorkout(1L);

        // Assertions
        assertNotNull(result);
        assertEquals("Test Workout", result.getName());
        assertNotNull(result.getExercises());
        assertEquals(1, result.getExercises().size());
        assertEquals(1L, result.getExercises().get(0).getExerciseId());
    }


    @Test
    public void testGetWorkoutByInvalidId() {
        when(workoutsRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> workoutsService.getWorkout(1L));
    }
    
    @Test
    public void testGetUsersWorkouts() {
        // Mock the user account retrieval
        when(accountsService.getLoggedInUserId()).thenReturn(1L);
        when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));

        // Mock the user's workouts retrieval
        List<Workouts> expectedWorkouts = Arrays.asList(workout, workout2);
        when(workoutsRepository.findByAccountId(1L)).thenReturn(expectedWorkouts);

        // Call the service method
        List<WorkoutsDto> actualWorkouts = workoutsService.getUsersWorkouts(0,2);

        // Assert that the returned list matches the expected list
        assertEquals(expectedWorkouts.size(), actualWorkouts.size());
        assertEquals(expectedWorkouts.get(0).name, actualWorkouts.get(0).getName());
        assertEquals(expectedWorkouts.get(1).name, actualWorkouts.get(1).getName());
    }
    
    @Test
    public void testGetUsersWorkoutsIndexLessThanSize() {
        // Mock the user account retrieval
        when(accountsService.getLoggedInUserId()).thenReturn(1L);
        when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));

        // Mock the user's workouts retrieval
        List<Workouts> expectedWorkouts = Arrays.asList(workout, workout2);
        when(workoutsRepository.findByAccountId(1L)).thenReturn(expectedWorkouts);

        // Call the service method
        List<WorkoutsDto> actualWorkouts = workoutsService.getUsersWorkouts(0,1);

        // Assert that the returned list matches the expected list
        assertEquals(expectedWorkouts.size(), actualWorkouts.size());
        assertEquals(expectedWorkouts.get(0).name, actualWorkouts.get(0).getName());
        assertEquals(expectedWorkouts.get(1).name, actualWorkouts.get(1).getName());
    }
    
    @Test
    public void testGetUsersWorkoutByInvalidId() {
        // Mock accountsService to return an ID that doesn't exist in the accountsRepository
        when(accountsService.getLoggedInUserId()).thenReturn(999L);
        when(accountsRepository.findById(999L)).thenReturn(Optional.empty());

        // Assert that a RuntimeException is thrown when the account is not found
        RuntimeException thrown = assertThrows(RuntimeException.class, 
            () -> workoutsService.getUsersWorkouts(0,2));
        
        assertEquals("Account not found", thrown.getMessage());
    }
    
    @Test
    public void testUpdateWorkoutValid() {
        // Set up current user ID
        Long currentUserId = 1L;
        when(accountsService.getLoggedInUserId()).thenReturn(currentUserId);

        // Set up account
        AccountsModel account = new AccountsModel();
        account.setId(currentUserId);
        account.setUsername("testUser");

        // Set up existing exercises associated with the workout
        ExerciseModel oldExercise1 = new ExerciseModel();
        oldExercise1.setExerciseId(10L);
        oldExercise1.setNameOfExercise("Old Exercise 1");
        oldExercise1.setAccount(account);

        ExerciseModel oldExercise2 = new ExerciseModel();
        oldExercise2.setExerciseId(11L);
        oldExercise2.setNameOfExercise("Old Exercise 2");
        oldExercise2.setAccount(account);

        // Set up existing workout with old exercises
        Workouts existingWorkout = new Workouts();
        existingWorkout.workoutsId = (1L);
        existingWorkout.setName("Old Workout Name");
        existingWorkout.setAccount(account);
        existingWorkout.setExercises(Arrays.asList(oldExercise1, oldExercise2));

        // Set up new exercises to update the workout with
        ExerciseModel newExercise1 = new ExerciseModel();
        newExercise1.setExerciseId(1L);
        newExercise1.setNameOfExercise("New Exercise 1");
        newExercise1.setAccount(account);

        ExerciseModel newExercise2 = new ExerciseModel();
        newExercise2.setExerciseId(2L);
        newExercise2.setNameOfExercise("New Exercise 2");
        newExercise2.setAccount(account);

        ExerciseModel newExercise3 = new ExerciseModel();
        newExercise3.setExerciseId(3L);
        newExercise3.setNameOfExercise("New Exercise 3");
        newExercise3.setAccount(account);

        // Mock the exercise repository to return new exercises when their IDs are fetched
        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(newExercise1));
        when(exerciseRepository.findById(2L)).thenReturn(Optional.of(newExercise2));
        when(exerciseRepository.findById(3L)).thenReturn(Optional.of(newExercise3));

        // Set up WorkoutsDto with the new name and exercise IDs
        WorkoutsDto workoutDto = new WorkoutsDto();
        workoutDto.setName("Updated Workout Name");
        workoutDto.setExerciseIds(Arrays.asList(1L, 2L, 3L));

        // Mock the workouts repository to return the existing workout when fetched by ID
        when(workoutsRepository.findById(1L)).thenReturn(Optional.of(existingWorkout));

        // Mock the workouts repository save method to return the updated workout
        when(workoutsRepository.save(any(Workouts.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Mock the workouts mapper to map the updated workout to a WorkoutsDto
        when(workoutsMapper.toWorkoutsDto(any(Workouts.class))).thenAnswer(invocation -> {
            Workouts updatedWorkout = invocation.getArgument(0);
            WorkoutsDto dto = new WorkoutsDto();
            dto.setWorkoutsId(updatedWorkout.workoutsId);
            dto.setName(updatedWorkout.getName());
            dto.setExercises(updatedWorkout.getExercises().stream()
                .map(exerciseModel -> {
                    ExerciseDto exerciseDto = new ExerciseDto();
                    exerciseDto.setExerciseId(exerciseModel.getExerciseId());
                    exerciseDto.setNameOfExercise(exerciseModel.getNameOfExercise());
                    return exerciseDto;
                })
                .collect(Collectors.toList()));
            return dto;
        });

        // Call the updateWorkout method
        WorkoutsDto result = workoutsService.updateWorkout(1L, workoutDto);

        // Assertions
        assertNotNull(result);
        assertEquals("Updated Workout Name", result.getName());
        assertNotNull(result.getExercises());
        assertEquals(3, result.getExercises().size());

        List<Long> exerciseIds = result.getExercises().stream()
            .map(ExerciseDto::getExerciseId)
            .collect(Collectors.toList());
        assertTrue(exerciseIds.containsAll(Arrays.asList(1L, 2L, 3L)));
    }

    
    @Test
    public void testUpdateWorkoutInvalid() {
        when(workoutsRepository.findById(100L)).thenReturn(Optional.empty());
        
        assertThrows(RuntimeException.class, () -> workoutsService.updateWorkout(100L, workoutDto));
    }

    @Test
    public void testDeleteWorkout() {
        when(workoutsRepository.findById(1L)).thenReturn(Optional.of(workout));
        when(workoutsRepository.save(any(Workouts.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WorkoutsDto result = workoutsService.deleteWorkout(1L);
        assertNotNull(result);
        assertTrue(result.isIsDeleted());
    }
    
    @Test
    public void testDeleteWorkoutInvalid() {
        when(workoutsRepository.findById(100L)).thenReturn(Optional.empty());
        
        assertThrows(RuntimeException.class, () -> workoutsService.deleteWorkout(100L));
    }
    
	 @Test
	    public void testGetWeeklyWorkoutTrends() {
	        when(accountsService.getLoggedInUserId()).thenReturn(1L);
	        when(workoutsRepository.findWorkoutsByDateRange(any(Long.class), any(LocalDate.class)))
	                .thenReturn(Collections.singletonList(workout));

	        Map<LocalDate, List<WorkoutsDto>> result = workoutsService.getWeeklyWorkoutTrends();

	        assertNotNull(result);
	        assertFalse(result.isEmpty());
	    }

	    @Test
	    public void testGetMonthlyWorkoutTrends() {
	        when(accountsService.getLoggedInUserId()).thenReturn(1L);
	        when(workoutsRepository.findWorkoutsByDateRange(any(Long.class), any(LocalDate.class)))
	                .thenReturn(Collections.singletonList(workout));

	        Map<LocalDate, List<WorkoutsDto>> result = workoutsService.getMonthlyWorkoutTrends();

	        assertNotNull(result);
	        assertFalse(result.isEmpty());
	    }
	    


}
