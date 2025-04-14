package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.SocialPostCommentMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.mapper.SocialPostMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.SocialPost;
import com.riptFitness.Ript_Fitness_Backend.domain.model.SocialPostComment;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.SocialPostCommentRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.SocialPostRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.UserProfileRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.SocialPostCommentDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.SocialPostDto;

@Service
public class SocialPostService {
	
	private SocialPostRepository socialPostRepository;
	
	private SocialPostCommentRepository socialPostCommentRepository;
	
	private AccountsRepository accountsRepository;
	
	private AccountsService accountsService;
	
	private UserProfileRepository userProfileRepository;

	public SocialPostService(SocialPostRepository socialPostRepository, SocialPostCommentRepository socialPostCommentRepository, AccountsRepository accountsRepository, AccountsService accountsService, UserProfileRepository userProfileRepository) {
		this.socialPostRepository = socialPostRepository;
		this.socialPostCommentRepository = socialPostCommentRepository;
		this.accountsRepository = accountsRepository;
		this.accountsService = accountsService;
		this.userProfileRepository = userProfileRepository;
	}
	
	public SocialPostDto addPost(SocialPostDto socialPostDto) {
		SocialPost socialPostToBeAdded = SocialPostMapper.INSTANCE.toSocialPost(socialPostDto);
		Long currentlyLoggedInUserId = accountsService.getLoggedInUserId();
		socialPostToBeAdded.account = accountsRepository.findById(currentlyLoggedInUserId).get();
		socialPostToBeAdded.userProfile = userProfileRepository.findUserProfileByAccountId(currentlyLoggedInUserId).get();
		socialPostToBeAdded = socialPostRepository.save(socialPostToBeAdded);
		return SocialPostMapper.INSTANCE.toSocialPostDto(socialPostToBeAdded);
	}
	
	public SocialPostDto getPost(Long socialPostId) {
		Optional<SocialPost> returnedOptionalSocialPostObject = socialPostRepository.findById(socialPostId);
		
		if(returnedOptionalSocialPostObject.isEmpty())
			throw new RuntimeException("SocialPost object not found in database with ID = " + socialPostId);
		
		SocialPost returnedSocialPostObject = returnedOptionalSocialPostObject.get();
		
		return SocialPostMapper.INSTANCE.toSocialPostDto(returnedSocialPostObject);
	}
	
	public ArrayList<SocialPostDto> getPostsFromCurrentlyLoggedInUser(Integer startIndex, Integer endIndex){
		if(startIndex > endIndex)
			throw new RuntimeException("Start index cannot be greater than end index. Start index = " + startIndex + ", end index = " + endIndex);
		
		if(startIndex < 0 || endIndex < 0)
			throw new RuntimeException("Start index and end index must be greater than 0. Start index = " + startIndex + ", end index = " + endIndex);
				
		Long currentUsersAccountId = accountsService.getLoggedInUserId();
		
		Optional<ArrayList<SocialPost>> optionalPostsFromAccountId = socialPostRepository.getPostsFromAccountId(currentUsersAccountId);
		
		if(optionalPostsFromAccountId.isEmpty())
			return new ArrayList<SocialPostDto>();
		
		ArrayList<SocialPost> postsFromAccountId = optionalPostsFromAccountId.get();
		
		int start = postsFromAccountId.size() - startIndex - 1;
		int end = postsFromAccountId.size() - endIndex - 1;
		
		if(start < 0)
			throw new RuntimeException("There are not enough posts from the current user to match the path variables provided.");
		
		if(start >= postsFromAccountId.size()) 
			start = postsFromAccountId.size() - 1;
		
		if(end < 0)
			end = 0;
		
		ArrayList<SocialPostDto> postDtosFromAccountId = new ArrayList<SocialPostDto>();
				
		for(int i = start; i >= end; i--) {
			postDtosFromAccountId.add(SocialPostMapper.INSTANCE.toSocialPostDto(postsFromAccountId.get(i)));
		}
		
		return postDtosFromAccountId;
	}
	
