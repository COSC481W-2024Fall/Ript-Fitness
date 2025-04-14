package com.riptFitness.Ript_Fitness_Backend.web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.CalendarService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.CalendarDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.WorkoutsDto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@RestController
@RequestMapping("/calendar")
public class CalendarController {

	@Autowired
	private CalendarService calendarService;

	@PostMapping("/logWorkout")
	public void logWorkout(@RequestParam Long workoutId) {
	    calendarService.logWorkoutDay(workoutId);
	}


	@PostMapping("/logRestDay")
	public void logRestDay(@RequestParam String timeZone) {
		// Validate the timeZone string (optional)
		calendarService.logRestDay(timeZone);
	}

	@GetMapping("/getMonth")
	public List<CalendarDto> getMonth(@RequestParam String startYear, @RequestParam String startMonth,
			@RequestParam String endYear, @RequestParam String endMonth) {
		LocalDateTime startDate = LocalDate.of(Integer.parseInt(startYear), Integer.parseInt(startMonth), 1)
				.atStartOfDay(); // time at start of day
		LocalDateTime endDate = LocalDate.of(Integer.parseInt(endYear), Integer.parseInt(endMonth), 1)
				.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX); // Time at end of day
		return calendarService.getMonth(startDate, endDate);
	}
	
	@GetMapping("/getWorkoutsByDate/{date}")
	public ResponseEntity<List<WorkoutsDto>> getWorkoutsForCalendarEntry(@PathVariable LocalDate date) {
	    List<WorkoutsDto> data = calendarService.getWorkoutsByDate(date);
	    return ResponseEntity.ok(data);
	}

}
