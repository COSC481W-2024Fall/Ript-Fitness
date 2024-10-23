package com.riptFitness.Ript_Fitness_Backend.domain.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import com.riptFitness.Ript_Fitness_Backend.domain.model.ExerciseModel;
import com.riptFitness.Ript_Fitness_Backend.web.dto.ExerciseDto;

@Mapper
public interface ExerciseMapper {
	
	ExerciseMapper INSTANCE = Mappers.getMapper(ExerciseMapper.class);
	
	// Convert a ExerciseModel to a ExerciseDto:
	ExerciseDto convertToDto(ExerciseModel exerciseModel);
	
	// Convert a ExerciseDto to a ExerciseModel:
	ExerciseModel convertToModel(ExerciseDto exerciseDto);
	
	// Ignore the "id" when mapping becase the database handles this operation:
	@Mapping(target = "exerciseId", ignore = true)
	void updateExerciseRowsFromDto(ExerciseDto exerciseDto, @MappingTarget ExerciseModel exerciseModel);
	

}
