package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.mapper.DayMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.mapper.FoodMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Day;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Food;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.NutritionTrackerDayRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.NutritionTrackerFoodRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.DayDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.FoodDto;

@Service 	//Tells Spring Boot that this is a Service method, important for dependency injection, this is REQUIRED
public class NutritionTrackerService {

	//Each method in this class will call the Repository class to make some sort of database interaction
	private NutritionTrackerFoodRepository nutritionTrackerFoodRepository;
	
	private NutritionTrackerDayRepository nutritionTrackerDayRepository;
	
	private AccountsService accountsService;
	
	private AccountsRepository accountsRepository;
    private final RestTemplate restTemplate = new RestTemplate();	
    
    private String usdaApiKey;
    
    private static final Logger logger = LoggerFactory.getLogger(NutritionTrackerService.class);
    
    public String getApiKey() {
        return usdaApiKey;
    }
	
	//Will be automatically called by dependency injection, you MUST include this constructor 
	public NutritionTrackerService(NutritionTrackerFoodRepository nutritionTrackerFoodRepository, NutritionTrackerDayRepository nutritionTrackerDayRepository,
			AccountsService accountsService, AccountsRepository accountsRepository, @Value("${usda.api.key}") String usdaApiKey) {
		this.nutritionTrackerFoodRepository = nutritionTrackerFoodRepository;
		this.nutritionTrackerDayRepository = nutritionTrackerDayRepository;
		this.accountsService= accountsService;
		this.accountsRepository = accountsRepository;
		this.usdaApiKey = usdaApiKey;
	}
	
	//Each method is public and will return a Dto of some sort to the Controller class
	
	//Adds a Food object to the database
	public FoodDto addFood(FoodDto foodDto) {
		Food foodToBeAdded = FoodMapper.INSTANCE.toFood(foodDto);
		foodToBeAdded.name = (foodToBeAdded.name == null) ? "Unnamed food" : foodToBeAdded.name;	//If name is null in HTTP request, set name to "Unnamed food"
		foodToBeAdded.serving = (foodToBeAdded.serving == 0) ? 1 : foodToBeAdded.serving;	//If serving is null in HTTP request, set serving to 1
		Long currentlyLoggedInUserId = accountsService.getLoggedInUserId();
		AccountsModel currentlyLoggedInAccount = accountsRepository.findById(currentlyLoggedInUserId).get();
		foodToBeAdded.account = currentlyLoggedInAccount;
		foodToBeAdded = nutritionTrackerFoodRepository.save(foodToBeAdded);
		return FoodMapper.INSTANCE.toFoodDto(foodToBeAdded);
	}
	
	//Gets a specific row's values from the Food table (with id = foodId) and returns it to the controller class
	public FoodDto getFoodStats(Long foodId) {
		Optional<Food> returnedOptionalFoodObject = nutritionTrackerFoodRepository.findById(foodId);
		
		if(returnedOptionalFoodObject.isEmpty())
			throw new RuntimeException("Food object not found in database with ID = " + foodId);
				
		Food returnedFoodObject = returnedOptionalFoodObject.get();
		
		return FoodMapper.INSTANCE.toFoodDto(returnedFoodObject);
	}
	
