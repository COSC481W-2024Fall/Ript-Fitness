package com.riptFitness.Ript_Fitness_Backend.domain.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import com.riptFitness.Ript_Fitness_Backend.domain.model.TestModel;
import com.riptFitness.Ript_Fitness_Backend.web.dto.TestDto;

@Mapper
public interface TestMapper {
	//Can implement an automapper if we want to! We don't have to :)
	
	TestMapper INSTANCE = Mappers.getMapper(TestMapper.class);
	
	TestDto toTestDto(TestModel testDto);
	
	TestModel toTestModel(TestDto testDto);
	
	@Mapping(target = "id", ignore = true)
	void updateTestRowFromDto(TestDto testDto, @MappingTarget TestModel testModel);
	
}
