package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class PlateCalculatorService {

    private static final double BAR_WEIGHT = 45.0;
    private static final double[] PLATE_SIZES = {45, 35, 25, 10, 5, 2.5};

    public List<Double> getPlatesFor(double totalWeight) {
        if (totalWeight < 0) {
            throw new IllegalArgumentException("Total weight cannot be negative.");
        }

        if (totalWeight <= BAR_WEIGHT) {
            return Collections.emptyList();
        }

        double sideWeight = (totalWeight - BAR_WEIGHT) / 2.0;
        List<Double> platesOnOneSide = new ArrayList<>();

        for (double plate : PLATE_SIZES) {
            while (sideWeight >= plate - 0.000001) {
                sideWeight -= plate;
                platesOnOneSide.add(plate);
            }
        }
        return platesOnOneSide;
    }
}
