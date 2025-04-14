package com.riptFitness.Ript_Fitness_Backend.web.controllerTests;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.config.JwtUtil;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.config.SecurityConfig;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.SocialPostService;
import com.riptFitness.Ript_Fitness_Backend.web.controller.SocialPostController;
import com.riptFitness.Ript_Fitness_Backend.web.dto.SocialPostCommentDto;
import com.riptFitness.Ript_Fitness_Backend.web.dto.SocialPostDto;

@WebMvcTest(SocialPostController.class)
@ActiveProfiles("test")
@Import(SecurityConfig.class)
public class SocialPostControllerTest {
	
	@Autowired
	private MockMvc mockMvc;
	
	@MockBean
	private static SocialPostService socialPostService;
	
	@Autowired
	private ObjectMapper objectMapper;
	
	@MockBean
	private JwtUtil jwtUtil;
	
	@MockBean
	private UserDetailsService userDetailsService;
	
	private SocialPostDto socialPost;
	private SocialPostCommentDto commentOne;
	private SocialPostCommentDto commentTwo;
	private SocialPostCommentDto commentThree;
	
	@BeforeEach
	public void setUp() {
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
	}
	
	@AfterAll
	public static void tearDown() {
		reset(socialPostService);
	}
	
	//Controller tests
	@Test
	public void testAddPostValidRequest() throws Exception{
		when(socialPostService.addPost(any(SocialPostDto.class))).thenReturn(socialPost);
		
		mockMvc.perform(post("/socialPost/addPost")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsBytes(socialPost)))
				.andExpect(status().isCreated())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.content").value("Just benched 500 pounds, my name is Chris and I'm so strong!!"))
				.andExpect(jsonPath("$.numberOfLikes").value(2))
				.andExpect(jsonPath("$.socialPostComments[0].content").value("Great job Chris, OMG!"))
				.andExpect(jsonPath("$.isPublic").value(true))
				.andReturn();
	}
	
	@Test
	public void testAddPostInvalidRequestEmptyBody() throws Exception{
		mockMvc.perform(post("/socialPost/addPost")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpect(status().isInternalServerError())
				.andReturn();
	}
	
	@Test
	public void testGetPostValidRequest() throws Exception{
		when(socialPostService.getPost(any(Long.class))).thenReturn(socialPost);
		
		mockMvc.perform(get("/socialPost/getPost/1")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpectAll(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.content").value("Just benched 500 pounds, my name is Chris and I'm so strong!!"))
				.andExpect(jsonPath("$.numberOfLikes").value(2))
				.andExpect(jsonPath("$.isPublic").value(true))
				.andExpect(jsonPath("$.socialPostComments[0].content").value("Great job Chris, OMG!"))
				.andReturn();
	}
	
	@Test
	public void testGetPostInvalidRequestNoPathVariable() throws Exception {
		mockMvc.perform(get("/socialPost/getPost"))
			.andExpect(status().isInternalServerError());
	}
	
	@Test
	public void testGetPostsFromCurrentlyLoggedInUserValid() throws Exception {
		ArrayList<SocialPostDto> returnedArrayList = new ArrayList<>();
		returnedArrayList.add(socialPost);
		when(socialPostService.getPostsFromCurrentlyLoggedInUser(0, 0)).thenReturn(returnedArrayList);
		
		mockMvc.perform(get("/socialPost/getPostsFromCurrentlyLoggedInUser/0/0")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$[0].content").value("Just benched 500 pounds, my name is Chris and I'm so strong!!"))
				.andReturn();
	}
	
	@Test
	public void testGetPostsFromAccountIdValid() throws Exception {
		ArrayList<SocialPostDto> returnedArrayList = new ArrayList<>();
		returnedArrayList.add(socialPost);
		when(socialPostService.getPostsFromAccountId(2L, 0, 0)).thenReturn(returnedArrayList);
		
		mockMvc.perform(get("/socialPost/getPostsFromAccountId/2/0/0")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$[0].content").value("Just benched 500 pounds, my name is Chris and I'm so strong!!"))
				.andReturn();
	}
	
	@Test
	public void testGetPostsFromAccountIdInvalidNoPathVariables() throws Exception {
		mockMvc.perform(get("/socialPost/getPostsFromAccountId"))
				.andExpect(status().isInternalServerError());
			
	}
	
	@Test
	public void testGetSocialFeedValid() throws Exception {
		ArrayList<SocialPostDto> returnedArrayList = new ArrayList<>();
		returnedArrayList.add(socialPost);
		when(socialPostService.getSocialFeed(0, 0)).thenReturn(returnedArrayList);
		
		mockMvc.perform(get("/socialPost/getSocialFeed/0/0")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$[0].content").value("Just benched 500 pounds, my name is Chris and I'm so strong!!"))
				.andReturn();
	}
	
	@Test
	public void testGetSocialFeedInvalidNoPathVariables() throws Exception {
		mockMvc.perform(get("/socialPost/getSocialFeed"))
				.andExpect(status().isInternalServerError());
			
	}	
	
	@Test
	public void testEditPostContentValidRequest() throws Exception {
		socialPost.content = "New content";
		when(socialPostService.editPostContent(any(Long.class), any(String.class))).thenReturn(socialPost);
		
		mockMvc.perform(put("/socialPost/editPostContent/1")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsBytes(socialPost)))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.content").value("New content"))
				.andReturn();
				
	}
	
	@Test
	public void testEditPostContentInvalidRequestEmptyBody() throws Exception {
		mockMvc.perform(put("/socialPost/editPostContent/1")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpect(status().isInternalServerError())
				.andReturn();
	}
	
	@Test
	public void testEditPostContentInvalidRequestNoPathVariable() throws Exception {
		mockMvc.perform(put("/socialPost/editPostContent"))
				.andExpect(status().isInternalServerError());
	}
	
	@Test
	public void testDeletePostValidRequest() throws Exception {
		socialPost.isDeleted = true;
		
		when(socialPostService.deletePost(any(Long.class))).thenReturn(socialPost);
		
		mockMvc.perform(delete("/socialPost/deletePost/1")
				.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.isDeleted").value(true))
				.andReturn();
	}
	
	@Test
	public void testDeletePostInvalidRequestNoPathVariable() throws Exception {
		mockMvc.perform(delete("/socialPost/deletePost"))
				.andExpect(status().isInternalServerError());
	}
	
	@Test
	public void testAddLikeValidRequest() throws Exception {
		socialPost.numberOfLikes++;
		
		when(socialPostService.addLike(any(Long.class))).thenReturn(socialPost);
		
		mockMvc.perform(put("/socialPost/addLike/1")
				.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.numberOfLikes").value(3))
				.andReturn();
	}
	
	@Test
	public void testAddLikeInvalidRequestNoPathVariable() throws Exception {
		mockMvc.perform(put("/socialPost/addLike"))
				.andExpect(status().isInternalServerError());
	}
	
	@Test
	public void testDeleteLikeValidRequest() throws Exception {
		socialPost.numberOfLikes--;
		
		when(socialPostService.deleteLike(any(Long.class))).thenReturn(socialPost);
		
		mockMvc.perform(put("/socialPost/deleteLike/1")
				.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.numberOfLikes").value(1))
				.andReturn();
	}
	
	@Test
	public void testDeleteLikeInvalidRequestNoPathVariable() throws Exception {
		mockMvc.perform(put("/socialPost/deleteLike"))
				.andExpect(status().isInternalServerError());
	}
	
	@Test
	public void testAddCommentValidRequest() throws Exception {
		socialPost.socialPostComments.add(commentThree);
		
		when(socialPostService.addComment(any(SocialPostCommentDto.class))).thenReturn(socialPost);
		
		mockMvc.perform(put("/socialPost/addComment")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsBytes(commentThree)))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.socialPostComments.size()").value(3))
				.andReturn();
	}
	
	@Test
	public void testAddCommentInvalidRequestEmptyBody() throws Exception {
		mockMvc.perform(put("/socialPost/addComment")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""))
				.andExpect(status().isInternalServerError())
				.andReturn();
	}
	
	@Test
	public void testDeleteCommentValidRequest() throws Exception {
		socialPost.socialPostComments.remove(0);
		
		when(socialPostService.deleteComment(any(Long.class))).thenReturn(socialPost);
		
		mockMvc.perform(put("/socialPost/deleteComment/1")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsBytes(commentThree)))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.socialPostComments.size()").value(1))
				.andReturn();
	}
	
	@Test
	public void testDeleteCommentInvalidNoPathVariable() throws Exception {
		mockMvc.perform(put("/socialPost/deleteComment"))
				.andExpect(status().isInternalServerError());
	}
}