	public ArrayList<SocialPostDto> getPostsFromAccountId(Long accountId, Integer startIndex, Integer endIndex){
		if(startIndex > endIndex)
			throw new RuntimeException("Start index cannot be greater than end index. Start index = " + startIndex + ", end index = " + endIndex);
		
		if(startIndex < 0 || endIndex < 0)
			throw new RuntimeException("Start index and end index must be greater than 0. Start index = " + startIndex + ", end index = " + endIndex);
		
		Optional<ArrayList<SocialPost>> optionalPostsFromAccountId = socialPostRepository.getPostsFromAccountId(accountId);
		
		if(optionalPostsFromAccountId.isEmpty())
			return new ArrayList<SocialPostDto>();
		
		ArrayList<SocialPost> postsFromAccountId = optionalPostsFromAccountId.get();
		
		int start = postsFromAccountId.size() - startIndex - 1;
		int end = postsFromAccountId.size() - endIndex - 1;
		
		if(start < 0)
			throw new RuntimeException("There are not enough posts from the current user to match the path variables provided.");
		
		if(start >= postsFromAccountId.size()) 
			start = postsFromAccountId.size() - 1;
		
		if(end < 0)
			end = 0;
		
		ArrayList<SocialPostDto> postDtosFromAccountId = new ArrayList<SocialPostDto>();
				
		for(int i = start; i >= end; i--) {
			postDtosFromAccountId.add(SocialPostMapper.INSTANCE.toSocialPostDto(postsFromAccountId.get(i)));
		}
		
		return postDtosFromAccountId;
	}
	
	public ArrayList<SocialPostDto> getSocialFeed(Integer startIndex, Integer endIndex){
		if(startIndex > endIndex)
			throw new RuntimeException("Start index cannot be greater than end index. Start index = " + startIndex + ", end index = " + endIndex);
		
		if(startIndex < 0 || endIndex < 0)
			throw new RuntimeException("Start index and end index must be greater than 0. Start index = " + startIndex + ", end index = " + endIndex);
		
		Long currentUsersAccountId = accountsService.getLoggedInUserId();
		
		AccountsModel currentlyLoggedInAccount = accountsRepository.findById(currentUsersAccountId).get();
		
		List<AccountsModel> myFriends = currentlyLoggedInAccount.getFriends();
		ArrayList<Long> mutualFriendIds = new ArrayList<>();

		for (AccountsModel friend : myFriends) {
		    // Check if they also have ME in their friend list
		    if (friend.getFriends().contains(currentlyLoggedInAccount)) {
		        mutualFriendIds.add(friend.getId());
		    }
		
}
		System.out.println("Logged-in user ID: " + currentUsersAccountId);
		System.out.println("Friends + Self: " + mutualFriendIds);
		
		mutualFriendIds.add(currentUsersAccountId);	//getSocialFeed should also include Social Posts from the currently logged in user
			
		Optional<List<SocialPost>> optionalSocialFeedList = accountsRepository.getSocialFeed(mutualFriendIds);
		
		if(optionalSocialFeedList.isEmpty())
			return new ArrayList<SocialPostDto>();
			
		List<SocialPost> socialFeedList = optionalSocialFeedList.get();
		
		ArrayList<SocialPost> socialFeed = new ArrayList<>(socialFeedList);
		System.out.println("Logged-in user ID: " + currentUsersAccountId);
		System.out.println("Visible accountIds: " + mutualFriendIds);

		for (SocialPost post : socialFeedList) {
		    System.out.printf(
		        "Post ID: %d | From Account: %d | isPublic: %b | Should be visible: %b%n",
		        post.getId(),
		        post.getAccount().getId(),
		        post.isPublic(),
		        post.isPublic() || mutualFriendIds.contains(post.getAccount().getId())
		    );
		}

		int start = socialFeed.size() - startIndex - 1;
		int end = socialFeed.size() - endIndex - 1;
		
		if(start < 0)
			throw new RuntimeException("There are not enough posts from the current user's social feed to match the path variables provided.");
		
		if(start >= socialFeed.size()) 
			start = socialFeed.size() - 1;
		
		if(end < 0)
			end = 0;
			
		ArrayList<SocialPostDto> returnedSocialFeedList = new ArrayList<>();
		
		for(int i = start; i >= end; i--){
			returnedSocialFeedList.add(SocialPostMapper.INSTANCE.toSocialPostDto(socialFeed.get(i)));
		}

		return returnedSocialFeedList;
	}
	