	public ArrayList<FoodDto> getFoodsOfLoggedInUser(Integer startIndex, Integer endIndex){
		if(startIndex > endIndex)
			throw new RuntimeException("Start index cannot be greater than end index. Start index = " + startIndex + ", end index = " + endIndex);
		
		if(startIndex < 0 || endIndex < 0)
			throw new RuntimeException("Start index and end index must be greater than 0. Start index = " + startIndex + ", end index = " + endIndex);
		
		Long currentUsersAccountId = accountsService.getLoggedInUserId();
		
		Optional<ArrayList<Food>> optionalFoodList = nutritionTrackerFoodRepository.getFoodsFromAccountId(currentUsersAccountId);
		
		if(optionalFoodList.isEmpty())
			return new ArrayList<FoodDto>();
		
		ArrayList<Food> foodsFromAccountId = optionalFoodList.get();
		
		int start = foodsFromAccountId.size() - startIndex - 1;
		int end = foodsFromAccountId.size() - endIndex - 1;
		
		if(start < 0)
			throw new RuntimeException("There are not enough foods from the current user to match the path variables provided.");
		
		if(start >= foodsFromAccountId.size()) 
			start = foodsFromAccountId.size() - 1;
		
		if(end < 0)
			end = 0;
		
		ArrayList<FoodDto> foodDtosFromAccountId = new ArrayList<FoodDto>();
		
		for(int i = start; i >= end; i--) {
			foodDtosFromAccountId.add(FoodMapper.INSTANCE.toFoodDto(foodsFromAccountId.get(i)));
		}
		
		return foodDtosFromAccountId;
	}
	
	//Edits a specific row's values from the Food table (with id = foodId) to match stats with foodDto and returns the updated object to the controller class
	public FoodDto editFood(Long foodId, FoodDto foodDto) {
		Optional<Food> optionalFoodToBeEdited = nutritionTrackerFoodRepository.findById(foodId);
		
		if(optionalFoodToBeEdited.isEmpty())
			throw new RuntimeException("Food object not found in database with ID = " + foodId);
		
		Food foodToBeEdited = optionalFoodToBeEdited.get();
		
		FoodMapper.INSTANCE.updateFoodRowFromDto(foodDto, foodToBeEdited);
		
		Long currentlyLoggedInUserId = accountsService.getLoggedInUserId();
		AccountsModel currentlyLoggedInUser = accountsRepository.findById(currentlyLoggedInUserId).get();
		foodToBeEdited.account = currentlyLoggedInUser;
		
		foodToBeEdited = nutritionTrackerFoodRepository.save(foodToBeEdited);
		return FoodMapper.INSTANCE.toFoodDto(foodToBeEdited);
	}
	
	public FoodDto deleteFood(Long foodId) {
		Optional<Food> optionalFoodToBeDeleted = nutritionTrackerFoodRepository.findById(foodId);
		
		if(optionalFoodToBeDeleted.isEmpty())
			throw new RuntimeException("Food object not found in database with name = " + foodId);
		
		Food foodToBeDeleted = optionalFoodToBeDeleted.get();
		
		foodToBeDeleted.isDeleted = true;
		nutritionTrackerFoodRepository.save(foodToBeDeleted);
		return FoodMapper.INSTANCE.toFoodDto(foodToBeDeleted);
	}
	
	public DayDto addDay(DayDto dayDto) {
		Day dayToBeAdded = DayMapper.INSTANCE.toDay(dayDto);
		Long currentlyLoggedInUserId = accountsService.getLoggedInUserId();
		AccountsModel currentlyLoggedInUser = accountsRepository.findById(currentlyLoggedInUserId).get();
		dayToBeAdded.account = currentlyLoggedInUser;
		dayToBeAdded = nutritionTrackerDayRepository.save(dayToBeAdded);
		return DayMapper.INSTANCE.toDayDto(dayToBeAdded);
	}
	
	public DayDto getDayStats(Long dayId) {
		Optional<Day> returnedOptionalDayObject = nutritionTrackerDayRepository.findById(dayId);
		
		if(returnedOptionalDayObject.isEmpty())
			throw new RuntimeException("Day object not found in database with ID = " + dayId);
		
		Day returnedDayObject = returnedOptionalDayObject.get();
		
		calculateTotalDayStats(returnedDayObject);
		
		nutritionTrackerDayRepository.save(returnedDayObject);
		
		return DayMapper.INSTANCE.toDayDto(returnedDayObject);
	}
	
