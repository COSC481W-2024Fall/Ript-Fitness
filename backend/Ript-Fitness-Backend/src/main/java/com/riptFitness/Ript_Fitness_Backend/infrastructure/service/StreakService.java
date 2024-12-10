package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.StreakMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Streak;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.StreakRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.StreakDto;



@Service
public class StreakService {
	
	private StreakRepository streakRepository;
	private final AccountsService accountsService;
	private final AccountsRepository accountsRepository;
	
	public StreakService(StreakRepository streakRepository, AccountsService accountsService, AccountsRepository accountsRepository) {
		this.streakRepository = streakRepository;
		this.accountsService = accountsService;
		this.accountsRepository = accountsRepository;
	}
	

	
	public StreakDto updateStreak() {
	    Long currentUserId = accountsService.getLoggedInUserId();
	    Optional<Streak> optionalStr = streakRepository.findById(currentUserId);
	    if (optionalStr.isEmpty()) {
	        throw new RuntimeException("No streak found with id = " + currentUserId);
	    }

	    Streak streak = optionalStr.get();
	    LocalDateTime curTime = LocalDateTime.now();
	    LocalDateTime prevLogin = streak.prevLogin; // Assuming this field exists and is tracked in your entity

	    if (prevLogin == null) {
	        // If there's no previous login, start the streak at 1
	        streak.currentSt = (1);
	    } else {
	        long hoursBetween = Duration.between(prevLogin, curTime).toHours();
	        if (hoursBetween < 48 && hoursBetween > 24) {
	            // Logged in within 24 hours of the last login => increment streak
	            streak.currentSt++;
	        } else {
	            // More than 24 hours have passed => reset streak
	            streak.currentSt = 1;
	        }
	    }

	    // Update the prevLogin time
	    streak.prevLogin = (curTime);

	    // Save the updated streak after all changes are done
	    streakRepository.save(streak);

	    return StreakMapper.INSTANCE.toStreakDto(streak);
	}

	
	public StreakDto getStreak() {
		Long currentUserId = accountsService.getLoggedInUserId();
		Optional<Streak> optionalStr = streakRepository.findById(currentUserId);
		
		if(optionalStr.isEmpty()) {
			throw new RuntimeException("No streak found with id = " + currentUserId);
		}
		Streak streak = optionalStr.get();
		return StreakMapper.INSTANCE.toStreakDto(streak);
	}
}
