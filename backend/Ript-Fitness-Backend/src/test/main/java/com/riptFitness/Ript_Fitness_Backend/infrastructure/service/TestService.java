package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import org.springframework.stereotype.Service;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.TestMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.TestModel;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.TestRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.TestDto;

@Service
public class TestService {
	
	private TestRepository testRepository;
	// Setter for testRepository:
	public TestService(TestRepository testRepository) {
		this.testRepository = testRepository;
	}

	public String testEndpointService() {
		return "The call to the endpoint was successful!";
	}
	
	public TestDto testAddDto(TestDto testDto) {
		TestModel testModel = TestMapper.INSTANCE.toTestModel(testDto);
		TestModel test = testRepository.save(testModel);
		return TestMapper.INSTANCE.toTestDto(test);
	}
}
