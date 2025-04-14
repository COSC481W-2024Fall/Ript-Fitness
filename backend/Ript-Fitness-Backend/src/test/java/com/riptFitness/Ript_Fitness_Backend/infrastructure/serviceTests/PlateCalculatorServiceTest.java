package com.riptFitness.Ript_Fitness_Backend.infrastructure.serviceTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.PlateCalculatorService;

public class PlateCalculatorServiceTest {

    private PlateCalculatorService plateCalculatorService;

    @BeforeEach
    void setUp() {
        plateCalculatorService = new PlateCalculatorService();
    }

    @Test
    void testNegativeWeightThrowsException() {
        assertThrows(IllegalArgumentException.class,
            () -> plateCalculatorService.getPlatesFor(-10.0),
            "Expected exception for negative weight");
    }

    @Test
    void testWeightEqualToBarWeightReturnsNoPlates() {
        List<Double> plates = plateCalculatorService.getPlatesFor(45.0);
        assertTrue(plates.isEmpty(), "No plates should be needed if total weight equals bar weight");
    }

    @Test
    void testWeightLessThanBarWeightReturnsNoPlates() {
        List<Double> plates = plateCalculatorService.getPlatesFor(40.0);
        assertTrue(plates.isEmpty(), "No plates should be needed if total weight is under bar weight");
    }

    @Test
    void testTypicalWeightExample() {
        // 135 lbs = 45 bar + 90 lbs of plates => 45 lbs each side
        // Each side: one 45 plate
        List<Double> plates = plateCalculatorService.getPlatesFor(135.0);
        assertEquals(List.of(45.0), plates,
            "135 lbs total means a single 45 lb plate on each side");
    }

    @Test
    void testAnotherWeightExample() {
        // 555 lbs: many 45s, a 25, a 5, etc.
        // According to the bar logic: 
        // total - bar = 510; half side = 255
        // 255 -> while fits 45 ...
        List<Double> plates = plateCalculatorService.getPlatesFor(555.0);
        // Based on your example: [45, 45, 45, 45, 45, 25, 5]
        assertEquals(
            List.of(45.0, 45.0, 45.0, 45.0, 45.0, 25.0, 5.0),
            plates,
            "Should match the expected plate arrangement for 555 lbs"
        );
    }

    @Test
    void testEdgeCaseJustOverBarWeight() {
        // 50 lbs total => 5 lbs over bar
        // side = (50 - 45)/2 = 2.5 => 2.5 plate once
        List<Double> plates = plateCalculatorService.getPlatesFor(50.0);
        assertEquals(List.of(2.5), plates, 
            "Should be a single 2.5 lb plate on each side for 50 lbs total");
    }
}