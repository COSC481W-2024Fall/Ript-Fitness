package com.riptFitness.Ript_Fitness_Backend.domain.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import com.riptFitness.Ript_Fitness_Backend.domain.model.PlateCalculator;
import com.riptFitness.Ript_Fitness_Backend.web.dto.PlateCalculatorDto;

@Mapper
public interface PlateCalculatorMapper {
	PlateCalculatorMapper INSTANCE = Mappers.getMapper(PlateCalculatorMapper.class);
	
	@Mapping(target = "platesAvailable", ignore = true)
	PlateCalculatorDto toPlateCalculatorDto(PlateCalculator plateCalculator);
	
	@Mapping(target = "platesAvailable", ignore = true)
	PlateCalculator toPlateCalculator(PlateCalculatorDto plateCalculatorDto);
}
