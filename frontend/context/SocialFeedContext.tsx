import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { httpRequests } from "@/api/httpRequests";
import { GlobalContext } from "./GlobalContext";
import TimeZone from "@/api/timeZone";

// Define the structure of a comment on a post
export interface SocialPostComment {
  id: string;
  content: string;
  postId: string;
  accountId: string;
  username?: string;
  dateTimeCreated: string;
  userProfile?: {
    username?: string;
    profilePicture?: string;
  };
  isDeleted: boolean;
}

// Define the structure of a social post
export interface SocialPost {
  id: string;
  content: string;
  accountId: string;
  dateTimeCreated: string;
  likes: string[];
  comments: SocialPostComment[];
  socialPostComments: SocialPostComment[];
  isDeleted: boolean;
  numberOfLikes: number;
  userIDsOfLikes: string[];
  userProfile: {
    id?: string;
    username?: string;
    profilePicture?: string;
  } | null;
}

export interface Friend {
  username: string;
  accountId: string;
}
interface LoadingStates {
  isAddingPost: boolean;
  isDeletingPost: boolean;
  isAddingComment: boolean;
  isDeletingComment: boolean;
  isTogglingLike: boolean;
  isAddingFriend: boolean;
  isDeletingFriend: boolean;
}

// Define the context type
interface SocialFeedContextType {
  posts: SocialPost[];
  friends: Friend[];
  loading: boolean;
  loadingStates: LoadingStates;
  error: string | null;
  clearError: () => void;
  fetchPosts: (startIndex: number, endIndex: number) => Promise<void>;
  addPost: (content: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  fetchFriends: () => Promise<void>;
}

// Create the context
const SocialFeedContext = createContext<SocialFeedContextType | undefined>(
  undefined
);

// Retry in case of network errors
const retry = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
};

