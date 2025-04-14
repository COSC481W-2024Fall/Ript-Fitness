package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.CalendarMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.mapper.WorkoutsMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Calendar;
import com.riptFitness.Ript_Fitness_Backend.domain.model.CalendarWorkoutLink;
import com.riptFitness.Ript_Fitness_Backend.domain.model.UserProfile;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Workouts;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.CalendarRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.UserProfileRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.WorkoutsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.CalendarWorkoutLinkRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.CalendarDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.WorkoutsDto;

@Service
public class CalendarService {

	@Autowired
	private CalendarRepository calendarRepository;

	@Autowired
	private AccountsRepository accountsRepository;

	@Autowired
	private AccountsService accountsService;

	@Autowired
	private UserProfileRepository userProfileRepository;
	
	@Autowired
	private WorkoutsRepository workoutsRepository;

	@Autowired
	private CalendarWorkoutLinkRepository calendarWorkoutLinkRepository;

	private void validateTimeZone(String timeZone) {
		// Convert the array to a list and check if it contains the timeZone
		if (!java.util.Arrays.asList(java.util.TimeZone.getAvailableIDs()).contains(timeZone)) {
			throw new IllegalArgumentException("Invalid time zone: " + timeZone);
		}
	}

	public void logWorkoutDay(Long workoutId) {
	    Long accountId = accountsService.getLoggedInUserId();

	    AccountsModel account = accountsRepository.findById(accountId)
	            .orElseThrow(() -> new IllegalStateException("Account not found with ID: " + accountId));

	    UserProfile userProfile = userProfileRepository.findUserProfileByAccountId(accountId)
	            .orElseThrow(() -> new IllegalStateException("User profile not found for account ID: " + accountId));
	    
	    String timezone = userProfile.getTimeZone() != null && !userProfile.getTimeZone().isEmpty()
	    	    ? userProfile.getTimeZone() : "Etc/GMT+5";

	    validateTimeZone(timezone);
	    
	    ZoneId userZoneId = ZoneId.of(timezone);
	    ZonedDateTime userNow = ZonedDateTime.now(userZoneId);

	    ZonedDateTime utcNow = userNow.withZoneSameInstant(ZoneId.of("UTC"));
	    LocalDateTime localNow = utcNow.toLocalDateTime();

	    ZonedDateTime zonedDateTime = localNow.atZone(ZoneId.of("GMT")).withZoneSameInstant(userZoneId);

	    // Prevent duplicate logs on same day
	    Optional<Calendar> lastLoggedEntryOpt = calendarRepository.findTopByAccountIdOrderByDateDesc(accountId);
	    if (lastLoggedEntryOpt.isPresent()) {
	        Calendar lastCalendarEntry = lastLoggedEntryOpt.get();
	        ZonedDateTime lastLoggedUTC = lastCalendarEntry.getDate().atZone(ZoneId.of("UTC"));
	        ZonedDateTime lastLoggedInUserZone = lastLoggedUTC.withZoneSameInstant(userZoneId);
	        if (lastLoggedInUserZone.toLocalDate().equals(userNow.toLocalDate())) {
	            throw new IllegalStateException("Something was already logged for this day.");
	        }
	    }

	    Calendar calendarEntry = new Calendar(account, localNow, 1, timezone);
	    calendarRepository.save(calendarEntry);

	    // 6. Link to the workout
	    Workouts workout = workoutsRepository.findById(workoutId)
	        .orElseThrow(() -> new IllegalArgumentException("Workout not found for ID: " + workoutId));

	    CalendarWorkoutLink link = new CalendarWorkoutLink();
	    link.setCalendarEntry(calendarEntry);
	    link.setWorkout(workout);
	    calendarWorkoutLinkRepository.save(link);
	}


