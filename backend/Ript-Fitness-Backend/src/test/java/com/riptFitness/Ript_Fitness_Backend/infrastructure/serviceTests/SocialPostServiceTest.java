package com.riptFitness.Ript_Fitness_Backend.infrastructure.serviceTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.SocialPostCommentMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.mapper.SocialPostMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.SocialPost;
import com.riptFitness.Ript_Fitness_Backend.domain.model.SocialPostComment;
import com.riptFitness.Ript_Fitness_Backend.domain.model.UserProfile;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.SocialPostCommentRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.SocialPostRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.UserProfileRepository;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.AccountsService;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.SocialPostService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.SocialPostCommentDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.SocialPostDto;

public class SocialPostServiceTest {

	@Mock
	private SocialPostRepository socialPostRepository;
	
	@Mock
	private SocialPostCommentRepository socialPostCommentRepository;
	
	@Mock
	private AccountsRepository accountsRepository;
	
	@Mock
	private AccountsService accountsService;
	
	@Mock
	private UserProfileRepository userProfileRepository;
	
	@InjectMocks
	private SocialPostService socialPostService;
	
	private SocialPostDto socialPost;
	private SocialPost socialPostModel;
	private SocialPostCommentDto commentOne;
	private SocialPostCommentDto commentTwo;
	private SocialPostCommentDto commentThree;
	private SocialPostComment commentOneModel;
	private AccountsModel account;
	
	@BeforeEach
	public void setUp() {
		MockitoAnnotations.openMocks(this);
		
		socialPost = new SocialPostDto();
		socialPost.content = "Just benched 500 pounds, my name is Chris and I'm so strong!!";
		socialPost.numberOfLikes = 2;
		socialPost.isPublic = true;
		socialPost.userIDsOfLikes = new ArrayList<>();
		socialPost.userIDsOfLikes.add(2L);
		socialPost.userIDsOfLikes.add(3L);
		socialPost.socialPostComments = new ArrayList<>();
		commentOne = new SocialPostCommentDto();
		commentTwo = new SocialPostCommentDto();
		commentThree = new SocialPostCommentDto();
		socialPost.socialPostComments.add(commentOne);
		socialPost.socialPostComments.add(commentTwo);
		
		commentOne.content = "Great job Chris, OMG!";
		commentOne.postId = 1L;
		
		commentTwo.content = "Wow! So strong!!!";
		commentTwo.postId = 1L;
		
		commentThree.content = "You can do better.";
		commentThree.postId = 1L;
		
		socialPostModel = SocialPostMapper.INSTANCE.toSocialPost(socialPost);
		socialPostModel.account = new AccountsModel();
		socialPostModel.account.setId(1L);
		
		commentOneModel = SocialPostCommentMapper.INSTANCE.toSocialPostComment(commentOne);
		commentOneModel.account = new AccountsModel();
		commentOneModel.account.setId(3L);
		
		account = new AccountsModel();
		
		account.setId(1L);
	}
	
	@Test
	void testServiceAddPostValid() {
		when(socialPostRepository.save(any(SocialPost.class))).thenReturn(socialPostModel);
		when(accountsRepository.findById(any(Long.class))).thenReturn(Optional.of(account));
		when(userProfileRepository.findUserProfileByAccountId(any(Long.class))).thenReturn(Optional.of(new UserProfile()));
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		
		SocialPostDto result = socialPostService.addPost(socialPost);
		
		assertNotNull(result);
		assertEquals(2, result.numberOfLikes);
		assertEquals(true, result.isPublic);
		assertEquals("Just benched 500 pounds, my name is Chris and I'm so strong!!", result.content);
	}
	
	@Test
	void testServiceGetPostValid() {
		when(socialPostRepository.findById(1L)).thenReturn(Optional.of(socialPostModel));
		
		SocialPostDto result = socialPostService.getPost(1L);
		
		assertNotNull(result);
		assertEquals(2, result.socialPostComments.size());
	}
	
