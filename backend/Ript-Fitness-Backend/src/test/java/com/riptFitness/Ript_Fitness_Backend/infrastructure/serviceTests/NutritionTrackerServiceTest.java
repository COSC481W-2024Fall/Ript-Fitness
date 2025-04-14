package com.riptFitness.Ript_Fitness_Backend.infrastructure.serviceTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.client.RestTemplate;

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
	private RestTemplate restTemplate;

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

		try {
			Field field = NutritionTrackerService.class.getDeclaredField("usdaApiKey");
			field.setAccessible(true);
			field.set(nutritionTrackerServiceForServiceTests, "FAKE_API_KEY");
		} catch (Exception e) {
			throw new RuntimeException("Failed to set API key via reflection", e);
		}

		food = new Food();
		food.name = "Protein bar";
		food.barcode = "123456";
		food.calories = 400.0;
		food.protein = 30.0;
		food.carbs = 40.0;
		food.fat = 21.0;
		food.serving = 1.0;
		food.cholesterol = 200.0;
		food.saturatedFat = 22.0;
		food.transFat = 1.0;
		food.sodium = 10.0;
		food.fiber = 3.0;
		food.sugars = 150.0;
		food.calcium = 17.0;
		food.iron = 2.0;
		food.potassium = 11.0;
		food.account = account;

		foodDto = new FoodDto();
		foodDto.name = "Protein bar";
		food.barcode = "123456";
		foodDto.calories = 400.0;
		foodDto.protein = 30.0;
		foodDto.carbs = 40.0;
		foodDto.fat = 21.0;
		foodDto.cholesterol = 200.0;
		foodDto.saturatedFat = 22.0;
		foodDto.transFat = 1.0;
		foodDto.sodium = 10.0;
		foodDto.fiber = 3.0;
		foodDto.sugars = 150.0;
		foodDto.calcium = 17.0;
		foodDto.iron = 2.0;
		foodDto.potassium = 11.0;
		foodDto.serving = 1.0;

		foodTwo = new Food();
		foodTwo.name = "Chicken breast";
		food.barcode = "654321";
		foodTwo.calories = 500.0;
		foodTwo.protein = 100.0;
		foodTwo.carbs = 0.0;
		foodTwo.fat = 9.0;
		foodTwo.cholesterol = 100.0;
		foodTwo.saturatedFat = 39.0;
		foodTwo.transFat = 0.0;
		foodTwo.sodium = 18.0;
		foodTwo.fiber = 30.0;
		foodTwo.sugars = 10.0;
		foodTwo.calcium = 23.0;
		foodTwo.iron = 7.0;
		foodTwo.potassium = 13.0;
		foodTwo.serving = 0.5;

		foodDtoTwo = new FoodDto();
		foodDtoTwo.name = "Chicken breast";
		food.barcode = "654321";
		foodDtoTwo.calories = 500.0;
		foodDtoTwo.protein = 100.0;
		foodDtoTwo.carbs = 0.0;
		foodDtoTwo.fat = 9.0;
		foodDtoTwo.cholesterol = 100.0;
		foodDtoTwo.saturatedFat = 39.0;
		foodDtoTwo.transFat = 0.0;
		foodDtoTwo.sodium = 18.0;
		foodDtoTwo.fiber = 30.0;
		foodDtoTwo.sugars = 10.0;
		foodDtoTwo.calcium = 23.0;
		foodDtoTwo.iron = 7.0;
		foodDtoTwo.potassium = 13.0;
		foodDtoTwo.serving = 0.5;

		dayDto = new DayDto();
		dayDto.foodsEatenInDay = List.of(foodDto, foodDtoTwo);

		day = new Day();
		day.foodsEatenInDay = List.of(food, foodTwo);
	    day.date = LocalDate.now();
	    day.calories = 900;
	    day.totalProtein = 130;
	    day.totalCarbs = 40;
	    day.totalFat = 30;
	    day.totalSodium = 200;
	    day.totalFiber = 10;
	    day.totalSugars = 15;

		account = new AccountsModel();
		account.setId(1L);
		day.account = account;
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
	    when(nutritionTrackerDayRepository.findLastXDays(anyLong(), any(LocalDate.class)))
	            .thenReturn(Collections.singletonList(day));
	}

	@Test
	void testServiceAddFoodValid() {
		when(nutritionTrackerFoodRepository.save(any(Food.class))).thenReturn(food);
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));

		FoodDto result = nutritionTrackerServiceForServiceTests.addFood(foodDto);

		assertNotNull(result);
		assertEquals("Protein bar", result.name);
		assertEquals(21.0, result.fat);
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
		when(nutritionTrackerFoodRepository.getFoodsFromAccountId(anyLong()))
				.thenReturn(Optional.of(returnedArrayListFromDatabase));

		ArrayList<FoodDto> result = nutritionTrackerServiceForServiceTests.getFoodsOfLoggedInUser(0, 2);

		assertNotNull(result);
		assertEquals(3, result.size());
	}

	@Test
	void testServiceGetFoodsOfLoggedInUserValidIndexesGreaterThanNumberOfObjectsInDatabase() {
		List<Food> foods = List.of(food, foodTwo, food, foodTwo);
		ArrayList<Food> returnedArrayListFromDatabase = new ArrayList<>(foods);

		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(nutritionTrackerFoodRepository.getFoodsFromAccountId(anyLong()))
				.thenReturn(Optional.of(returnedArrayListFromDatabase));

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
		when(nutritionTrackerDayRepository.getDaysFromAccountId(anyLong()))
				.thenReturn(Optional.of(daysReturnedFromDatabase));

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

		assertThrows(RuntimeException.class,
				() -> nutritionTrackerServiceForServiceTests.addFoodsToDay(1L, List.of(2L)));
	}

	@Test
	void testServiceDeleteFoodsInDayInvalidDayNotInDatabase() {
		when(nutritionTrackerDayRepository.findById(1L)).thenReturn(Optional.empty());

		assertThrows(RuntimeException.class,
				() -> nutritionTrackerServiceForServiceTests.deleteFoodsInDay(1L, List.of(2L, 3L)));
	}

	@Test
	void testServiceDeleteFoodsInDayInvalidFoodNotInDatabase() {
		when(nutritionTrackerDayRepository.findById(1L)).thenReturn(Optional.of(day));

		assertThrows(RuntimeException.class,
				() -> nutritionTrackerServiceForServiceTests.deleteFoodsInDay(1L, List.of(2L)));
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

		assertThrows(IllegalArgumentException.class,
				() -> nutritionTrackerServiceForServiceTests.calculateTotalDayStats(day));
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

	@Test
	public void testGetFoodByBarcode_ExistingFood() {
		when(nutritionTrackerFoodRepository.findByBarcode("123456")).thenReturn(Optional.of(food));

		FoodDto result = nutritionTrackerServiceForServiceTests.getFoodByBarcode("123456");

		assertNotNull(result);
		assertEquals("Protein bar", result.name);
	}


	// Test Food Not Found in USDA API
	@Test
	public void testGetFoodByBarcode_NotInDatabase_AndUSDAFails() {
		when(nutritionTrackerFoodRepository.findByBarcode("000000")).thenReturn(Optional.empty());
		when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(null);

		assertThrows(RuntimeException.class, () -> nutritionTrackerServiceForServiceTests.getFoodByBarcode("000000"));
	}

	// ❌ Test Fetching from USDA API with Invalid Response
	public void testFetchFoodFromUSDA_InvalidResponse() throws Exception {
	    // Mock RestTemplate to return null, simulating an invalid API response
	    when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(null);

	    // Use reflection to access the private method
	    Method method = NutritionTrackerService.class.getDeclaredMethod("fetchFoodFromUSDA", String.class, String.class);
	    method.setAccessible(true); // Allow access to private method

	    // ✅ Updated: Handle InvocationTargetException and extract the actual cause
	    Exception exception = assertThrows(Exception.class, () -> {
	        try {
	            method.invoke(nutritionTrackerServiceForServiceTests, "https://mock-api.com", "654321");
	        } catch (InvocationTargetException e) {
	            throw e.getCause(); // Unwrap the actual exception thrown inside the method
	        }
	    });

	    // ✅ Now check if the actual thrown exception is a RuntimeException
	    assertTrue(exception instanceof RuntimeException);
	    assertEquals("Error parsing USDA API response", exception.getMessage());
	}

//	 ✅ Test Nutrition Trends Calculation chatGPT assisted with this method
	@Test
	public void testGetNutritionTrendsFor7Days() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(nutritionTrackerDayRepository.findLastXDays(anyLong(), any(LocalDate.class)))
				.thenReturn(Collections.singletonList(day));

		Map<LocalDate, Map<String, Double>> result = nutritionTrackerServiceForServiceTests
				.getNutritionTrendsfor7Days();

		assertNotNull(result);
		assertFalse(result.isEmpty());

		LocalDate today = LocalDate.now();

		// ✅ Check if today's date exists in the result
		assertTrue(result.containsKey(today), "Result does not contain today's date!");

		// ✅ Safely retrieve values
		Map<String, Double> dailyStats = result.get(today);
		assertNotNull(dailyStats, "Daily stats are null!");

		// ✅ Use `getOrDefault` to avoid null values
		assertEquals(900, dailyStats.getOrDefault("calories", 0.0));
	}
	
