package com.riptFitness.Ript_Fitness_Backend.web.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.NutritionTrackerService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.DayDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.FoodDto;

@RestController		//Tells Spring Boot that this is a Controller class containing HTTP endpoints that front end will hit via HTTP request
@RequestMapping("/nutritionCalculator")		//All HTTP requests to these endpoints will have URL starting with "localhost:8080/nutritionCaluclator...")
public class NutritionTrackerController {

	//Each endpoint will call a method from NutritionTrackerService.java
	NutritionTrackerService nutritionTrackerService;
	
	//Will automatically be called via dependency injection, you MUST include this in your Controller
	public NutritionTrackerController(NutritionTrackerService nutritionTrackerService) {
		this.nutritionTrackerService = nutritionTrackerService;
	}
	
	//To call this endpoint, use URL: localhost:8080/nutritionCalculator/addFood. Include a FoodDto object in JSON form in body of request, this object will be added to database
	@PostMapping("/addFood")
	public ResponseEntity<FoodDto> addFood(@RequestBody FoodDto foodDto){
		FoodDto savedFoodObject = nutritionTrackerService.addFood(foodDto);
		return new ResponseEntity<>(savedFoodObject, HttpStatus.CREATED);
	}
	
	//localhost:8080/nutritionCalculator/getFood/{INSERT FOOD ID NUMBER HERE}, body is empty in this request
	@GetMapping("/getFood/{foodName}")
	public ResponseEntity<FoodDto> getFoodStats(@PathVariable String foodName){
		FoodDto returnedFoodObject = nutritionTrackerService.getFoodStats(foodName);
		return ResponseEntity.ok(returnedFoodObject);
	}
	
	//localhost:8080/nutritionCalculator/editFood/{INSERT FOOD ID NUMBER HERE}, body is empty in this request
	@PutMapping("/editFood/{foodName}")
	public ResponseEntity<FoodDto> editFood(@PathVariable String foodName, @RequestBody FoodDto foodDto){
		FoodDto foodToBeEdited = nutritionTrackerService.editFood(foodName, foodDto);
		return ResponseEntity.ok(foodToBeEdited);
	}
	
	//localhost:8080/nutritionCalculator/deleteFood/{INSERT FOOD ID NUMBER HERE}, body is empty in this request
	@DeleteMapping("/deleteFood/{foodName}")
	public ResponseEntity<FoodDto> deleteFood(@PathVariable String foodName){
		FoodDto foodToBeSoftDeleted = nutritionTrackerService.deleteFood(foodName);
		return ResponseEntity.ok(foodToBeSoftDeleted);
	}
	
	//localhost:8080/nutritionCalculator/addDay. A DayDto object should be included in the body of the request in JSON format
	@PostMapping("/addDay")
	public ResponseEntity<DayDto> addDay(@RequestBody DayDto dayDto){
		DayDto savedDayObject = nutritionTrackerService.addDay(dayDto);
		return new ResponseEntity<>(savedDayObject, HttpStatus.CREATED);
	}
	
	//localhost:8080/nutritionCalculator/getDay/{INSERT DAY ID NUMBER HERE}
	@PutMapping("/getDay/{dayId}")
	public ResponseEntity<DayDto> getDayStats(@PathVariable Long dayId){
		DayDto returnedDayObject = nutritionTrackerService.getDayStats(dayId);
		return ResponseEntity.ok(returnedDayObject);
	}
	
	//localhost:8080/nutritionCalculator/deleteDay/{INSERT DAY ID NUMBER HERE}
	@DeleteMapping("/deleteDay/{dayId}")
	public ResponseEntity<DayDto> deleteDay(@PathVariable Long dayId){
		DayDto dayToBeSoftDeleted = nutritionTrackerService.deleteDay(dayId);
		return ResponseEntity.ok(dayToBeSoftDeleted);
	}
	
	//localhost:8080/nutritionCalculator/addFoodsToDay/{INSERT DAY ID BEING INSERTED INTO HERE}. Include a list of Food Ids that will be added to this DayDto object in database in body of request in "[number, number]" format (any number of Foods)
	@PostMapping("/addFoodsToDay/{dayId}")
	public ResponseEntity<DayDto> addFoodsToDay(@PathVariable Long dayId, @RequestBody List<Long> foodIds){
		DayDto updatedDayObject = nutritionTrackerService.addFoodsToDay(dayId, foodIds);
		return new ResponseEntity<>(updatedDayObject, HttpStatus.CREATED);
	}
	
	//localhost:8080/nutritionCalculator/deleteFoodsInDay/{INSERT DAY ID BEING CHANGED IN HERE}. Include a list of Food Ids that will be deleted to this DayDto object in database in body of request in "[number, number]" format (any number of Foods)
	@PostMapping("/deleteFoodsInDay/{dayId}")
	public ResponseEntity<DayDto> deleteFoodsInDay(@PathVariable Long dayId, @RequestBody List<Long> foodIds){
		DayDto updatedDayObject = nutritionTrackerService.deleteFoodsInDay(dayId, foodIds);
		return new ResponseEntity<>(updatedDayObject, HttpStatus.CREATED);
	}
	
}