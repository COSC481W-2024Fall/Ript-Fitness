package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.AccountsMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Streak;
import com.riptFitness.Ript_Fitness_Backend.domain.model.UserProfile;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.StreakRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.UserProfileRepository;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.config.JwtUtil;
import com.riptFitness.Ript_Fitness_Backend.web.dto.AccountsDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.LoginRequestDto;

import com.riptFitness.Ript_Fitness_Backend.web.dto.UserDto;

@Service
public class AccountsService {
	// Create an instance of the repository layer:
	@Autowired
	public AccountsRepository accountsRepository;
	@Autowired
	public StreakRepository streakRepository;
	private final UserProfileService userProfileService;
	private UserProfileRepository userProfileRepository;
	private final PasswordEncoder passwordEncoder;
	@Autowired
	private JwtUtil jwtUtil;

	// Constructor:
	public AccountsService(AccountsRepository accountsRepository, StreakRepository streakRepository,
			PasswordEncoder passwordEncoder, JwtUtil jwtUtil, UserProfileService userProfileService,
			UserProfileRepository userProfileRepository) {
		this.accountsRepository = accountsRepository;
		this.streakRepository = streakRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
		this.userProfileService = userProfileService;
		this.userProfileRepository = userProfileRepository;
	}

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

	// Method to get logged in user email:
	public String updateEmail(String newEmail) {
		// Get the associated account:
		AccountsModel accountsModel = accountsRepository.findById(getLoggedInUserId())
				.orElseThrow(() -> new RuntimeException("Account not found!"));

		// Encode the new email:
		String newEncodedEmail = passwordEncoder.encode(newEmail);

		// Set the new email:
		accountsModel.setEmail(newEncodedEmail);

		// Save the account:
		accountsRepository.save(accountsModel);

		// Generate a JWT token and return it
		String token = jwtUtil.generateToken(accountsModel.getUsername());
		System.out.println("Email change succesfull for: " + accountsModel.getUsername());
		
		return token;
	}

	@Transactional
	public String changePassword(String currentPassword, String newPassword) {
		// Get the associated account:
		AccountsModel accountsModel = accountsRepository.findById(getLoggedInUserId())
				.orElseThrow(() -> new RuntimeException("Account not found!"));

		// Check to see if the current password doesnt match the one in the DB; and the
		// current/new are not the same
		if (!passwordEncoder.matches(currentPassword, accountsModel.getPassword())) {
			throw new RuntimeException("Current password does not match");
		}
		if (currentPassword.equals(newPassword)) {
			throw new RuntimeException("New password cannot be the same as the current password");
		}

		// Encode the password:
		String encodedPassword = passwordEncoder.encode(newPassword);

		// Set the password:
		accountsModel.setPassword(encodedPassword);

		// Save the model:
		accountsRepository.save(accountsModel);

		// Generate a JWT token and return it
		String token = jwtUtil.generateToken(accountsModel.getUsername());
		System.out.println("Password change succesfull for: " + accountsModel.getUsername());

		// Return the token:
		return token;
	}

	// Below is the logic for creating an account:
	public String createNewAccount(AccountsDto accountsDto) {
		// Convert DTO to model:
		AccountsModel accountsModel = AccountsMapper.INSTANCE.convertToModel(accountsDto);

		String username = accountsModel.getUsername();
		String email = accountsModel.getEmail();

		// TEST:
		// Print the raw email before any processing
		System.out.println("Raw email from input: " + email);

		// Check to see if the username already exists:
		Long usernameCount = accountsRepository.existsByUsername(username);
		if (usernameCount > 0) {
			// If the username or email alrteady exists, we need to throw an error code:
			throw new RuntimeException("Username is already taken.");
		}

		// Get a list of all encoded emails:
		List<String> listOfEncodedEmails = accountsRepository.findAllEncodedEmails();

		// Check to see if the email is already in use:
		boolean emailExists = false;
		for (int i = 0; i < listOfEncodedEmails.size(); i++) {
			if (emailExists = passwordEncoder.matches(email, listOfEncodedEmails.get(i))) {

			}
		}
		if (emailExists == true) {
			// If the username or email alrteady exists, we need to throw an error code:
			throw new RuntimeException("Email is already taken.");
		}

		// Encode and set password:
		String rawPassword = accountsModel.getPassword();
		String encodedPassword = passwordEncoder.encode(rawPassword);
		accountsModel.setPassword(encodedPassword);

		// Encode and set email.
		String rawEmail = accountsModel.getEmail();
		String encodedEmail = passwordEncoder.encode(rawEmail);
		System.out.println("Raw email before encoding: " + rawEmail);
		System.out.println("Encoded email: " + encodedEmail);
		accountsModel.setEmail(encodedEmail);

		// Creating a corresponding streak for the account
		Streak streak = new Streak();
		streak.account = accountsModel; // Associate the streak with the account
		streak.currentSt = 0; // Initialize streak count to 0
		streak.prevLogin = LocalDateTime.now();
		streakRepository.save(streak);

		//UserProfile logic 
		UserProfile user = new UserProfile(); 
		user.setUsername(username);
		user.setAccount(accountsModel);
		user.setDisplayname(username);
		user.setFirstName("");
		user.setLastName("");
		user.setDateTimeAccountWasCreated(ZonedDateTime.now(ZoneId.of("America/New_York")));
		userProfileRepository.save(user);

		accountsModel.setUserProfile(user);
		accountsRepository.save(accountsModel);

		// Generate a JWT token for the newly created account:
		String token = jwtUtil.generateToken(username);

		// Return the token as the response:
		return token;
	}

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

				if (!userProfileService.existsByUsername(username)) {
					UserDto userDto = new UserDto();
					userDto.username = username; // Initialize with username only
					userProfileService.addUser(userDto, username); // Create a new UserProfile if not already made
				}

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