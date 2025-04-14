package com.riptFitness.Ript_Fitness_Backend.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import io.github.cdimascio.dotenv.Dotenv;

@Configuration
public class AppConfig {
	
	private final Dotenv dotenv = Dotenv.load();
	
	@Bean
	public DriverManagerDataSource dataSource() {
		DriverManagerDataSource dataSource = new DriverManagerDataSource();
		dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
		dataSource.setUrl(dotenv.get("SPRING_DATASOURCE_URL"));
		dataSource.setUsername(dotenv.get("SPRING_DATASOURCE_USERNAME"));
		dataSource.setPassword(dotenv.get("SPRING_DATASOURCE_PASSWORD"));
		return dataSource;
	}
	
	@Bean
	public PasswordEncoder passwordEncoder() {
	    return new Argon2PasswordEncoder(16, 32, 1, 16, 32); 
	}
	
	@Bean
	public String usdaApiKey() {
	    Dotenv dotenv = Dotenv.load();

	    String apiKey = dotenv.get("USDA_API_KEY");
	    if (apiKey == null || apiKey.isEmpty()) {
	        apiKey = System.getenv("USDA_API_KEY"); // Check if available in system env
	    }
	    return apiKey;
	}


}
