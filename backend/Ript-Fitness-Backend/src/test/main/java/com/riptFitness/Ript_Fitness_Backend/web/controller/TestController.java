package com.riptFitness.Ript_Fitness_Backend.web.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.TestService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.TestDto;

@RestController
@RequestMapping("/controller")
public class TestController {
	
	TestService testService;
	
	public TestController(TestService testService) {
		this.testService = testService;
	}

	@GetMapping("/test")
	public ResponseEntity<String> testEndpoint(){
		String returnedString = testService.testEndpointService();
		return new ResponseEntity<>(returnedString, HttpStatus.OK);
	}
	
	// Below is an example of entering something into the database (POST):
	@PostMapping("/testAdd")
	public ResponseEntity<TestDto> addTestObj(@RequestBody TestDto testDto) {
		TestDto testObject = testService.testAddDto(testDto);
		return new ResponseEntity<>(testObject, HttpStatus.CREATED);
	}
	
}
