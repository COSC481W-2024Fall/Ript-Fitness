package com.riptFitness.Ript_Fitness_Backend.web.dto;

import java.util.List;

import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Workouts;

//Dto is same as the model but doesn't need the @ 
public class WorkoutsDto {
    private Long workoutsId;
    private String name;
    private List<Long> exerciseIds;
    private boolean isDeleted = false;


    // Getters and Setters
    public Long getWorkoutsId() { return workoutsId; }
    public void setWorkoutsId(Long workoutsId) { this.workoutsId = workoutsId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<Long> getExerciseIds() { return exerciseIds; }
    public void setExerciseIds(List<Long> exerciseIds) { this.exerciseIds = exerciseIds; }

    public boolean isIsDeleted() { return isDeleted; }
    public void setIsDeleted(boolean isDeleted) { this.isDeleted = isDeleted; }
}

