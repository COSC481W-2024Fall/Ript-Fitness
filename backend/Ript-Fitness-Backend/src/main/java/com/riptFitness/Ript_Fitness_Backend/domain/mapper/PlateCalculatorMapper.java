package com.riptFitness.Ript_Fitness_Backend.domain.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import com.riptFitness.Ript_Fitness_Backend.domain.model.PlateCalculator;
import com.riptFitness.Ript_Fitness_Backend.web.dto.PlateCalculatorDto;

@Mapper
public interface PlateCalculatorMapper {
	PlateCalculatorMapper INSTANCE = Mappers.getMapper(PlateCalculatorMapper.class);
	
	PlateCalculatorDto toPlateCalculatorDto(PlateCalculator plateCalculator);
	
	PlateCalculator toPlateCalculator(PlateCalculatorDto plateCalculatorDto);
	
	@Mapping(target = "id", ignore = true)
	void updatePlateCalculatorRowFromDto(PlateCalculatorDto plateCalculatorDto, @MappingTarget PlateCalculator plateCalculator);
}