	@Test
	void testServiceGetPostInvalidNotInDatabase() {
		when(socialPostRepository.findById(1L)).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> socialPostService.getPost(1L));
	}
	
	@Test
	void testServiceGetPostsFromAccountIdValid() {
		ArrayList<SocialPost> socialPosts = new ArrayList<>(List.of(socialPostModel));
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(socialPostRepository.getPostsFromAccountId(1L)).thenReturn(Optional.of(socialPosts));
		
		ArrayList<SocialPostDto> result = socialPostService.getPostsFromCurrentlyLoggedInUser(0, 1);
		
		assertNotNull(result);
		assertEquals(result.size(), 1);
		assertEquals(result.get(0).content, "Just benched 500 pounds, my name is Chris and I'm so strong!!");
	}
	
	@Test
	void testServiceGetSocialFeedValid() {
		account.setFriends(new ArrayList<AccountsModel>());
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));
		when(accountsRepository.getSocialFeed(anyList())).thenReturn(Optional.of(List.of(socialPostModel)));
		
		ArrayList<SocialPostDto> result = socialPostService.getSocialFeed(0, 1);
		
		assertNotNull(result);
		assertEquals(result.size(), 1);
		assertEquals(result.get(0).numberOfLikes, 2);
	}
	
	@Test
	void testServiceEditPostContentValid() {
		socialPostModel.content = "New content.";
		when(socialPostRepository.findById(1L)).thenReturn(Optional.of(socialPostModel));
		when(socialPostRepository.save(any(SocialPost.class))).thenReturn(socialPostModel);
		
		SocialPostDto result = socialPostService.editPostContent(1L, "New content.");
		
		assertNotNull(result);
		assertEquals("New content.", result.content);
	}
	
	@Test 
	void testServiceEditPostContentInvalidNotInDatabase() {
		when(socialPostRepository.findById(1L)).thenReturn(Optional.empty());
				
		assertThrows(RuntimeException.class, () -> socialPostService.editPostContent(1L, "New content."));
	}
	
	@Test
	void testServiceDeletePostContentValid() {
		socialPostModel.isDeleted = true;	
		when(socialPostRepository.findById(1L)).thenReturn(Optional.of(socialPostModel));
		when(socialPostRepository.save(any(SocialPost.class))).thenReturn(socialPostModel);
		
		SocialPostDto result = socialPostService.deletePost(1L);
		
		assertNotNull(result);
		assertEquals("Wow! So strong!!!", result.socialPostComments.get(1).content);
	}
	
	@Test
	void testServiceDeletePostContentInvalidNotInDatabase() {
		when(socialPostRepository.findById(1L)).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> socialPostService.deletePost(1L));
	}
	
	@Test
	void testServiceAddLikeValid() {
		when(socialPostRepository.findById(1L)).thenReturn(Optional.of(socialPostModel));
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(account));
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(socialPostRepository.save(any(SocialPost.class))).thenReturn(socialPostModel);
		
		SocialPostDto result = socialPostService.addLike(1L);
		
		assertNotNull(result);
		assertEquals(3, result.numberOfLikes);
	}
	
	@Test
	void testServiceAddLikeInvalidPostNotInDatabase() {
		when(socialPostRepository.findById(1L)).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> socialPostService.addLike(1L));
	}
	
	@Test
	void testServiceAddLikeInvalidUserNotInDatabase() {
		when(socialPostRepository.findById(1L)).thenReturn(Optional.of(socialPostModel));
		when(accountsRepository.findById(1L)).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> socialPostService.addLike(1L));
	}
	
	@Test
	void testServiceDeleteLikeValid() {
		when(socialPostRepository.findById(1L)).thenReturn(Optional.of(socialPostModel));
		when(accountsService.getLoggedInUserId()).thenReturn(2L);
		when(accountsRepository.findById(2L)).thenReturn(Optional.of(account));
		when(socialPostRepository.save(any(SocialPost.class))).thenReturn(socialPostModel);
		
		SocialPostDto result = socialPostService.deleteLike(1L);
		
		assertNotNull(result);
		assertEquals(1, result.numberOfLikes);
	}
	
	@Test
	void testServiceDeleteLikeInvalidPostNotInDatabase() {
		when(socialPostRepository.findById(1L)).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> socialPostService.deleteLike(1L));
	}
	
	@Test
	void testServiceDeleteLikeInvalidUserNotInDatabase() {
		when(socialPostRepository.findById(1L)).thenReturn(Optional.of(socialPostModel));
		when(accountsRepository.findById(1L)).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> socialPostService.deleteLike(1L));
	}
	
	@Test
	void testServiceAddCommentValid() {
		when(socialPostRepository.findById(any(Long.class))).thenReturn(Optional.of(socialPostModel));
		when(accountsRepository.findById(any(Long.class))).thenReturn(Optional.of(account));
		when(userProfileRepository.findUserProfileByAccountId(any(Long.class))).thenReturn(Optional.of(new UserProfile()));
		when(socialPostRepository.save(any(SocialPost.class))).thenReturn(socialPostModel);
		
		SocialPostDto result = socialPostService.addComment(commentThree);
		
		assertNotNull(result);
		assertEquals(3, result.socialPostComments.size());
	}
	
	@Test
	void testServiceAddCommentInvalidNotInDatabase() {
		when(socialPostRepository.findById(1L)).thenReturn(Optional.empty());

		assertThrows(RuntimeException.class, () -> socialPostService.addComment(commentThree));
	}
	
	@Test
	void testServiceDeleteCommentValid() {
		socialPostModel.socialPostComments.remove(0);
		when(socialPostCommentRepository.findById(2L)).thenReturn(Optional.of(commentOneModel));
		when(socialPostRepository.findById(1L)).thenReturn(Optional.of(socialPostModel));
		when(socialPostRepository.save(any(SocialPost.class))).thenReturn(socialPostModel);
		
		SocialPostDto result = socialPostService.deleteComment(2L);
		
		assertNotNull(result);
		assertEquals(1, result.socialPostComments.size());
	}
	
	@Test
	void testServiceDeleteCommentInvalidNotInDatabase() {
		when(socialPostCommentRepository.findById(1L)).thenReturn(Optional.empty());
		
		assertThrows(RuntimeException.class, () -> socialPostService.deleteComment(1L));
	}
}