package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import java.time.LocalDateTime;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.StreakMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Streak;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.StreakRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.StreakDto;


@Service
public class StreakService {
	
	private StreakRepository streakRepository;
	
	public StreakService(StreakRepository streakRepository) {
		this.streakRepository = streakRepository;
	}
	

	
	public StreakDto updateStreak(Long id) {
		Optional<Streak> optionalStr = streakRepository.findById(id);
		if(optionalStr.isEmpty()) {
			throw new RuntimeException("No streak found with id = " + id);
		}
		Streak streak = optionalStr.get();
		StreakDto streakDto = StreakMapper.INSTANCE.toStreakDto(streak);
		
		LocalDateTime curTime = LocalDateTime.now();
		LocalDateTime prevLogin = streakDto.prevLogin;
		
		if (prevLogin.getDayOfYear() != curTime.getDayOfYear()) {// checks for same day
			if(prevLogin.getDayOfYear() == 366 && curTime.getDayOfYear() == 1) { //check for leap year last day of the year
				streak.currentSt++;
				streakRepository.save(streak);
				
			} else if(prevLogin.getDayOfYear() == 365 && curTime.getDayOfYear() == 1) { //checks for leap year and if it is the last day of the year
				streak.currentSt++;
				streakRepository.save(streak);
				
			} else if(prevLogin.getDayOfYear()+1 == curTime.getDayOfYear() && prevLogin.getYear() == curTime.getYear()) {//Checks to see if it is the next day of the same year
				streak.currentSt++;
				streakRepository.save(streak);
				
			} else {
				streak.currentSt = 0;
				streakRepository.save(streak);
				
			}
			streak.prevLogin = curTime;
		}
		
		return StreakMapper.INSTANCE.toStreakDto(streak);
	}
	
	public StreakDto getStreak(Long id) {
		Optional<Streak> optionalStr = streakRepository.findById(id);
		
		if(optionalStr.isEmpty()) {
			throw new RuntimeException("No streak found with id = " + id);
		}
		Streak streak = optionalStr.get();
		return StreakMapper.INSTANCE.toStreakDto(streak);
	}
}
