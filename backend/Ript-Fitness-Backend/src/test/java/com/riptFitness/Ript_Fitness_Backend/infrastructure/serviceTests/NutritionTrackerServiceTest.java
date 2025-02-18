package com.riptFitness.Ript_Fitness_Backend.infrastructure.serviceTests;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Day;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Food;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.NutritionTrackerDayRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.NutritionTrackerFoodRepository;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.AccountsService;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.NutritionTrackerService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.DayDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.FoodDto;

public class NutritionTrackerServiceTest {

	@Mock
	private NutritionTrackerFoodRepository nutritionTrackerFoodRepository;
	
	@Mock
	private NutritionTrackerDayRepository nutritionTrackerDayRepository;
	
	@Mock
	private AccountsService accountsService;
	
	@Mock
	private AccountsRepository accountsRepository;
	
	@InjectMocks
	private NutritionTrackerService nutritionTrackerServiceForServiceTests;
	
	private FoodDto foodDto;
	private FoodDto foodDtoTwo;
	private Food food;
	private Food foodTwo;
	private DayDto dayDto;
	private Day day;
	private AccountsModel account;
	
	@BeforeEach
	public void setUp() {
		MockitoAnnotations.openMocks(this);

		foodDto = new FoodDto();
		foodDto.name = "Protein bar";
		foodDto.calories = 400;
		foodDto.protein = 30;
		foodDto.carbs = 40;
		foodDto.fat = 21;
		foodDto.cholesterol = 200;
		foodDto.saturatedFat = 22;
		foodDto.transFat = 1;
		foodDto.sodium = 10;
		foodDto.fiber = 3;
		foodDto.sugars = 150;
		foodDto.calcium = 17;
		foodDto.iron = 2;
		foodDto.potassium = 11;
		foodDto.serving = 1.0;
		
		food = new Food();
		food.name = "Protein bar";
		food.calories = 400;
		food.protein = 30;
		food.carbs = 40;
		food.fat = 21;
		food.serving = 1.0;
		food.cholesterol = 200;
		food.saturatedFat = 22;
		food.transFat = 1;
		food.sodium = 10;
		food.fiber = 3;
		food.sugars = 150;
		food.calcium = 17;
		food.iron = 2;
		food.potassium = 11;
		food.account = account;
		
		foodDtoTwo = new FoodDto();
		foodDtoTwo.name = "Chicken breast";
		foodDtoTwo.calories = 500;
		foodDtoTwo.protein = 100;
		foodDtoTwo.carbs = 0;
		foodDtoTwo.fat = 9;
		foodDtoTwo.cholesterol = 100;
		foodDtoTwo.saturatedFat = 39;
		foodDtoTwo.transFat = 0;
		foodDtoTwo.sodium = 18;
		foodDtoTwo.fiber = 30;
		foodDtoTwo.sugars = 10;
		foodDtoTwo.calcium = 23;
		foodDtoTwo.iron = 7;
		foodDtoTwo.potassium = 13;
		foodDtoTwo.serving = 0.5;
		
		foodTwo = new Food();
		foodTwo.name = "Chicken breast";
		foodTwo.calories = 500;
		foodTwo.protein = 100;
		foodTwo.carbs = 0;
		foodTwo.fat = 9;
		foodTwo.cholesterol = 100;
		foodTwo.saturatedFat = 39;
		foodTwo.transFat = 0;
		foodTwo.sodium = 18;
		foodTwo.fiber = 30;
		foodTwo.sugars = 10;
		foodTwo.calcium = 23;
		foodTwo.iron = 7;
		foodTwo.potassium = 13;
		foodTwo.serving = 0.5;
				
		dayDto = new DayDto();
		dayDto.foodsEatenInDay = List.of(foodDto, foodDtoTwo);

		day = new Day();
		day.foodsEatenInDay = List.of(food, foodTwo);
		
		account = new AccountsModel();
		account.setId(1L);
		day.account = account;
	}
	
