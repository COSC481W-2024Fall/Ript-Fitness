package com.riptFitness.Ript_Fitness_Backend.infrastructure.serviceTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.MockitoAnnotations;
import org.springframework.test.context.ActiveProfiles;

import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Streak;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.StreakRepository;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.AccountsService;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.StreakService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.StreakDto;

@ActiveProfiles("test")
public class StreakServiceTest {

	@Mock
	private StreakRepository streakRepository;
	
	@Mock
    private AccountsRepository accountsRepository;
    
    @Mock
    private AccountsService accountsService;

	@InjectMocks
	private StreakService streakServiceForServiceTest;

	private StreakDto streakDto;
	private Streak streak;
	private StreakDto streakDtoTwo;
	private Streak streakTwo;
	private StreakDto streakDtoThree;
	private Streak streakThree;
	private StreakDto streakDtoFour;
	private Streak streakFour;
	private AccountsModel account;
	private AccountsModel accountTwo;
	private AccountsModel accountThree;
	private AccountsModel accountFour;

	@BeforeEach
	public void setUp() {
		MockitoAnnotations.openMocks(this);

		account = new AccountsModel();
        account.setId(100L);
        
        accountTwo = new AccountsModel();
        accountTwo.setId(101L);
        
        accountThree = new AccountsModel();
        accountThree.setId(102L);
        
        accountFour = new AccountsModel();
        accountFour.setId(103L);
        
		streakDto = new StreakDto();
		streakDto.id = 100L;
		streakDto.currentSt = 10;
		streakDto.prevLogin = LocalDateTime.now();

		streak = new Streak();
		streak.id = 100L;
		streak.currentSt = 10;
		streak.prevLogin = LocalDateTime.now();

		streakDtoTwo = new StreakDto();
		streakDtoTwo.id = 101L;
		streakDtoTwo.currentSt = 10;
		streakDtoTwo.prevLogin = LocalDateTime.now().minusDays(1);

		streakTwo = new Streak();
		streakTwo.id = 101L;
		streakTwo.currentSt = 10;
		streakTwo.prevLogin = LocalDateTime.now().minusDays(1);
		
		streakDtoThree = new StreakDto();
		streakDtoThree.id = 102L;
		streakDtoThree.currentSt = 10;
		streakDtoThree.prevLogin = LocalDateTime.of(2024, 12, 31, 10, 0);

		streakThree = new Streak();
		streakThree.id = 102L;
		streakThree.currentSt = 10;
		streakThree.prevLogin = LocalDateTime.of(2024, 12, 31, 10, 0);
		
		streakDtoFour = new StreakDto();
		streakDtoFour.id = 103L;
		streakDtoFour.currentSt = 10;
		streakDtoFour.prevLogin = LocalDateTime.of(2023, 12, 31, 10, 0);

		streakFour = new Streak();
		streakFour.id = 103L;
		streakFour.currentSt = 10;
		streakFour.prevLogin = LocalDateTime.of(2023, 12, 31, 10, 0);

	}

	@Test
	void testServiceGetStreakValidId() {
		when(accountsService.getLoggedInUserId()).thenReturn(100L);
        when(accountsRepository.findById(100L)).thenReturn(Optional.of(account));
        when(streakRepository.findById(100L)).thenReturn(Optional.of(streak));
        
		StreakDto result = streakServiceForServiceTest.getStreak();
		assertNotNull(result);
		assertEquals(10, result.currentSt);
	}

	@Test
	void testServiceGetStreakInvalidId() {
		when(accountsService.getLoggedInUserId()).thenReturn(999L);
        when(accountsRepository.findById(999L)).thenReturn(Optional.empty());

		assertThrows(RuntimeException.class, () -> streakServiceForServiceTest.getStreak());
	}

	@Test
	void testServiceUpdateStreakValidId() {
		when(accountsService.getLoggedInUserId()).thenReturn(100L);
        when(accountsRepository.findById(100L)).thenReturn(Optional.of(account));
		when(streakRepository.findById(100L)).thenReturn(Optional.of(streak));
		StreakDto result = streakServiceForServiceTest.updateStreak();

		assertNotNull(result);
		//assertEquals(10, result.currentSt);

	}

	@Test
	void testServiceUpdateStreakInValidId() {
		when(streakRepository.findById(100L)).thenReturn(Optional.empty());

		assertThrows(RuntimeException.class, () -> streakServiceForServiceTest.updateStreak());

	}

	

	

}