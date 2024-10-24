package com.riptFitness.Ript_Fitness_Backend.infastructure.serviceTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.riptFitness.Ript_Fitness_Backend.domain.model.Day;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Food;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.NutritionTrackerDayRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.NutritionTrackerFoodRepository;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.NutritionTrackerService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.DayDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.FoodDto;

public class NutritionTrackerServiceTest {

	@Mock
	private NutritionTrackerFoodRepository nutritionTrackerFoodRepository;
	
	@Mock
	private NutritionTrackerDayRepository nutritionTrackerDayRepository;
	
	@InjectMocks
	private NutritionTrackerService nutritionTrackerServiceForServiceTests;
	
	private FoodDto foodDto;
	private FoodDto foodDtoTwo;
	private Food food;
	private Food foodTwo;
	private DayDto dayDto;
	private Day day;
	
	@BeforeEach
	public void setUp() {
		MockitoAnnotations.openMocks(this);

		foodDto = new FoodDto();
		foodDto.name = "Protein bar";
		foodDto.calories = 400;
		foodDto.protein = 30;
		foodDto.carbs = 40;
		foodDto.fat = 21;
		foodDto.multiplier = 1.0;
		
		food = new Food();
		food.name = "Protein bar";
		food.calories = 400;
		food.protein = 30;
		food.carbs = 40;
		food.fat = 21;
		food.multiplier = 1.0;
		
		foodDtoTwo = new FoodDto();
		foodDtoTwo.name = "Chicken breast";
		foodDtoTwo.calories = 500;
		foodDtoTwo.protein = 100;
		foodDtoTwo.carbs = 0;
		foodDtoTwo.fat = 9;
		foodDtoTwo.multiplier = 0.5;
		
		foodTwo = new Food();
		foodTwo.name = "Chicken breast";
		foodTwo.calories = 500;
		foodTwo.protein = 100;
		foodTwo.carbs = 0;
		foodTwo.fat = 9;
		foodTwo.multiplier = 0.5;
				
		dayDto = new DayDto();
		dayDto.foodsEatenInDay = List.of(food, foodTwo);

		day = new Day();
		day.foodsEatenInDay = List.of(food, foodTwo);
	}
	
	@Test
	void testServiceAddFoodValid() {
		when(nutritionTrackerFoodRepository.save(any(Food.class))).thenReturn(food);
		
		FoodDto result = nutritionTrackerServiceForServiceTests.addFood(foodDto);
		
		assertNotNull(result);
		assertEquals("Protein bar", result.name);
		assertEquals(21, result.fat);
	}
	
	@Test
	void testServiceAddFoodInvalidNullFoodDto() {
		FoodDto result = nutritionTrackerServiceForServiceTests.addFood(null);
		
		assertNull(result);
	}
	
	@Test
	void testServiceGetFoodStatsValid() {
		when(nutritionTrackerFoodRepository.findById(1L)).thenReturn(Optional.of(food));
		
		FoodDto result = nutritionTrackerServiceForServiceTests.getFoodStats(1L);
		
		assertNotNull(result);
		assertEquals(40, result.carbs);
	}
	
	@Test
	void testServiceGetFoodStatsInvalidNotInDatabase() {
		when(nutritionTrackerFoodRepository.findById(1L)).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> nutritionTrackerServiceForServiceTests.getFoodStats(1L));
	}
	
	@Test
	void testServiceEditFoodValid() {
		when(nutritionTrackerFoodRepository.findById(1L)).thenReturn(Optional.of(food));
		when(nutritionTrackerFoodRepository.save(any(Food.class))).thenReturn(food);
		
		FoodDto result = nutritionTrackerServiceForServiceTests.editFood(1L, foodDto);
		
		assertNotNull(result);
		assertEquals(400, result.calories);
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
		
		DayDto result = nutritionTrackerServiceForServiceTests.addDay(dayDto);
		
		assertNotNull(result);
	}
	
	@Test
	void testServiceAddDayInvalidNullDayDto() {
		DayDto result = nutritionTrackerServiceForServiceTests.addDay(null);
		
		assertNull(result);
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
		when(nutritionTrackerFoodRepository.findByName("Chicken breast")).thenReturn(Optional.empty());
		
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
		when(nutritionTrackerFoodRepository.findByName("Chicken breast")).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> nutritionTrackerServiceForServiceTests.deleteFoodsInDay(1L, List.of(2L)));
	}
	
	@Test
	public void testServiceCalculateTotalDayStatsValidRatiosAddTo100() {		
		nutritionTrackerServiceForServiceTests.calculateTotalDayStats(day);
		
		assertEquals(650, day.calories);
		assertEquals(80, day.totalProtein);
		assertEquals(40, day.totalCarbs);
		assertEquals(25, day.totalFat);
	}

	@Test
	public void testCalculateTotalDayStatsInvalidNullDay() {
		day = null;
				
		assertThrows(IllegalArgumentException.class, () -> nutritionTrackerServiceForServiceTests.calculateTotalDayStats(day));
	}
}
