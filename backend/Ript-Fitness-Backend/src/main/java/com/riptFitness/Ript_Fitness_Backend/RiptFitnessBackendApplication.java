package com.riptFitness.Ript_Fitness_Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication 
public class RiptFitnessBackendApplication {

	public static void main(String[] args) {
		// Load environment variables from .env file
        Dotenv dotenv = Dotenv.load();
        
        
        System.setProperty("JWT_SECRET", dotenv.get("JWT_SECRET"));
        System.setProperty("BLOB_CONNECTION_STRING", dotenv.get("BLOB_CONNECTION_STRING"));
        System.setProperty("BLOB_CONTAINER_NAME", dotenv.get("BLOB_CONTAINER_NAME"));

     
		SpringApplication.run(RiptFitnessBackendApplication.class, args);
	}

}
