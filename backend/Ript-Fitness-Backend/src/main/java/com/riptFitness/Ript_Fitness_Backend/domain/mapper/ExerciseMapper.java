package com.riptFitness.Ript_Fitness_Backend.domain.mapper;

import java.util.ArrayList;
import java.util.List;

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
    @Mapping(source = "account.id", target = "accountReferenceId")
    ExerciseDto convertToDto(ExerciseModel exerciseModel);

    // Convert an ExerciseDto to an ExerciseModel:
    @Mapping(target = "account", ignore = true) // Ignore the account for now, we'll set it manually in the service
    ExerciseModel convertToModel(ExerciseDto exerciseDto);

    // Ignore the "exerciseId" when mapping because the database handles this operation:
    @Mapping(target = "exerciseId", ignore = true)
    void updateExerciseRowsFromDto(ExerciseDto exerciseDto, @MappingTarget ExerciseModel exerciseModel);
}