	public DayDto getDayOfLoggedInUser(Integer startIndex){		
		if(startIndex < 0)
			throw new RuntimeException("Start index must be greater than 0. Start index = " + startIndex);
		
		Long currentUsersAccountId = accountsService.getLoggedInUserId();
		
		Optional<ArrayList<Day>> optionalDayList = nutritionTrackerDayRepository.getDaysFromAccountId(currentUsersAccountId);
		
		if(optionalDayList.isEmpty())
			throw new RuntimeException("The currently logged in user does not have any Day objects saved in the database.");

		ArrayList<Day> daysFromAccountId = optionalDayList.get();
		
		int indexReturned = daysFromAccountId.size() - startIndex - 1;
		
		if(indexReturned < 0)
			throw new RuntimeException("There are not enough days from the current user to match the path variable provided. Number of Day objects in database for current user = " + daysFromAccountId.size() + ", the path variable provided = " + startIndex);
		
		return DayMapper.INSTANCE.toDayDto(daysFromAccountId.get(indexReturned));
	}
	
	public DayDto deleteDay(Long dayId) {
		Optional<Day> optionalDayToBeDeleted = nutritionTrackerDayRepository.findById(dayId);
		
		if(optionalDayToBeDeleted.isEmpty())
			throw new RuntimeException("Day object not found in database with ID = " + dayId);
		
		Day dayToBeDeleted = optionalDayToBeDeleted.get();
		
		dayToBeDeleted.isDeleted = true;
		nutritionTrackerDayRepository.save(dayToBeDeleted);
		return DayMapper.INSTANCE.toDayDto(dayToBeDeleted);
	}
	
	public DayDto addFoodsToDay(Long dayId, List<Long> foodIds) {
		Optional<Day> optionalDayBeingUpdated = nutritionTrackerDayRepository.findById(dayId);
		
		if(optionalDayBeingUpdated.isEmpty())
			throw new RuntimeException("Day object not found in database with ID = " + dayId);
		
		Day dayBeingUpdated = optionalDayBeingUpdated.get();
		
		List<Food> foodsAddedToDayObject = new ArrayList<>();
		
		for(Long foodId : foodIds) {
			Optional<Food> nextOptionalFoodObjectAdded = nutritionTrackerFoodRepository.findById(foodId);
			
			if(nextOptionalFoodObjectAdded.isEmpty())
				throw new RuntimeException("Food object not found in database with ID = " + foodId + " when trying to add Food object to Day object. No Foods were added to the Day object.");
				
			Food nextFoodObjectAdded = nextOptionalFoodObjectAdded.get();
			
			foodsAddedToDayObject.add(nextFoodObjectAdded);
		}
		
		for(Food foodInList : foodsAddedToDayObject) {
			dayBeingUpdated.foodsEatenInDay.add(foodInList);
		}
		
		calculateTotalDayStats(dayBeingUpdated);	
		nutritionTrackerDayRepository.save(dayBeingUpdated);
		return DayMapper.INSTANCE.toDayDto(dayBeingUpdated);
	}
	
	public DayDto deleteFoodsInDay(Long dayId, List<Long> foodIds) {
		Optional<Day> optionalDayBeingUpdated = nutritionTrackerDayRepository.findById(dayId);
		
		if(optionalDayBeingUpdated.isEmpty())
			throw new RuntimeException("Day object not found in database with ID = " + dayId);
		
		Day dayBeingUpdated = optionalDayBeingUpdated.get();
		
		List<Food> foodsAddedToDayObject = new ArrayList<>();
		
		for(Long foodId : foodIds) {
			Optional<Food> nextOptionalFoodObjectAdded = nutritionTrackerFoodRepository.findById(foodId);
			
			if(nextOptionalFoodObjectAdded.isEmpty())
				throw new RuntimeException("Food object not found in database with ID = " + foodId + " when trying to delete Food object to Day object. No Foods were deleted from the Day object.");
				
			Food nextFoodObjectAdded = nextOptionalFoodObjectAdded.get();
			
			foodsAddedToDayObject.add(nextFoodObjectAdded);
		}
		
		for(Food foodInList : foodsAddedToDayObject) {
			dayBeingUpdated.foodsEatenInDay.remove(foodInList);
		}
		
		calculateTotalDayStats(dayBeingUpdated);	
		nutritionTrackerDayRepository.save(dayBeingUpdated);
		return DayMapper.INSTANCE.toDayDto(dayBeingUpdated);
	}
	
