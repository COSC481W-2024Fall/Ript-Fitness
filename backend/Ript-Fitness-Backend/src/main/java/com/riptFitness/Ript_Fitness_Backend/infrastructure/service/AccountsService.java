package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.riptFitness.Ript_Fitness_Backend.config.JwtUtil;
import com.riptFitness.Ript_Fitness_Backend.domain.mapper.AccountsMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Streak;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.StreakRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.AccountsDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.LoginRequestDto;


@Service
public class AccountsService {
	// Create an instance of the repository layer:
	@Autowired
	public AccountsRepository accountsRepository;
	@Autowired
	public StreakRepository streakRepository;
	private final PasswordEncoder passwordEncoder;

	// Constructor:
	public AccountsService(AccountsRepository accountsRepository, StreakRepository streakRepository,
			PasswordEncoder passwordEncoder) {
		this.accountsRepository = accountsRepository;
		this.streakRepository = streakRepository;
		this.passwordEncoder = passwordEncoder;
	}

	// List of methods that we need for the Create an account / Log in page:
	// 1. Create a new account
	// - Check to see if an account with the user name that the user is attempting
	// to make an account with already exits.
	// - If the user name is already in use, display a message to either login or
	// try another name
	// - If the user name is "free" allow user to create the account

	// 2. Log in page
	// - Ask for a user name and a password, check if the user name exists.
	// - If user name exists, check password. If password matches, allow log in.
	// - If the password does not match, display a error message.
	// - If user name does not exist, display a message that it does not exist. Ask
	// if they would like to create an account with that user name
	
	
	// Method to retrieve the logged-in user's ID
    public Long getLoggedInUserId() {
        // Get the principal (logged-in user) from the security context
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername(); // Get the logged-in user's username

            // Query the AccountsRepository to get the user based on the username
            AccountsModel account = accountsRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

            // Return the ID of the logged-in user
            return account.getId();
        } else {
            throw new RuntimeException("No authenticated user found.");
        }
    }

	// Below is the logic for creating an account:
	public AccountsDto createNewAccount(AccountsDto accountsDto) {
		// Convert DTO to model:
		AccountsModel accountsModel = AccountsMapper.INSTANCE.convertToModel(accountsDto);
		// Get the username:
		String username = accountsModel.getUsername();
		// Check to see if the username already exists:
		Long count = accountsRepository.existsByUsername(username);
		// Convert the Long to a boolean:
		boolean usernameExists = false;
		if (count > 0) {
			usernameExists = true;
		}
		if (usernameExists) {
		    // If the username exists, we need to throw an error code:
			throw new RuntimeException("Username is already taken.");

		} else {
			// If the username does not exist; allow the user to create an account.
			// Encode and set password:
			String rawPassword = accountsModel.getPassword();
			String encodedPassword = passwordEncoder.encode(rawPassword);
			accountsModel.setPassword(encodedPassword);
			// Encode and set email.
			String rawEmail = accountsModel.getEmail();
			String encodedEmail = passwordEncoder.encode(rawEmail);
			accountsModel.setEmail(encodedEmail);
			// accountsRepository.saveAccountModel(accountsModel.getUsername(),
			// accountsModel.getPassword(), accountsModel.getEmail(),
			// accountsModel.getlastLogin());
			accountsRepository.save(accountsModel);

			
			 //creating a corresponding streak for the account
			 
			 Streak streak = new Streak(); 
			 streak.account = accountsModel; // Associate the streak with the account 
			 streak.currentSt = 0; // Initialize streak count to 0 
			 streak.prevLogin = LocalDateTime.now(); 
			 streakRepository.save(streak);
			 
		}
		return AccountsMapper.INSTANCE.convertToDto(accountsModel);
	}
	
	@Autowired
	private JwtUtil jwtUtil; // Inject JWT utility

	// Method to get account details:
	@Transactional
	public String logIntoAccount(LoginRequestDto loginRequest) {
		// Extract username and password from the request body
		String username = loginRequest.getUsername();
		String password = loginRequest.getPassword();
		LocalDateTime lastLogin = loginRequest.getlastLogin();


		// Get the ID via username
		Optional<Long> optionalId = accountsRepository.findIdByUsername(username);

		// Check if the optional has something in it with .isPresent()
		if (optionalId.isPresent()) {
			// Store the ID in a variable to be used later
			Long id = optionalId.get();

	        // Retrieve the account using the ID
	        AccountsModel possibleAccount = accountsRepository.findById(id)
	            .orElseThrow(() -> new RuntimeException("Username does not exist."));
	        // Verify the password using Argon2
	        String encodedPassword = possibleAccount.getPassword();
	        boolean passwordMatches = passwordEncoder.matches(password, encodedPassword);
	        
	        // Verify the password
	        if (passwordMatches) {
	        	// Update the login date:
	        	accountsRepository.updateLoginDate(username, lastLogin);
	        	
	        	// Generate a JWT token and return it
	            String token = jwtUtil.generateToken(username);
	            System.out.println("Login successful for user: " + username);
	            return token;
	            
	        } else {
	            System.out.println("Incorrect password for user: " + username);
	            throw new RuntimeException("Incorrect password.");
	        }
	    } else {
	    	throw new RuntimeException("Username does not exist.");
	    }

	}

}
