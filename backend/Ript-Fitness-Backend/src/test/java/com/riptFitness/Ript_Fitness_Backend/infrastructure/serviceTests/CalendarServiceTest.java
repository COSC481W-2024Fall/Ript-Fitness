package com.riptFitness.Ript_Fitness_Backend.infrastructure.serviceTests;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.mockito.junit.jupiter.MockitoExtension;

import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Calendar;
import com.riptFitness.Ript_Fitness_Backend.domain.model.UserProfile;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.CalendarRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.UserProfileRepository;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.CalendarService;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.config.SecurityConfig;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.AccountsService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.CalendarDto;

//@ActiveProfiles("test")
//@Import(SecurityConfig.class)
@ExtendWith(MockitoExtension.class)
public class CalendarServiceTest {

	@Mock
	private CalendarRepository calendarRepository;

	@Mock
	private AccountsRepository accountsRepository;

	@Mock
	private AccountsService accountsService;

	@Mock
	private UserProfileRepository userProfileRepository;

	@InjectMocks
	private CalendarService calendarService;

	private AccountsModel account;
	private UserProfile userProfile;
	private Calendar calendarEntry;

	@BeforeEach
	public void setUp() {
		MockitoAnnotations.openMocks(this);

		// Mock account and user profile
		account = new AccountsModel();
		account.setId(1L);

		userProfile = new UserProfile();
		userProfile.setRestDaysLeft(3);
		userProfile.setRestDays(3);
		userProfile.setRestResetDate(LocalDateTime.now());
		userProfile.setAccount(account);
		userProfile.setTimeZone("Etc/GMT+5"); // Set a default time zone

		// Mock a calendar entry
		calendarEntry = new Calendar(account, LocalDateTime.now(), 1, "Etc/GMT+5"); // Activity type 1 = Workout
		calendarEntry.setTimeZoneWhenLogged("Etc/GMT+5"); // Set the time zone for calendar entries
	}

	@Test
	public void testLogWorkoutDay() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));
		when(userProfileRepository.findUserProfileByAccountId(1L)).thenReturn(Optional.of(userProfile));
		when(calendarRepository.findTopByAccountIdOrderByDateDesc(1L)).thenReturn(Optional.empty());
		calendarService.logWorkoutDay("Etc/GMT+5");
		verify(calendarRepository, times(1)).save(any(Calendar.class));
	}

	@Test
	public void testLogWorkoutDayAlreadyLogged() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));
		when(userProfileRepository.findUserProfileByAccountId(1L)).thenReturn(Optional.of(userProfile));
		Calendar existingEntry = new Calendar(account, LocalDateTime.now(), 1, "Etc/GMT+5"); // Activity type 1 = Workout
		existingEntry.setTimeZoneWhenLogged("Etc/GMT+5"); // Set a valid time zone
		when(calendarRepository.findTopByAccountIdOrderByDateDesc(1L)).thenReturn(Optional.of(existingEntry));

		IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
			calendarService.logWorkoutDay("Etc/GMT+5");
		});

		assertEquals("Something was already logged for this day.", exception.getMessage());
	}

	@Test
	public void testLogRestDay() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));
		when(userProfileRepository.findUserProfileByAccountId(1L)).thenReturn(Optional.of(userProfile));
		userProfile.setRestDaysLeft(2);
		when(calendarRepository.findTopByAccountIdOrderByDateDesc(1L)).thenReturn(Optional.empty());
		when(userProfileRepository.findUserProfileByAccountId(1L)).thenReturn(Optional.of(userProfile));

		calendarService.logRestDay("Etc/GMT+5");

		verify(calendarRepository, times(1)).save(any(Calendar.class));
		assertEquals(1, userProfile.getRestDaysLeft());
	}

	@Test
	public void testLogRestDayNoRestDaysLeft() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));
		when(userProfileRepository.findUserProfileByAccountId(1L)).thenReturn(Optional.of(userProfile));
		userProfile.setRestDaysLeft(0);
		when(userProfileRepository.findUserProfileByAccountId(1L)).thenReturn(Optional.of(userProfile));

		IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
			calendarService.logRestDay("Etc/GMT+5");
		});

		assertEquals("No rest days left for this week.", exception.getMessage());
	}

	@Test
	public void testLogRestDayAlreadyLogged() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));
		when(userProfileRepository.findUserProfileByAccountId(1L)).thenReturn(Optional.of(userProfile));
		Calendar existingEntry = new Calendar(account, LocalDateTime.now(), 2, "Etc/GMT+5"); // Activity type 2 = Rest day
		existingEntry.setTimeZoneWhenLogged("Etc/GMT+5"); // Ensure the time zone is set
		when(calendarRepository.findTopByAccountIdOrderByDateDesc(1L)).thenReturn(Optional.of(existingEntry));

		IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
			calendarService.logRestDay("Etc/GMT+5");
		});

		assertEquals("Something was already logged for this day.", exception.getMessage());
	}

	@Test
	public void testGetMonth() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
	    LocalDateTime startDate = LocalDateTime.of(2023, 12, 1, 0, 0);
	    LocalDateTime endDate = LocalDateTime.of(2023, 12, 31, 23, 59);

	    Calendar calendarEntry = new Calendar();
	    calendarEntry.setDate(LocalDateTime.of(2023, 12, 5, 12, 0));
	    calendarEntry.setActivityType(1);
	    calendarEntry.setTimeZoneWhenLogged("America/New_York");

	    when(calendarRepository.findByAccountIdAndDateBetween(anyLong(), any(LocalDateTime.class), any(LocalDateTime.class)))
	        .thenReturn(List.of(calendarEntry));

	    List<CalendarDto> result = calendarService.getMonth(startDate, endDate);

	    assertNotNull(result);
	    assertEquals(1, result.size());
	    assertEquals("America/New_York", result.get(0).getTimeZoneWhenLogged());
	    assertEquals(1, result.get(0).getActivityType());
	    assertEquals(LocalDateTime.of(2023, 12, 5, 12, 0), result.get(0).getDate());
	}

}
