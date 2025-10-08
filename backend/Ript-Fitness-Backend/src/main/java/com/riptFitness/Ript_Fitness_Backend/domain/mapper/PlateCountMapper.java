package com.riptFitness.Ript_Fitness_Backend.domain.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.riptFitness.Ript_Fitness_Backend.domain.model.PlateCount;
import com.riptFitness.Ript_Fitness_Backend.web.dto.PlateCountDto;

@Mapper
public interface PlateCountMapper {
	PlateCountMapper INSTANCE = Mappers.getMapper(PlateCountMapper.class);
	
	PlateCountDto toPlateCountDto(PlateCount plateCount);
	
	PlateCount toPlateCount(PlateCountDto plateCountDto);
}
