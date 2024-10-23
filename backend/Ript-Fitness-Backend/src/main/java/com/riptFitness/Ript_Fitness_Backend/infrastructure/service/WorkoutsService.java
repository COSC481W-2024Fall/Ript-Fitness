package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import org.springframework.stereotype.Service;
import java.util.Optional;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.WorkoutsMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Workouts;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.WorkoutsRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.WorkoutsDto;

@Service
public class WorkoutsService {
	
	private WorkoutsRepository workoutsRepository;
	private final AccountsRepository accountsRepository;
	private final AccountsService accountsService;
	
	public WorkoutsService(WorkoutsRepository workoutsRepository, AccountsService accountsService, AccountsRepository accountsRepository) {
		this.workoutsRepository = workoutsRepository;
		this.accountsService = accountsService;
		this.accountsRepository = accountsRepository;
	}
	
	//Method adds a new Workout. 
	public WorkoutsDto addWorkout(WorkoutsDto workoutsDto) {
		
		Workouts newWorkout = WorkoutsMapper.INSTANCE.toWorkouts(workoutsDto);
		//gets the current user's id and associates it with the workout or it throws an exception
		Long currentUserId = accountsService.getLoggedInUserId();
		AccountsModel account = accountsRepository.findById(currentUserId)
				.orElseThrow(() -> new RuntimeException("Account not found"));
		
		newWorkout.setAccount(account);
		
		workoutsRepository.save(newWorkout);
		return WorkoutsMapper.INSTANCE.toWorkoutsDto(newWorkout);
	}

}