	public DayDto editWaterIntake(Long dayId, int waterIntake) {
		Optional<Day> optionalDayBeingUpdated = nutritionTrackerDayRepository.findById(dayId);
		
		if(optionalDayBeingUpdated.isEmpty())
			throw new RuntimeException("Day object not found in database with ID = " + dayId);
		
		Day dayBeingUpdated = optionalDayBeingUpdated.get();
		
		dayBeingUpdated.totalWaterConsumed = waterIntake;
		
		if(dayBeingUpdated.totalWaterConsumed < 0)
			dayBeingUpdated.totalWaterConsumed = 0;
		
		nutritionTrackerDayRepository.save(dayBeingUpdated);
		
		return DayMapper.INSTANCE.toDayDto(dayBeingUpdated);
	}
	
	public void calculateTotalDayStats(Day day) {	
		if(day == null)
			throw new IllegalArgumentException("Day cannot be null in calculateTotalDayStats method in CalculateStats class.");
		
		int totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, totalCholesterol = 0;
		int totalSaturatedFat=0, totalTransFat = 0, totalSodium = 0, totalFiber = 0, totalSugars = 0;
		int totalCalcium = 0, totalIron = 0, totalPotassium = 0;
		
		for(Food food : day.foodsEatenInDay) {
			if(food.isDeleted)
				continue;
			totalCalories += food.calories * food.serving;
			totalProtein += food.protein * food.serving;
			totalCarbs += food.carbs * food.serving;
			totalFat += food.fat * food.serving;
			totalCholesterol += food.cholesterol * food.serving;
			totalSaturatedFat += food.saturatedFat * food.serving;
			totalTransFat += food.transFat * food.serving;
			totalSodium += food.sodium * food.serving;
			totalFiber += food.fiber * food.serving;
			totalSugars += food.sugars * food.serving;
			totalCalcium += food.calcium * food.serving;
			totalIron += food.iron * food.serving;
			totalPotassium += food.potassium * food.potassium;
		}
		
		day.calories = totalCalories;
		day.totalProtein = totalProtein;
		day.totalCarbs = totalCarbs;
		day.totalFat = totalFat;
		day.totalCholesterol = totalCholesterol;
		day.totalSaturatedFat = totalSaturatedFat;
		day.totalTransFat = totalTransFat;
		day.totalSodium = totalSodium;
		day.totalFiber = totalFiber;
		day.totalSugars = totalSugars;
		day.totalCalcium = totalCalcium;
		day.totalIron = totalIron;
		day.totalPotassium = totalPotassium;
		
	}
	
	public FoodDto getFoodByBarcode(String barcode) {
	    Food food = nutritionTrackerFoodRepository.findByBarcode(barcode).orElseGet(() -> {
	            Food fetchedFood = fetchAndStoreFoodFromUSDA(barcode);
	            if (fetchedFood == null) {
	                throw new RuntimeException("Food not found in USDA database for barcode: " + barcode);
	            }
	            return fetchedFood;
	        });

	    return FoodMapper.INSTANCE.toFoodDto(food);
	}


	public Food fetchAndStoreFoodFromUSDA(String barcode) {
	    String brandedUrl = "https://api.nal.usda.gov/fdc/v1/foods/search?query=" + barcode 
	        + "&dataType=Branded&api_key=" + usdaApiKey;

	    String genericUrl = "https://api.nal.usda.gov/fdc/v1/foods/search?query=" + barcode 
	        + "&dataType=Foundation&api_key=" + usdaApiKey;
	    
	    String legacyUrl = "https://api.nal.usda.gov/fdc/v1/foods/search?query=" + barcode 
	            + "&dataType=SRLegacy&api_key=" + usdaApiKey;


	    Food food = fetchFoodFromUSDA(brandedUrl, barcode);
	    if (food != null) {
	        return food;
	    }

	    food = fetchFoodFromUSDA(genericUrl, barcode);
	    if (food != null) {
	        return food;
	    }

	    return fetchFoodFromUSDA(legacyUrl, barcode);
	}

