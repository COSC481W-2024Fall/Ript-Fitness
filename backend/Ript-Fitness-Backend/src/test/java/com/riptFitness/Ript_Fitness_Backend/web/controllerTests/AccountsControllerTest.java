package com.riptFitness.Ript_Fitness_Backend.web.controllerTests;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.AccountsService;
import com.riptFitness.Ript_Fitness_Backend.web.controller.AccountsController;
import com.riptFitness.Ript_Fitness_Backend.web.dto.AccountsDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.LoginRequestDto;

@WebMvcTest(AccountsController.class)
public class AccountsControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private AccountsService accountsService;

	private ObjectMapper objectMapper;

	private AccountsDto accountsDto;

	@BeforeEach
	public void setUp() {
		objectMapper = new ObjectMapper();
		objectMapper.registerModule(new JavaTimeModule());
		objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

		accountsDto = new AccountsDto();
		accountsDto.setUsername("testUser");
		accountsDto.setPassword("password123");
		accountsDto.setEmail("test@example.com");
		accountsDto.setlastLogin(LocalDateTime.now());
	}

	// Test for createNewAccount - successful account creation
	@Test
	public void testCreateNewAccount_Success() throws Exception {
		when(accountsService.createNewAccount(any(AccountsDto.class))).thenReturn(accountsDto);

		mockMvc.perform(post("/accounts/createNewAccount").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(accountsDto))).andExpect(status().isCreated())
				.andExpect(jsonPath("$.username").value("testUser"))
				.andExpect(jsonPath("$.email").value("test@example.com"));
	}

	// Test for createNewAccount - username already exists
	@Test
	public void testCreateNewAccount_UsernameExists() throws Exception {
		when(accountsService.createNewAccount(any(AccountsDto.class)))
				.thenThrow(new RuntimeException("The username: 'testUser' already has an account associated with it"));

		mockMvc.perform(post("/accounts/createNewAccount").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(accountsDto))).andExpect(status().isInternalServerError())
				// Expecting the prefixed error message
				.andExpect(content().string(
						"An unexpected error has occured. Message: The username: 'testUser' already has an account associated with it"));
	}

	// Test for login - successful login
	@Test
	public void testLogin_Success() throws Exception {
	    LoginRequestDto loginRequest = new LoginRequestDto();
	    loginRequest.setUsername("testUser");
	    loginRequest.setPassword("password123");
	    loginRequest.setlastLogin(LocalDateTime.now());

	    // Mock the JWT token returned by the login method
	    String jwtToken = "mocked-jwt-token";
	    when(accountsService.logIntoAccount(any(LoginRequestDto.class))).thenReturn(jwtToken);

	    // Use put method to match the controller's method
	    mockMvc.perform(put("/accounts/login")
	            .contentType(MediaType.APPLICATION_JSON)
	            .content(objectMapper.writeValueAsString(loginRequest))) // Include content in put request
	            .andExpect(status().isOk())
	            .andExpect(content().string(jwtToken));  // Expect the token as the response content
	}


	// Test for login - incorrect password
	@Test
	public void testLogin_IncorrectPassword() throws Exception {
		LoginRequestDto loginRequest = new LoginRequestDto();
		loginRequest.setUsername("testUser");
		loginRequest.setPassword("wrongPassword");
		loginRequest.setlastLogin(LocalDateTime.now());

		when(accountsService.logIntoAccount(any(LoginRequestDto.class)))
				.thenThrow(new RuntimeException("The password: 'wrongPassword' is incorrect"));

		mockMvc.perform(put("/accounts/login").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(loginRequest))).andExpect(status().isInternalServerError())
				// Expecting the prefixed error message
				.andExpect(content().string(
						"An unexpected error has occured. Message: The password: 'wrongPassword' is incorrect"));
	}

	// Test for login - username does not exist
	@Test
	public void testLogin_UsernameDoesNotExist() throws Exception {
		LoginRequestDto loginRequest = new LoginRequestDto();
		loginRequest.setUsername("nonExistingUser");
		loginRequest.setPassword("password123");
		loginRequest.setlastLogin(LocalDateTime.now());

		when(accountsService.logIntoAccount(any(LoginRequestDto.class)))
				.thenThrow(new RuntimeException("Account with username: 'nonExistingUser' does not exist"));

		mockMvc.perform(put("/accounts/login").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(loginRequest))).andExpect(status().isInternalServerError())
				// Expecting the prefixed error message
				.andExpect(content().string(
						"An unexpected error has occured. Message: Account with username: 'nonExistingUser' does not exist"));
	}
}