// Provider component
export function SocialFeedProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const context = useContext(GlobalContext);
  const currentUserID = context?.userProfile.id;
  const token = context?.data.token;

  // Loading states for individual operations
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    isAddingPost: false,
    isDeletingPost: false,
    isAddingComment: false,
    isDeletingComment: false,
    isTogglingLike: false,
    isAddingFriend: false,
    isDeletingFriend: false,
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setLoadingState = useCallback(
    (key: keyof LoadingStates, value: boolean) => {
      setLoadingStates((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Fetch friends list
  const fetchFriends = useCallback(async () => {
    if (!token) {
      console.error("No token available for fetching friends.");
      setError("Authentication token is missing.");
      return;
    }

    try {
      const response = await retry(() =>
        httpRequests.get(
          "/friends/getFriendsListOfCurrentlyLoggedInUser",
          token
        )
      );
      if (Array.isArray(response)) {
        const friendsList = response.map((username) => ({
          username,
          accountId: username,
        }));
        setFriends(friendsList);
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
      setError("Failed to fetch friends list.");
    }
  }, [token]);

  // Fetch posts
  const fetchPosts = useCallback(
    async (startIndex: number = 0, endIndex: number = 10) => {
      if (!token) {
        console.error("No token available for fetching posts.");
        setError("Authentication token is missing.");
        return;
      }

      console.log("Fetching posts with:", { startIndex, endIndex });

      setLoading(true);
      setError(null);
      const abortController = new AbortController();

      try {
        console.log(`[DEBUG] Fetching posts from ${startIndex} to ${endIndex}`);

        const response = await retry(() =>
          httpRequests.get(
            `/socialPost/getSocialFeed/${startIndex}/${endIndex}`,
            token
          )
        );

        console.log("[DEBUG] Raw response from server:", response);

        if (!response || !Array.isArray(response)) {
          if (startIndex === 0) {
            setPosts([]);
          }
          return;
        }

        const formattedPosts = response.map((post) => {
          return {
            ...post,
            id: String(post.id),
            accountId: post.accountId || "-1",
            likes: Array.isArray(post.userIDsOfLikes)
              ? post.userIDsOfLikes.filter(
                  (id): id is string => id !== undefined
                )
              : [],
            userIDsOfLikes: Array.isArray(post.userIDsOfLikes)
              ? post.userIDsOfLikes.filter(
                  (id): id is string => id !== undefined
                )
              : [],
            comments: Array.isArray(post.socialPostComments)
              ? post.socialPostComments.map((comment: any) => ({
                  ...comment,
                  accountId: comment.accountId,
                  username: comment.userProfile?.username || "Anonymous",
                  userProfile: comment.userProfile,
                  dateTimeCreated: TimeZone.convertToTimeZone(
                    comment.dateTimeCreated,
                    TimeZone.get()
                  ),
                  isDeleted: comment.isDeleted || false,
                }))
              : [],
            socialPostComments: Array.isArray(post.socialPostComments)
              ? post.socialPostComments.map((comment: any) => ({
                  ...comment,
                  accountId: comment.accountId,
                  username: comment.userProfile?.username,
                  userProfile: comment.userProfile,
                  dateTimeCreated: TimeZone.convertToTimeZone(
                    comment.dateTimeCreated,
                    TimeZone.get()
                  ),
                  isDeleted: comment.isDeleted || false,
                }))
              : [],
            dateTimeCreated: TimeZone.convertToTimeZone(
              post.dateTimeCreated,
              TimeZone.get()
            ),
            userProfile: post.userProfile || {
              username: post.accountId,
              profilePicture: null,
            },
          };
        });

        setPosts((currentPosts) => {
          if (startIndex === 0) {
            return formattedPosts;
          }
          const existingPostIds = new Set(currentPosts.map((p) => p.id));
          const uniqueNewPosts = formattedPosts.filter(
            (post) => !existingPostIds.has(post.id)
          );
          return [...currentPosts, ...uniqueNewPosts].sort(
            (a, b) =>
              new Date(b.dateTimeCreated).getTime() -
              new Date(a.dateTimeCreated).getTime()
          );
        });
        clearError();
      } catch (err: any) {
        if (err.name === "AbortError") {
          return;
        }
        console.error("[DEBUG] Error fetching posts:", err);
        if (startIndex === 0) {
          setPosts([]);
        }
        setError("Failed to fetch posts. Please try again later.");
      } finally {
        setLoading(false);
      }

      return () => {
        abortController.abort();
      };
    },
    [token, clearError, currentUserID, context?.userProfile, TimeZone]
  );

  // Add post
  const addPost = useCallback(
    async (content: string) => {
      if (!token) {
        console.error("No token available for adding a post.");
        setError("Authentication token is missing.");
        return;
      }

      setLoadingState("isAddingPost", true);
      try {
        const response = await retry(() =>
          httpRequests.post("/socialPost/addPost", token, { content })
        );

        if (!response.ok) {
          throw new Error("Failed to add post");
        }

        const newPost = await response.json();
        const formattedPost: SocialPost = {
          ...newPost,
          id: String(newPost.id),
          likes: Array.isArray(newPost.userIDsOfLikes)
            ? newPost.userIDsOfLikes
            : [],
          comments: Array.isArray(newPost.socialPostComments)
            ? newPost.socialPostComments
            : [],
          dateTimeCreated: TimeZone.convertToTimeZone(
            newPost.dateTimeCreated,
            TimeZone.get()
          ),
        };

        setPosts((prevPosts) => [formattedPost, ...prevPosts]);
        clearError();
      } catch (err: any) {
        console.error("Error adding post:", err);
        setError("Failed to add post. Please try again.");
      } finally {
        setLoadingState("isAddingPost", false);
      }
    },
    [token, clearError]
  );

  // Delete post
  const deletePost = useCallback(
    async (postId: string) => {
      if (!token) {
        console.error("No token available for deleting a post.");
        setError("Authentication token is missing.");
        return;
      }

      setLoadingState("isDeletingPost", true);
      try {
        await retry(() =>
          httpRequests.delete(`/socialPost/deletePost/${postId}`, token)
        );
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        clearError();
      } catch (err: any) {
        console.error(`Error deleting post with ID ${postId}:`, err);
        setError("Failed to delete post. Please try again.");
      } finally {
        setLoadingState("isDeletingPost", false);
      }
    },
    [token, clearError]
  );

  // Update post helper
  const updatePost = useCallback(
    (postId: string, updateFn: (post: SocialPost) => SocialPost) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === postId ? updateFn(post) : post))
      );
    },
    []
  );

  // Toggle like
  const toggleLike = useCallback(
    async (postId: string) => {
      if (!token) return;

      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      setLoadingState("isTogglingLike", true);
      let isLiked = currentUserID
        ? post.userIDsOfLikes.includes(currentUserID)
        : false;

      // Optimistic update
      updatePost(postId, (post) => ({
        ...post,
        userIDsOfLikes: isLiked
          ? post.userIDsOfLikes.filter(
              (id) => id !== currentUserID && id !== undefined
            )
          : [...post.userIDsOfLikes, currentUserID].filter(
              (id): id is string => id !== undefined
            ),
        numberOfLikes: isLiked
          ? post.numberOfLikes - 1
          : post.numberOfLikes + 1,
      }));

      try {
        if (isLiked) {
          await retry(() =>
            httpRequests.put(`/socialPost/deleteLike/${postId}`, token, {})
          );
        } else {
          await retry(() =>
            httpRequests.put(`/socialPost/addLike/${postId}`, token, {})
          );
        }
        clearError();
      } catch (err) {
        // Revert on error
        updatePost(postId, (post) => ({
          ...post,
          userIDsOfLikes: isLiked
            ? [...post.userIDsOfLikes, currentUserID]
            : post.userIDsOfLikes.filter((id) => id !== currentUserID),
          numberOfLikes: isLiked
            ? post.numberOfLikes + 1
            : post.numberOfLikes - 1,
          likes: isLiked
            ? [...post.likes, token]
            : post.likes.filter((id) => id !== token),
        }));
        setError("Failed to update like status.");
      } finally {
        setLoadingState("isTogglingLike", false);
      }
    },
    [posts, token, updatePost, clearError, currentUserID]
  );

  // Add comment
  const addComment = useCallback(
    async (postId: string, content: string) => {
      console.log("[DEBUG] AddComment started:", { postId, content });
      console.log(postId, " ", content);

      if (!token) {
        console.error("[DEBUG] No token available for adding a comment.");
        setError("Authentication token is missing.");
        return;
      }

      setLoadingState("isAddingComment", true);
      try {
        console.log("[DEBUG] Making API request with comment payload:", {
          content,
          postId,
        });

        const response = await retry(() =>
          httpRequests.put("/socialPost/addComment", token, { content, postId })
        );

        console.log("[DEBUG] Raw API response:", response);

        if (!response.ok) {
          throw new Error("Failed to add comment");
        }

        const responseData = await response.json();

        const newComment =
          responseData.socialPostComments[
            responseData.socialPostComments.length - 1
          ];

        console.log("[DEBUG] Parsed API response (newComment):", newComment);

        if (newComment.content !== content) {
          console.warn("[DEBUG] Content mismatch!", {
            sent: content,
            received: newComment.content,
          });
        }

        const formattedComment: SocialPostComment = {
          id: String(newComment.id),
          content: newComment.content,
          postId: String(newComment.postId),
          accountId: context?.userProfile.id, // Use currentUserID from context
          username: context?.userProfile.username ?? "Anonymous", // Use username from context
          userProfile: context?.userProfile, // Use userProfile from context
          dateTimeCreated: new Date().toISOString(), // Generate new timestamp
        };

        console.log("[DEBUG] Formatted comment:", formattedComment);

        setPosts((prevPosts) => {
          const updatedPosts = prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [...post.comments, formattedComment],
                  socialPostComments: [
                    ...post.socialPostComments,
                    formattedComment,
                  ],
                }
              : post
          );
          return updatedPosts;
        });
        clearError();
      } catch (err: any) {
        console.error(`Error adding comment to post ID ${postId}:`, err);
        setError("Failed to add comment. Please try again.");
      } finally {
        setLoadingState("isAddingComment", false);
      }
    },
    [token, clearError, currentUserID, context?.userProfile]
  );

  // Delete comment
  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!token) {
        console.error("No token available for deleting a comment.");
        setError("Authentication token is missing.");
        return;
      }

      setLoadingState("isDeletingComment", true);

      try {
        // Optimistic update (with comment count update)
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.comments.some((comment) => comment.id === commentId)) {
              const updatedComments = post.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, isDeleted: true }
                  : comment
              );

              const updatedSocialPostComments = post.socialPostComments.map(
                (comment) =>
                  comment.id === commentId
                    ? { ...comment, isDeleted: true }
                    : comment
              );

              return {
                ...post,
                comments: updatedComments.filter(
                  (comment) => !comment.isDeleted
                ), // Filter deleted comments
                socialPostComments: updatedSocialPostComments.filter(
                  (comment) => !comment.isDeleted
                ),
              };
            } else {
              return post;
            }
          })
        );

        const response = await retry(() =>
          httpRequests.put(`/socialPost/deleteComment/${commentId}`, token, {})
        );

        if (!response.ok) {
          // Revert the optimistic update if the server request fails
          setPosts((prevPosts) =>
            prevPosts.map((post) => {
              const updatedComments = post.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, isDeleted: false }
                  : comment
              );
              const updatedSocialPostComments = post.socialPostComments.map(
                (comment) =>
                  comment.id === commentId
                    ? { ...comment, isDeleted: false }
                    : comment
              );
              return {
                ...post,
                comments: updatedComments,
                socialPostComments: updatedSocialPostComments,
              };
            })
          );
          throw new Error(
            `Failed to delete comment: ${response.status} ${response.statusText}`
          );
        }

        clearError();
      } catch (err: any) {
        console.error(`Error deleting comment with ID ${commentId}:`, err);
        setError("Failed to delete comment. Please try again.");
      } finally {
        setLoadingState("isDeletingComment", false);
      }
    },
    [token, clearError, setPosts]
  );

  // Initial friends fetch
  useEffect(() => {
    let mounted = true;

    if (token) {
      const loadFriends = async () => {
        try {
          const response = await httpRequests.get(
            "/friends/getFriendsListOfCurrentlyLoggedInUser",
            token
          );
          if (mounted && Array.isArray(response)) {
            const friendsList = response.map((username) => ({
              username,
              accountId: username,
            }));
            setFriends(friendsList);
          }
        } catch (err) {
          if (mounted) {
            console.error("Error fetching friends:", err);
            setError("Failed to fetch friends list.");
          }
        }
      };

      loadFriends();
    }

    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <SocialFeedContext.Provider
      value={{
        posts,
        friends,
        loading,
        loadingStates,
        error,
        clearError,
        fetchPosts,
        addPost,
        deletePost,
        toggleLike,
        addComment,
        deleteComment,
        fetchFriends,
      }}
    >
      {children}
    </SocialFeedContext.Provider>
  );
}

// Custom hook to use the SocialFeedContext
export function useSocialFeed() {
  const context = useContext(SocialFeedContext);
  if (context === undefined) {
    throw new Error("useSocialFeed must be used within a SocialFeedProvider");
  }
  return context;
}