	public SocialPostDto editPostContent(Long socialPostId, String newSocialPostContent) {
		Optional<SocialPost> optionalSocialPostToBeEdited = socialPostRepository.findById(socialPostId);
		
		if(optionalSocialPostToBeEdited.isEmpty())
			throw new RuntimeException("SocialPost object not found in database with ID = " + socialPostId);
				
		SocialPost socialPostToBeEdited = optionalSocialPostToBeEdited.get();
		
		socialPostToBeEdited.content = newSocialPostContent;
		
		socialPostToBeEdited = socialPostRepository.save(socialPostToBeEdited);
		
		return SocialPostMapper.INSTANCE.toSocialPostDto(socialPostToBeEdited);
	}
	
	public SocialPostDto deletePost(Long socialPostId) {
		Optional<SocialPost> optionalSocialPostToBeDeleted = socialPostRepository.findById(socialPostId);
		
		if(optionalSocialPostToBeDeleted.isEmpty())
			throw new RuntimeException("SocialPost object not found in database with ID = " + socialPostId);

		SocialPost socialPostToBeDeleted = optionalSocialPostToBeDeleted.get();
		
		socialPostToBeDeleted.isDeleted = true;
		
		socialPostToBeDeleted = socialPostRepository.save(socialPostToBeDeleted);
		
		return SocialPostMapper.INSTANCE.toSocialPostDto(socialPostToBeDeleted);
	}
	
	public SocialPostDto addLike(Long socialPostId) {
		Optional<SocialPost> optionalSocialPostObject = socialPostRepository.findById(socialPostId);
		
		if(optionalSocialPostObject.isEmpty())
			throw new RuntimeException("SocialPost object not found in database with ID = " + socialPostId);

		Long userId = accountsService.getLoggedInUserId();
		
		Optional<AccountsModel> accountsModelObject = accountsRepository.findById(userId);
		
		if(accountsModelObject.isEmpty())
			throw new RuntimeException("AccountsModel object not found in database with UserID = " + userId);
		
		SocialPost socialPostObject = optionalSocialPostObject.get();
		
		if(socialPostObject.userIDsOfLikes.contains(userId))
			throw new RuntimeException("The user with user ID = " + userId + " already liked the SocialPost with ID = " + socialPostId + ". No changes were made to the SocialPost.");
		
		socialPostObject.userIDsOfLikes.add(userId);
		
		socialPostObject.numberOfLikes++;
		
		socialPostObject = socialPostRepository.save(socialPostObject);
		
		return SocialPostMapper.INSTANCE.toSocialPostDto(socialPostObject);
	}
	
	public SocialPostDto deleteLike(Long socialPostId) {
		Optional<SocialPost> optionalSocialPostObject = socialPostRepository.findById(socialPostId);
		
		if(optionalSocialPostObject.isEmpty())
			throw new RuntimeException("SocialPost object not found in database with ID = " + socialPostId);

		Long userId = accountsService.getLoggedInUserId();
		
		Optional<AccountsModel> accountsModelObject = accountsRepository.findById(userId);
		
		if(accountsModelObject.isEmpty())
			throw new RuntimeException("AccountsModel object not found in database with UserID = " + userId);
		
		SocialPost socialPostObject = optionalSocialPostObject.get();
		
		if(!socialPostObject.userIDsOfLikes.contains(userId))
			throw new RuntimeException("The user with user ID = " + userId + " has not already liked the SocialPost with ID = " + socialPostId + ". No changes were made to the SocialPost.");
	
		socialPostObject.userIDsOfLikes.remove(userId);
		
		socialPostObject.numberOfLikes--;
		
		socialPostRepository.save(socialPostObject);
		
		return SocialPostMapper.INSTANCE.toSocialPostDto(socialPostObject);
	}
	