	@Test
	void testServiceAddFoodValid() {
		when(nutritionTrackerFoodRepository.save(any(Food.class))).thenReturn(food);
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));
		
		FoodDto result = nutritionTrackerServiceForServiceTests.addFood(foodDto);
		
		assertNotNull(result);
		assertEquals("Protein bar", result.name);
		assertEquals(21, result.fat);
	}
	@Test
	void testServiceAddFoodValid2() {
		when(nutritionTrackerFoodRepository.save(any(Food.class))).thenReturn(food);
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));
		
		FoodDto result = nutritionTrackerServiceForServiceTests.addFood(foodDto);
		
		assertNotNull(result);
		assertEquals("Protein bar", result.name);
		assertEquals(10, result.sodium);
	}
	
	@Test
	void testServiceGetFoodStatsValid() {
		when(nutritionTrackerFoodRepository.findById(anyLong())).thenReturn(Optional.of(food));
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		
		FoodDto result = nutritionTrackerServiceForServiceTests.getFoodStats(1L);
		
		assertNotNull(result);
		assertEquals(40, result.carbs);
	}
	@Test
	void testServiceGetFoodStatsValid2() {
		when(nutritionTrackerFoodRepository.findById(anyLong())).thenReturn(Optional.of(food));
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		
		FoodDto result = nutritionTrackerServiceForServiceTests.getFoodStats(1L);
		
		assertNotNull(result);
		assertEquals(3, result.fiber);
	}
	@Test
	void testServiceGetFoodStatsInvalidNotInDatabase() {
		when(nutritionTrackerFoodRepository.findById(1L)).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> nutritionTrackerServiceForServiceTests.getFoodStats(1L));
	}
	
	@Test
	void testServiceGetFoodsOfLoggedInUserValid() {
		List<Food> foods = List.of(food, foodTwo, food, foodTwo);
		ArrayList<Food> returnedArrayListFromDatabase = new ArrayList<>(foods);
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(nutritionTrackerFoodRepository.getFoodsFromAccountId(anyLong())).thenReturn(Optional.of(returnedArrayListFromDatabase));
		
		ArrayList<FoodDto> result = nutritionTrackerServiceForServiceTests.getFoodsOfLoggedInUser(0, 2);
		
		assertNotNull(result);
		assertEquals(3, result.size());
	}
	
	@Test
	void testServiceGetFoodsOfLoggedInUserValidIndexesGreaterThanNumberOfObjectsInDatabase() {
		List<Food> foods = List.of(food, foodTwo, food, foodTwo);
		ArrayList<Food> returnedArrayListFromDatabase = new ArrayList<>(foods);
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(nutritionTrackerFoodRepository.getFoodsFromAccountId(anyLong())).thenReturn(Optional.of(returnedArrayListFromDatabase));
		
		ArrayList<FoodDto> result = nutritionTrackerServiceForServiceTests.getFoodsOfLoggedInUser(0, 7);
		
		assertNotNull(result);
		assertEquals(4, result.size());
	}
	
	@Test
	void testServiceGetFoodsOfLoggedInUserInvalidNoFoodsForUser() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(nutritionTrackerFoodRepository.getFoodsFromAccountId(anyLong())).thenReturn(Optional.empty());

		ArrayList<FoodDto> result = nutritionTrackerServiceForServiceTests.getFoodsOfLoggedInUser(0, 2);
		
		assertNotNull(result);
	}
	
	@Test
	void testServiceEditFoodValid() {
		when(nutritionTrackerFoodRepository.findById(1L)).thenReturn(Optional.of(food));
		when(nutritionTrackerFoodRepository.save(any(Food.class))).thenReturn(food);
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));
		
		FoodDto result = nutritionTrackerServiceForServiceTests.editFood(1L, foodDto);
		
		assertNotNull(result);
		assertEquals(400, result.calories);
	}
	@Test
	void testServiceEditFoodValid2() {
		when(nutritionTrackerFoodRepository.findById(1L)).thenReturn(Optional.of(food));
		when(nutritionTrackerFoodRepository.save(any(Food.class))).thenReturn(food);
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));
		
		FoodDto result = nutritionTrackerServiceForServiceTests.editFood(1L, foodDto);
		
		assertNotNull(result);
		assertEquals(2, result.iron);
	}
	
	@Test
	void testServiceEditFoodNotInDatabase() {
		when(nutritionTrackerFoodRepository.findById(1L)).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> nutritionTrackerServiceForServiceTests.editFood(1L, foodDto));
	}
	
	@Test
	void testServiceDeleteFoodValid() {
		when(nutritionTrackerFoodRepository.findById(1L)).thenReturn(Optional.of(food));
		
		FoodDto result = nutritionTrackerServiceForServiceTests.deleteFood(1L);
		
		assertNotNull(result);
		assertTrue(result.isDeleted);
	}
	
	@Test
	void testServiceDeleteFoodInvalidNotInDatabase() {
		when(nutritionTrackerFoodRepository.findById(1L)).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> nutritionTrackerServiceForServiceTests.deleteFood(1L));
	}
	
	@Test
	void testServiceAddDayValid() {
		when(nutritionTrackerDayRepository.save(any(Day.class))).thenReturn(day);
		when(accountsRepository.findById(any(Long.class))).thenReturn(Optional.of(account));
		
		DayDto result = nutritionTrackerServiceForServiceTests.addDay(dayDto);
		
		assertNotNull(result);
	}
	
	@Test
	void testServiceGetDayStatsValid() {
		when(nutritionTrackerDayRepository.findById(1L)).thenReturn(Optional.of(day));
		when(nutritionTrackerDayRepository.save(any(Day.class))).thenReturn(day);
		
		DayDto result = nutritionTrackerServiceForServiceTests.getDayStats(1L);
		
		assertNotNull(result);
	}
	
	@Test
	void testServiceGetDayStatsInvalidNotInDatabase() {
		when(nutritionTrackerDayRepository.findById(1L)).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> nutritionTrackerServiceForServiceTests.getDayStats(1L));
	}
	
	@Test
	void testServiceGetDaysOfLoggedInUserValid() {
		List<Day> days = List.of(day, day, day);
		ArrayList<Day> daysReturnedFromDatabase = new ArrayList<>(days);
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(nutritionTrackerDayRepository.getDaysFromAccountId(anyLong())).thenReturn(Optional.of(daysReturnedFromDatabase));
		
		DayDto result = nutritionTrackerServiceForServiceTests.getDayOfLoggedInUser(0);
		
		assertNotNull(result);
	}
	
	@Test
	void testServiceGetDaysOfLoggedInUserInvalidNoDaysForUser() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(nutritionTrackerDayRepository.getDaysFromAccountId(anyLong())).thenReturn(Optional.empty());
				
		assertThrows(RuntimeException.class, () -> {
			nutritionTrackerServiceForServiceTests.getDayOfLoggedInUser(0);
        });
	}
	
	@Test
	void testServiceDeleteDayValid() {
		when(nutritionTrackerDayRepository.findById(1L)).thenReturn(Optional.of(day));
		
		DayDto result = nutritionTrackerServiceForServiceTests.deleteDay(1L);
		
		assertNotNull(result);
		assertTrue(result.isDeleted);
	}
	
	@Test
	void testServiceDeleteDayInvalidNotInDatabase() {
		when(nutritionTrackerDayRepository.findById(1L)).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> nutritionTrackerServiceForServiceTests.deleteDay(1L));
	}
	
	@Test
	void testServiceAddFoodsToDayInvalidFoodNotInDatabase() {
		when(nutritionTrackerDayRepository.findById(1L)).thenReturn(Optional.of(day));
		
		assertThrows(RuntimeException.class, () -> nutritionTrackerServiceForServiceTests.addFoodsToDay(1L, List.of(2L)));
	}
	
	@Test
	void testServiceDeleteFoodsInDayInvalidDayNotInDatabase() {
		when(nutritionTrackerDayRepository.findById(1L)).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> nutritionTrackerServiceForServiceTests.deleteFoodsInDay(1L, List.of(2L, 3L)));
	}
	
	@Test
	void testServiceDeleteFoodsInDayInvalidFoodNotInDatabase() {
		when(nutritionTrackerDayRepository.findById(1L)).thenReturn(Optional.of(day));
		
		assertThrows(RuntimeException.class, () -> nutritionTrackerServiceForServiceTests.deleteFoodsInDay(1L, List.of(2L)));
	}
	
	@Test
	public void testServiceCalculateTotalDayStatsValidRatiosAddTo100() {		
		nutritionTrackerServiceForServiceTests.calculateTotalDayStats(day);
		
		assertEquals(650, day.calories);
		assertEquals(80, day.totalProtein);
		assertEquals(40, day.totalCarbs);
		assertEquals(25, day.totalFat);
		assertEquals(28, day.totalCalcium);
		assertEquals(250, day.totalCholesterol);
		assertEquals(18, day.totalFiber);
		assertEquals(290, day.totalPotassium);
		assertEquals(5, day.totalIron);
		assertEquals(41, day.totalSaturatedFat);
		assertEquals(1, day.totalTransFat);
		assertEquals(155, day.totalSugars);
		assertEquals(19, day.totalSodium);
	}
	
	@Test
	void testAddFoodsToDayValid() {
		when(nutritionTrackerDayRepository.findById(1L)).thenReturn(Optional.of(day));
		when(nutritionTrackerFoodRepository.findById(any(Long.class))).thenReturn(Optional.of(foodTwo));
		when(nutritionTrackerDayRepository.save(any(Day.class))).thenReturn(day);
		
		DayDto result = nutritionTrackerServiceForServiceTests.addFoodsToDay(1L, List.of());
		
		assertNotNull(result);
	}

	@Test
	void testDeleteFoodsInDayValid() {
		when(nutritionTrackerDayRepository.findById(1L)).thenReturn(Optional.of(day));
		when(nutritionTrackerFoodRepository.findById(any(Long.class))).thenReturn(Optional.of(foodTwo));
		when(nutritionTrackerDayRepository.save(any(Day.class))).thenReturn(day);
		
		DayDto result = nutritionTrackerServiceForServiceTests.deleteFoodsInDay(1L, List.of());
		
		assertNotNull(result);
	}
	
	@Test
	public void testCalculateTotalDayStatsInvalidNullDay() {
		day = null;
				
		assertThrows(IllegalArgumentException.class, () -> nutritionTrackerServiceForServiceTests.calculateTotalDayStats(day));
	}
	
	@Test
	public void testEditWaterIntakeValid() {
		when(nutritionTrackerDayRepository.findById(1L)).thenReturn(Optional.of(day));
		when(nutritionTrackerDayRepository.save(any(Day.class))).thenReturn(day);

		DayDto result = nutritionTrackerServiceForServiceTests.editWaterIntake(1L, 15);
		
		assertNotNull(result);
	}
	
	@Test
	public void testEditWaterIntakeInvalidWaterIntakeUnder0() {
		when(nutritionTrackerDayRepository.findById(1L)).thenReturn(Optional.of(day));
		when(nutritionTrackerDayRepository.save(any(Day.class))).thenReturn(day);

		DayDto result = nutritionTrackerServiceForServiceTests.editWaterIntake(1L, -1);
		
		assertNotNull(result);
	}
	
	@Test
	public void testEditWaterIntakeInvalidDayNotInDatabase() {
		when(nutritionTrackerDayRepository.findById(1L)).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> nutritionTrackerServiceForServiceTests.editWaterIntake(1L, 15));
	}
}
