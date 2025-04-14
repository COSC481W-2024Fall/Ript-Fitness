package com.riptFitness.Ript_Fitness_Backend.web.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/debug")
public class DebugController {

    @GetMapping("/api-key")
    public ResponseEntity<String> checkApiKey() {
        String apiKey = System.getenv("USDA_API_KEY"); // Corrected key name
        return ResponseEntity.ok("API Key: " + (apiKey != null ? apiKey : "NOT_SET"));
    }
}
