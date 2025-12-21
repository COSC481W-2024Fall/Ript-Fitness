package com.riptFitness.Ript_Fitness_Backend.domain.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.PlateCalculator;
import com.riptFitness.Ript_Fitness_Backend.web.dto.PlateCalculatorDto;

@Mapper
public interface PlateCalculatorMapper {
	
	ObjectMapper OBJECT_MAPPER = new ObjectMapper();
	
	PlateCalculatorMapper INSTANCE = Mappers.getMapper(PlateCalculatorMapper.class);
	
	@Mapping(target = "platesAvailable", ignore = true)
	PlateCalculatorDto toPlateCalculatorDto(PlateCalculator plateCalculator);
	
	@Mapping(target = "platesAvailable", ignore = true)
	PlateCalculator toPlateCalculator(PlateCalculatorDto plateCalculatorDto);
	
	List<PlateCalculatorDto> toPlateCalculatorDtoList(List<PlateCalculator> plateCalculators);
	
	@Mapping(target = "id", ignore = true)
	@Mapping(target = "plateCounts", ignore = true)
	@Mapping(target = "platesAvailable", qualifiedByName = "doubleArrayToString")
	void updatePlateCalculatorRowFromDto(PlateCalculatorDto plateCalculatorDto, @MappingTarget PlateCalculator plateCalculator);
	
	@Named("doubleArrayToString")
	static String doubleArrayToString(double[] platesAvailable) {
		if (platesAvailable == null)
			return null;
		
		try {
			return OBJECT_MAPPER.writeValueAsString(platesAvailable);
		} catch (JsonProcessingException e) {
			throw new RuntimeException("Failed to convert double array to String in PlateCalculatorMapper", e);
		}
	}
}