// chatGPT assisted with this method
	@Test
	public void testGetNutritionTrendsFor30Days() {
	    when(accountsService.getLoggedInUserId()).thenReturn(1L);
	    when(nutritionTrackerDayRepository.findLastXDays(anyLong(), any(LocalDate.class)))
	            .thenReturn(Collections.singletonList(day));

	    Map<LocalDate, Map<String, Double>> result = nutritionTrackerServiceForServiceTests.getNutritionTrendsfor30Days();

	    assertNotNull(result, "Result should not be null!");
	    assertFalse(result.isEmpty(), "Result should not be empty!");

	    // ✅ Ensure at least one valid date exists
	    LocalDate matchedDate = result.keySet().stream().findFirst().orElse(null);
	    assertNotNull(matchedDate, "No valid date was found in the result!");

	    // ✅ Safely retrieve daily stats
	    Map<String, Double> dailyStats = result.get(matchedDate);
	    assertNotNull(dailyStats, "Daily stats for the matched date are null!");

	    // ✅ Ensure key exists before accessing it
	    assertTrue(dailyStats.containsKey("calories"), "Calories key is missing!");
	    assertEquals(900, dailyStats.get("calories"));

	    assertTrue(dailyStats.containsKey("protein"), "Protein key is missing!");
	    assertEquals(130, dailyStats.get("protein"));

	    assertTrue(dailyStats.containsKey("carbs"), "Carbs key is missing!");
	    assertEquals(40, dailyStats.get("carbs"));

	    assertTrue(dailyStats.containsKey("fat"), "Fat key is missing!");
	    assertEquals(30, dailyStats.get("fat"));
	}



	// Test No Nutrition Data Available
	@Test
	public void testGetNutritionTrends_NoData() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(nutritionTrackerDayRepository.findLastXDays(anyLong(), any(LocalDate.class)))
				.thenReturn(Collections.emptyList());

		Map<LocalDate, Map<String, Double>> result = nutritionTrackerServiceForServiceTests
				.getNutritionTrendsfor7Days();

		assertNotNull(result);
		assertTrue(result.isEmpty());
	}

	// 🛠 Mock USDA API Response chatGPT assisted with this method
	private String getMockUSDAResponse() {
		return """
				{
				    "foods": [
				        {
				            "description": "Test Description",
				            "brandName": "Test Brand",
				            "foodNutrients": [
				                {"nutrientId": 1008, "value": 150.0},
				                {"nutrientId": 1003, "value": 10.0},
				                {"nutrientId": 1005, "value": 20.0},
				                {"nutrientId": 1004, "value": 5.0}
				            ]
				        }
				    ]
				}
				""";
	}
}
