package com.riptFitness.Ript_Fitness_Backend.web.controllerTests;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.config.JwtUtil;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.config.SecurityConfig;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Day;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Food;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.NutritionTrackerService;
import com.riptFitness.Ript_Fitness_Backend.web.controller.NutritionTrackerController;
import com.riptFitness.Ript_Fitness_Backend.web.dto.DayDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.FoodDto;

@WebMvcTest(NutritionTrackerController.class)
@ActiveProfiles("test")
@Import(SecurityConfig.class)
public class NutritionTrackerControllerTest {
	
	@Autowired
	private MockMvc mockMvc;
	
	@MockBean
	private static NutritionTrackerService nutritionTrackerService;
	
	@Autowired
	private ObjectMapper objectMapper;
	
	@MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsService userDetailsService;

	
	private FoodDto foodDto;
	private FoodDto foodDtoTwo;
	private Food food;
	private Food foodTwo;
	private DayDto dayDto;
	private Day day;
	
	@BeforeEach
	public void setUp() {
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
		dayDto.totalWaterConsumed = 0;

		day = new Day();
		day.foodsEatenInDay = List.of(food, foodTwo);
		day.totalWaterConsumed = 0;
	}
	
	@AfterAll
	public static void tearDown() {
		reset(nutritionTrackerService);
	}

