package com.riptFitness.Ript_Fitness_Backend.domain.model;

import java.time.ZonedDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class FriendRequest {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long id;
	
	@ManyToOne
	@JoinColumn(name = "from_account_id", nullable = false)
	@JsonIgnore
	public AccountsModel fromAccount;
	
	@ManyToOne
	@JoinColumn(name = "to_account_id", nullable = false)
	@JsonIgnore
	public AccountsModel toAccount;
	
	public Long accountIdOfFromAccount;
		
	public Long accountIdOfToAccount;
	
	@Enumerated(EnumType.STRING)
	public RequestStatus status;
	
	public String fromUsername; //Username of fromAccount's userProfile
	
	public String toUsername;	//Username of toAccount's userProfile
	
	public ZonedDateTime dateTimeOfMostRecentChangeToStatus;
	
	public FriendRequest() {}	//Required for database interactions to work

	public FriendRequest(AccountsModel fromAccount, AccountsModel toAccount, Long accountIdOfFromAccount, Long accountIdOfToAccount, RequestStatus status, String fromUsername,
			String toUsername, ZonedDateTime dateTimeOfMostRecentChangeToStatus) {
		super();
		this.fromAccount = fromAccount;
		this.toAccount = toAccount;
		this.accountIdOfFromAccount = accountIdOfFromAccount;
		this.accountIdOfToAccount = accountIdOfToAccount;
		this.status = status;
		this.fromUsername = fromUsername;
		this.toUsername = toUsername;
		this.dateTimeOfMostRecentChangeToStatus = dateTimeOfMostRecentChangeToStatus;
	}
}
