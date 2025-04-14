package com.riptFitness.Ript_Fitness_Backend.web.dto;

import java.util.List;

/**
 * DTO for the JSON response: total weight + list of plates on one side.
 */
public class PlateCombinationDto {

    private double totalWeight;
    private List<Double> platesOnOneSide;

    public PlateCombinationDto(double totalWeight, List<Double> platesOnOneSide) {
        this.totalWeight = totalWeight;
        this.platesOnOneSide = platesOnOneSide;
    }

    // getters and/or setters
    public double getTotalWeight() {
        return totalWeight;
    }

    public List<Double> getPlatesOnOneSide() {
        return platesOnOneSide;
    }
}