	public SocialPostDto addComment(SocialPostCommentDto socialPostComment) {
		Optional<SocialPost> optionalSocialPostObject = socialPostRepository.findById(socialPostComment.postId);
		
		if(optionalSocialPostObject.isEmpty())
			throw new RuntimeException("SocialPost object not found in database with ID = " + socialPostComment.postId);
		
		SocialPost socialPostObject = optionalSocialPostObject.get();
		
		SocialPostComment socialPostCommentModel = SocialPostCommentMapper.INSTANCE.toSocialPostComment(socialPostComment);
		
		Long currentlyLoggedInUserId = accountsService.getLoggedInUserId();

		socialPostCommentModel.account = accountsRepository.findById(currentlyLoggedInUserId).get();
		socialPostCommentModel.userProfile = userProfileRepository.findUserProfileByAccountId(currentlyLoggedInUserId).get();
				
		socialPostObject.socialPostComments.add(socialPostCommentModel);
		
		socialPostObject = socialPostRepository.save(socialPostObject);
		
		return SocialPostMapper.INSTANCE.toSocialPostDto(socialPostObject);
	}
	
	public SocialPostDto deleteComment(Long socialPostCommentId) {
		Optional<SocialPostComment> optionalSocialPostCommentObject = socialPostCommentRepository.findById(socialPostCommentId);
		
		if(optionalSocialPostCommentObject.isEmpty())
			throw new RuntimeException("SocialPostComment object not found in database with ID = " + socialPostCommentId);
		
		SocialPostComment socialPostCommentObject = optionalSocialPostCommentObject.get();
		
		socialPostCommentObject.isDeleted = true;
		
		SocialPost socialPostContainingDeletedComment = socialPostRepository.findById(socialPostCommentObject.postId).get();
		
		SocialPostComment socialPostCommentToBeDeleted = null;
		
		for(SocialPostComment socialPostComment : socialPostContainingDeletedComment.socialPostComments) {
			if(socialPostComment.id == socialPostCommentId)
				socialPostCommentToBeDeleted = socialPostComment;
		}
		
		socialPostContainingDeletedComment.socialPostComments.remove(socialPostCommentToBeDeleted);
		
		SocialPost updatedSocialPost = socialPostRepository.save(socialPostContainingDeletedComment);
						
		socialPostCommentRepository.save(socialPostCommentObject);
		
		return SocialPostMapper.INSTANCE.toSocialPostDto(updatedSocialPost);
	}
	
	/*
	*** Getting rid of this endpoint for now as it isn't being used. Will add back if necessary. ***
	public ArrayList<SocialPostCommentDto> getCommentsFromAccountId(){
		Long currentUsersAccountId = accountsService.getLoggedInUserId();
		
		Optional<ArrayList<SocialPostComment>> optionalCommentsFromAccountId = socialPostCommentRepository.getPostsFromAccountId(currentUsersAccountId);
		
		if(optionalCommentsFromAccountId.isEmpty())
			return new ArrayList<SocialPostCommentDto>();
		
		ArrayList<SocialPostComment> commentsFromAccountId = optionalCommentsFromAccountId.get();
		
		ArrayList<SocialPostCommentDto> commentDtosFromAccountId = new ArrayList<SocialPostCommentDto>();
		
		for(int i = 0; i < commentsFromAccountId.size(); i++) {
			commentDtosFromAccountId.add(SocialPostCommentMapper.INSTANCE.toSocialPostCommentDto(commentsFromAccountId.get(i)));
		}
		
		return commentDtosFromAccountId;
	}
	*/
}