	public void logRestDay(String timezone) {
		Long accountId = accountsService.getLoggedInUserId();

		AccountsModel account = accountsRepository.findById(accountId)
				.orElseThrow(() -> new IllegalStateException("Account not found with ID: " + accountId));

		// Retrieve the user's profile to update rest days
		UserProfile userProfile = userProfileRepository.findUserProfileByAccountId(accountId)
				.orElseThrow(() -> new IllegalStateException("User profile not found for account ID: " + accountId));

		validateTimeZone(timezone);

		LocalDateTime localNow = LocalDateTime.now(); // Now in GMT

		// Get the user's zone ID. Default to Eastern US
		ZoneId userZoneId = (userProfile.getTimeZone() != null && !userProfile.getTimeZone().equals(""))
				? ZoneId.of(userProfile.getTimeZone())
				: ZoneId.of("Etc/GMT+5");

		// use the localDateTime (gmt), and convert it using the user's userProfile to
		// their timezone.
		ZonedDateTime zonedDateTime = LocalDateTime.now().atZone(ZoneId.of("GMT")).withZoneSameInstant(userZoneId);

		// get the last logged entry into the calendar
		Optional<Calendar> lastLoggedEntryOpt = calendarRepository
				.findTopByAccountIdOrderByDateDesc(userProfile.getAccount().getId());

		if (lastLoggedEntryOpt.isPresent()) { // If data was found in the calendar

			Calendar lastLoggedEntry = lastLoggedEntryOpt.get();

			// Convert last logged date to the timezone the user was using when it was
			// logged.
			ZonedDateTime lastLoggedDateInUserZone = lastLoggedEntry.getDate().atZone(ZoneId.of("GMT"))
					.withZoneSameInstant(ZoneId.of(lastLoggedEntry.getTimeZoneWhenLogged()));

			if (lastLoggedDateInUserZone.toLocalDate().equals(zonedDateTime.toLocalDate())) { // if zoned times are in
																								// same day
				throw new IllegalStateException("Something was already logged for this day.");
			}
		}

		// If today's date (using zonedDateTime) converted to LocalDate, is a day after
		// our Rest Reset Date
		if (zonedDateTime.toLocalDate().isAfter(userProfile.getRestResetDate().toLocalDate())) {
			int todayDayOfWeek = zonedDateTime.getDayOfWeek().getValue();
			int daysUntilSunday = 7 - todayDayOfWeek;

			// Set next reset date based on days until sunday for the user's timezone
			userProfile.setRestResetDate(zonedDateTime.plusDays(daysUntilSunday).toLocalDateTime());
			userProfile.setRestDaysLeft(userProfile.getRestDays());
		}

		// Check if there are remaining rest days
		if (userProfile.getRestDaysLeft() > 0) {
			userProfile.setRestDaysLeft(userProfile.getRestDaysLeft() - 1);
		} else {
			throw new IllegalStateException("No rest days left for this week.");
		}

		// Save the updated user profile
		userProfileRepository.save(userProfile);

		// Log the rest day in the calendar
		Calendar restDayEntry = new Calendar(account, localNow, 2, timezone); // Activity type 2 for rest day
		calendarRepository.save(restDayEntry);
	}

	public List<CalendarDto> getMonth(LocalDateTime startDate, LocalDateTime endDate) {
		Long accountId = accountsService.getLoggedInUserId();
		List<Calendar> entries = calendarRepository.findByAccountIdAndDateBetween(accountId, startDate, endDate);
		return entries.stream().map(calendar -> new CalendarDto(calendar.getDate(), calendar.getActivityType(),
				calendar.getTimeZoneWhenLogged())).collect(Collectors.toList());
	}

	public List<WorkoutsDto> getWorkoutsByDate(LocalDate date) {
	    Long userId = accountsService.getLoggedInUserId();
	    LocalDateTime startOfDay = date.atStartOfDay();
	    LocalDateTime endOfDay = date.atTime(23, 59, 59);

	    List<Workouts> workouts = calendarWorkoutLinkRepository.findWorkoutsByDateRange(userId, startOfDay, endOfDay);
	    System.out.println("Querying for userId: " + userId);
	    System.out.println("Date range: " + startOfDay + " to " + endOfDay);

	    return workouts.stream()
	            .map(WorkoutsMapper.INSTANCE::toWorkoutsDto)
	            .collect(Collectors.toList());
	}

}