	private Food fetchFoodFromUSDA(String url, String barcode) {
	    logger.info("Fetching food data from USDA API with URL: {}", url);
	    
	    try {
	        String jsonResponse = restTemplate.getForObject(url, String.class);
	        logger.info("USDA API Response: {}", jsonResponse);
	        ObjectMapper objectMapper = new ObjectMapper();
	        JsonNode rootNode = objectMapper.readTree(jsonResponse);

	        // Declare variables with default values
	        String description = "Unknown";
	        String brand = "Unknown Brand";
	        double calories = 0.0, protein = 0.0, carbs = 0.0, fat = 0.0, fiber = 0.0;
	        double cholesterol = 0.0, saturatedFat = 0.0, transFat = 0.0, sodium = 0.0;
	        double sugars = 0.0, calcium = 0.0, iron = 0.0, potassium = 0.0;
	        double serving = 1.0; // Default to 1 if missing

	        // Check if the response contains food data
	        if (rootNode.has("foods") && rootNode.get("foods").isArray() && rootNode.get("foods").size() > 0) {
	            JsonNode foodNode = rootNode.get("foods").get(0);
	            description = foodNode.has("description") ? foodNode.get("description").asText() : "Unknown";
	            brand = foodNode.has("brandName") ? foodNode.get("brandName").asText() : "Unknown Brand";
	            logger.info("Food found: {}", description);

	            if (foodNode.has("servingSize") && !foodNode.get("servingSize").isNull()) {
	                serving = foodNode.get("servingSize").asDouble(); //  Extract serving size safely
	            }

	            if (!foodNode.has("foodNutrients") || !foodNode.get("foodNutrients").isArray()) {
	                throw new RuntimeException("No nutrients found in USDA response.");
	            }

	            for (JsonNode nutrient : foodNode.get("foodNutrients")) {
	                if (!nutrient.has("nutrientId") || !nutrient.has("value") || nutrient.get("value").isNull()) {
	                    continue;
	                }

	                int nutrientId = nutrient.get("nutrientId").asInt();
	                double value = nutrient.get("value").asDouble(); // Extract value safely

	                switch (nutrientId) {
	                    case 1008 -> calories = value;
	                    case 1005 -> carbs = value;
	                    case 1003 -> protein = value;
	                    case 1004 -> fat = value;
	                    case 1253 -> cholesterol = value;
	                    case 1258 -> saturatedFat = value;
	                    case 1257 -> transFat = value;
	                    case 1093 -> sodium = value;
	                    case 1079 -> fiber = value;
	                    case 2000 -> sugars = value;
	                    case 1087 -> calcium = value;
	                    case 1089 -> iron = value;
	                    case 1092 -> potassium = value;
	                }
	            }
	        }

	        // Create Food object
	        Food foodItem = new Food();
	        foodItem.barcode = barcode;
	        foodItem.name = brand.equals("Unknown Brand") ? description : brand + " - " + description;
	        foodItem.calories = calories;
	        foodItem.protein = protein;
	        foodItem.carbs = carbs;
	        foodItem.fat = fat;
	        foodItem.cholesterol = cholesterol;
	        foodItem.saturatedFat = saturatedFat;
	        foodItem.transFat = transFat;
	        foodItem.sodium = sodium;
	        foodItem.sugars = sugars;
	        foodItem.calcium = calcium;
	        foodItem.iron = iron;
	        foodItem.potassium = potassium;
	        foodItem.fiber = fiber;
	        foodItem.serving = serving;
	        foodItem.isDeleted = false;

	        return nutritionTrackerFoodRepository.save(foodItem);
	    } catch (IOException e) {
	        logger.error("Error fetching food from USDA API: {}", e.getMessage(), e);
	        throw new RuntimeException("Error parsing USDA API response", e);
	    }
	}



}