	//Controller tests
	@Test
	public void testAddFoodValidRequest() throws Exception{
		when(nutritionTrackerService.addFood(any(FoodDto.class))).thenReturn(foodDto);
			
		mockMvc.perform(post("/nutritionCalculator/addFood")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsBytes(foodDto)))
				.andExpect(status().isCreated())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.name").value("Protein bar"))
				.andExpect(jsonPath("$.calories").value(400))
				.andExpect(jsonPath("$.protein").value(30))
				.andExpect(jsonPath("$.carbs").value(40))
				.andExpect(jsonPath("$.fat").value(21))
				.andExpect(jsonPath("$.cholesterol").value(200))
				.andExpect(jsonPath("$.saturatedFat").value(22))
				.andExpect(jsonPath("$.transFat").value(1))
				.andExpect(jsonPath("$.sodium").value(10))
				.andExpect(jsonPath("$.fiber").value(3))
				.andExpect(jsonPath("$.sugars").value(150))
				.andExpect(jsonPath("$.calcium").value(17))
				.andExpect(jsonPath("$.iron").value(2))
				.andExpect(jsonPath("$.potassium").value(11))
				.andExpect(jsonPath("$.serving").value(1.0))
				.andReturn();	
	}
	
	@Test
	public void testAddFoodInvalidRequestEmptyBody() throws Exception{
		mockMvc.perform(post("/nutritionCalculator/addFood")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpect(status().isInternalServerError())
				.andReturn();
	}	
	@Test
	public void testGetFoodValidRequest() throws Exception{
		when(nutritionTrackerService.getFoodStats(any(Long.class))).thenReturn(foodDto);
		
		mockMvc.perform(get("/nutritionCalculator/getFood/1")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.name").value("Protein bar"))
				.andExpect(jsonPath("$.calories").value(400))
				.andExpect(jsonPath("$.protein").value(30))
				.andExpect(jsonPath("$.carbs").value(40))
				.andExpect(jsonPath("$.fat").value(21))
				.andExpect(jsonPath("$.cholesterol").value(200))
				.andExpect(jsonPath("$.saturatedFat").value(22))
				.andExpect(jsonPath("$.transFat").value(1))
				.andExpect(jsonPath("$.sodium").value(10))
				.andExpect(jsonPath("$.fiber").value(3))
				.andExpect(jsonPath("$.sugars").value(150))
				.andExpect(jsonPath("$.calcium").value(17))
				.andExpect(jsonPath("$.iron").value(2))
				.andExpect(jsonPath("$.potassium").value(11))
				.andExpect(jsonPath("$.serving").value(1.0))
				.andReturn();	
	}
	
	@Test
	public void testGetFoodsOfLoggedInUserValidRequest() throws Exception {
		ArrayList<FoodDto> returnedArrayList = new ArrayList<>();
		returnedArrayList.add(foodDto);
		
		when(nutritionTrackerService.getFoodsOfLoggedInUser(any(Integer.class), any(Integer.class))).thenReturn(returnedArrayList);
		
		mockMvc.perform(get("/nutritionCalculator/getFoodsOfLoggedInUser/0/0")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$[0].name").value("Protein bar"))
				.andReturn();
	}
	
	@Test
	public void testGetFoodsOfLoggedInUserInvalidRequestNoPathVariables() throws Exception {
		mockMvc.perform(get("/nutritionCalculator/getFoodsOfLoggedInUser"))
				.andExpect(status().isInternalServerError());			
	}

	@Test
	public void testEditFoodValidRequest() throws Exception{
		when(nutritionTrackerService.editFood(any(Long.class), any(FoodDto.class))).thenReturn(foodDto);
		
		mockMvc.perform(put("/nutritionCalculator/editFood/1")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(foodDto)))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.name").value("Protein bar"))
				.andExpect(jsonPath("$.calories").value(400))
				.andExpect(jsonPath("$.protein").value(30))
				.andExpect(jsonPath("$.carbs").value(40))
				.andExpect(jsonPath("$.fat").value(21))
				.andExpect(jsonPath("$.cholesterol").value(200))
				.andExpect(jsonPath("$.saturatedFat").value(22))
				.andExpect(jsonPath("$.transFat").value(1))
				.andExpect(jsonPath("$.sodium").value(10))
				.andExpect(jsonPath("$.fiber").value(3))
				.andExpect(jsonPath("$.sugars").value(150))
				.andExpect(jsonPath("$.calcium").value(17))
				.andExpect(jsonPath("$.iron").value(2))
				.andExpect(jsonPath("$.potassium").value(11))
				.andExpect(jsonPath("$.serving").value(1.0))
				.andReturn();	
	}
	
	@Test
	public void testEditFoodInvalidRequestEmptyBody() throws Exception{
		mockMvc.perform(put("/nutritionCalculator/editFood/1")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpect(status().isInternalServerError())
				.andReturn();
	}
	
	@Test
	public void testDeleteFoodValidRequest() throws Exception{
		foodDto.isDeleted = true;
		
		when(nutritionTrackerService.deleteFood(any(Long.class))).thenReturn(foodDto);
		
		mockMvc.perform(delete("/nutritionCalculator/deleteFood/1")
				.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.isDeleted").value(true))
				.andReturn();	
	}
	
	@Test
	public void testAddDayValidRequest() throws Exception{
		when(nutritionTrackerService.addDay(any(DayDto.class))).thenReturn(dayDto);
				
		mockMvc.perform(post("/nutritionCalculator/addDay")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(dayDto)))
				.andExpect(status().isCreated())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andReturn();
	}
	
	@Test
	public void testAddDayInvalidRequestEmptyBody() throws Exception{
		mockMvc.perform(post("/nutritionCalculator/addDay")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpect(status().isInternalServerError())
				.andReturn();
	}
	
	@Test
	public void testGetDayValidRequest() throws Exception{
		when(nutritionTrackerService.getDayStats(any(Long.class))).thenReturn(dayDto);
		
		mockMvc.perform(put("/nutritionCalculator/getDay/1")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andReturn();
	}
	
	@Test
	public void testGetDayOfLoggedInUserValidRequest() throws Exception {
		when(nutritionTrackerService.getDayOfLoggedInUser(0)).thenReturn(dayDto);
		
		mockMvc.perform(get("/nutritionCalculator/getDayOfLoggedInUser/0")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("foodsEatenInDay.size()").value(2))
				.andReturn();
	}
	
	@Test
	public void testGetDayOfLoggedInUserInvalidRequestNoPathVariable() throws Exception {
		mockMvc.perform(get("/nutritionCalculator/getDayOfLoggedInUser"))
				.andExpect(status().isInternalServerError());
	}
	
	@Test
	public void testDeleteDayValidRequest() throws Exception{
		dayDto.isDeleted = true;
		
		when(nutritionTrackerService.deleteDay(any(Long.class))).thenReturn(dayDto);
		
		mockMvc.perform(delete("/nutritionCalculator/deleteDay/1")
				.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.isDeleted").value(true))
				.andReturn();
	}
	
	@Test
	public void testAddFoodsToDayInvalidRequestEmptyBody() throws Exception{
		mockMvc.perform(post("/nutritionCalculator/addFoodsToDay/1")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpect(status().isInternalServerError())
				.andReturn();
	}
	
	@Test
	public void testDeleteFoodsInDayInvalidRequestEmptyBody() throws Exception{
		mockMvc.perform(post("/nutritionCalculator/deleteFoodsInDay/1")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpect(status().isInternalServerError())
				.andReturn();
	}
	
	@Test
	public void testAddFoodsToDayValidRequest() throws Exception {
		when(nutritionTrackerService.addFoodsToDay(any(Long.class), anyList())).thenReturn(dayDto);
		
		mockMvc.perform(post("/nutritionCalculator/addFoodsToDay/1")
				.contentType(MediaType.APPLICATION_JSON)
				.content("[1]"))
				.andExpect(status().isCreated())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.foodsEatenInDay.size()").value(2))
				.andReturn();
	}
	
	@Test
	public void testDeleteFoodsInDayValidRequest() throws Exception {
		when(nutritionTrackerService.deleteFoodsInDay(any(Long.class), anyList())).thenReturn(dayDto);
		
		mockMvc.perform(post("/nutritionCalculator/deleteFoodsInDay/0")
				.contentType(MediaType.APPLICATION_JSON)
				.content("[1]"))
				.andExpect(status().isCreated())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.totalWaterConsumed").value(0))
				.andReturn();
	}
	
	@Test
	public void testEditWaterIntake() throws Exception{		
		when(nutritionTrackerService.editWaterIntake(any(Long.class), any(Integer.class))).thenReturn(dayDto);
		
		mockMvc.perform(put("/nutritionCalculator/editWaterIntake/1/5")
				.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andReturn();
	}
	
}
