package com.riptFitness.Ript_Fitness_Backend;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import com.riptFitness.Ript_Fitness_Backend.infrastructure.config.JwtUtil;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.AzureBlobService;

import io.github.cdimascio.dotenv.Dotenv;

@ActiveProfiles("test")
@SpringBootTest
class RiptFitnessBackendApplicationTests {
	 @BeforeAll
	    static void loadEnv() {
	        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
	        System.setProperty("usda.api.key", dotenv.get("USDA_API_KEY"));  // Set system property for test context
	    }

	
	@MockBean
    private AzureBlobService azureBlobService;

	@MockBean
	private JwtUtil jwtUtil;

	@Test
	void contextLoads() {
	}

}
