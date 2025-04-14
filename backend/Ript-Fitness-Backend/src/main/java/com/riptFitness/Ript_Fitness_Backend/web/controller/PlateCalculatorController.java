package com.riptFitness.Ript_Fitness_Backend.web.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.PlateCalculatorService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.PlateCombinationDto;

@RestController
@RequestMapping("/api")
public class PlateCalculatorController {

    private final PlateCalculatorService plateCalculatorService;

    public PlateCalculatorController(PlateCalculatorService plateCalculatorService) {
        this.plateCalculatorService = plateCalculatorService;
    }

    @GetMapping(value = "/plates", produces = "application/json")
    public PlateCombinationDto getPlateCombination(@RequestParam double weight) {
        List<Double> platesOnOneSide = plateCalculatorService.getPlatesFor(weight);
        return new PlateCombinationDto(weight, platesOnOneSide);
    }

}
