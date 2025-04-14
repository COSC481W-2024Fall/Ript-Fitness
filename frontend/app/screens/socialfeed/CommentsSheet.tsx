import React, {
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useContext,
} from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
  Keyboard,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  FlatList,
  Alert,
} from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useSocialFeed, SocialPostComment } from "@/context/SocialFeedContext";
import ProfileImage from "../../../assets/images/profile/Profile.png";
import { GlobalContext } from "@/context/GlobalContext";
import { Ionicons } from "@expo/vector-icons";

//Interface for external control of the CommentsSheet
export interface CommentsSheetRef {
  snapToIndex: (index: number) => void;
  close: () => void;
  showCommentsForPost: (postId: string) => void;
}

interface CommentItemProps {
  comment: SocialPostComment & {
    username?: string;
    userProfile?: {
      id?: string;
      profilePicture?: string;
      username?: string;
      displayname?: string;
    };
  };
  onReply?: () => void;
}

interface CommentsSheetProps {
  userProfilePicture?: string;
}

const formatCommentTime = (dateString: string) => {
  let date = new Date(dateString);
  if (isNaN(date.getTime())) {
    const parts = dateString.match(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+)\s*(\w+)/);
    if (parts) {
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const year = parseInt(parts[3], 10);
      let hours = parseInt(parts[4], 10);
      const minutes = parseInt(parts[5], 10);
      const ampm = parts[6].toUpperCase();

      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;

      date = new Date(year, month, day, hours, minutes);
    }
  }

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const CommentItem = ({ comment, onReply }: CommentItemProps) => {
  const commentProfileImageSource = comment.userProfile?.profilePicture
    ? { uri: `data:image/png;base64,${comment.userProfile.profilePicture}` }
    : ProfileImage;

  const { deleteComment } = useSocialFeed();
  const context = useContext(GlobalContext);
  const currentUserID = context?.userProfile.id;
  const isCommentOwner = comment.userProfile?.id === currentUserID;

  const isDarkMode = context?.isDarkMode;

  const handleDeleteComment = () => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteComment(comment.id),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.commentContainer}>
      <Image source={commentProfileImageSource} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={isDarkMode?styles.darkCommentUsername:styles.commentUsername}>
            {comment.displayname || comment.accountId}
          </Text>
          <Text style={isDarkMode? styles.darkCommentTime:styles.commentTime}>
            {formatCommentTime(comment.dateTimeCreated)}
          </Text>
        </View>
        <Text style={isDarkMode? styles.darkCommentText:styles.commentText}>{comment.content}</Text>
        {onReply && (
          <TouchableOpacity style={styles.replyButton} onPress={onReply}>
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>
        )}
        {isCommentOwner && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteComment}
          >
            <Ionicons name="trash-outline" size={18} color={isDarkMode? 'lightgray' : "#666"} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/**
 * A bottom sheet component for displaying and managing comments on social posts.
 * Uses forwardRef to expose methods for external control of the sheet.
 */
const CommentsSheet = forwardRef<CommentsSheetRef, CommentsSheetProps>(
  ({ userProfilePicture }, ref) => {
    // State Management
    const [commentText, setCommentText] = useState("");
    const [currentPostId, setCurrentPostId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // Context and Refs
    const { posts, addComment } = useSocialFeed();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const inputRef = useRef<any>(null);

    // How far up on the screen the bottom sheet will go
    const snapPoints = React.useMemo(() => ["85%"], []);

    // Get current post and it's comments
    const currentPost = posts.find((post) => post.id === currentPostId);
    const comments =
    currentPost?.comments.filter((comment) => !comment.isDeleted) || [];

    const context = useContext(GlobalContext);
    const isDarkMode = context?.isDarkMode;

    // Expose methods for external control
    useImperativeHandle(ref, () => ({
      snapToIndex: (index: number) => {
        console.log("Snapping to index:", index);
        setIsOpen(true);
        bottomSheetRef.current?.snapToIndex(index);
      },
      close: () => {
        console.log("Closing comments sheet");
        Keyboard.dismiss();
        setIsOpen(false);
        bottomSheetRef.current?.close();
        setCurrentPostId(null);
      },
      showCommentsForPost: (postId: string) => {
        console.log("Opening comments for post:", postId);
        setCurrentPostId(postId);
        setIsOpen(true);
        bottomSheetRef.current?.snapToIndex(0);
      },
    }));

    /**
     * Handles submission of a new comment
     * Adds the comment to the post and clears the input
     */
    const handleSubmitComment = async () => {
      if (commentText.trim() && currentPostId) {
        console.log("[DEBUG] Submitting comment:", {
          postId: currentPostId,
          commentText: commentText,
        });

        try {
          console.log("[DEBUG] Calling addComment...");
          await addComment(currentPostId, commentText);
          console.log("[DEBUG] addComment completed");

          const updatedPost = posts.find((p) => p.id === currentPostId);
          if (updatedPost && updatedPost.socialPostComments == null) {
            updatedPost.socialPostComments = [];
          }
          console.log("[DEBUG] Post state after API call:", updatedPost);

          setCommentText("");
          Keyboard.dismiss();
        } catch (error) {
          console.error("[DEBUG] Error in handleSubmitComment:", error);
        }
      }
    };

    /**
     * Handles changes in the bottom sheet position
     * Updates state and keyboard when sheet is closed
     */
    const handleSheetChange = useCallback((index: number) => {
      console.log("Sheet index changed to:", index);
      if (index === -1) {
        Keyboard.dismiss();
        setIsOpen(false);
        setCurrentPostId(null);
      } else {
        setIsOpen(index === 0);
      }
    }, []);

    const profileImageSource = userProfilePicture
      ? { uri: `data:image/png;base64,${userProfilePicture}` }
      : ProfileImage;

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onChange={handleSheetChange}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        handleStyle={{
          backgroundColor: isDarkMode?'#21BFBF' : 'white',
          height: 25,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,

        }}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={isDarkMode? styles.darkContainer:styles.container}>
            <View style={styles.header}>
              <Text style={isDarkMode? styles.darkTitle:styles.title}>Comments</Text>
            </View>

            {/* Comments list */}
            <BottomSheetScrollView>
              <FlatList
                keyboardShouldPersistTaps="handled"
                scrollEnabled={true}
                data={comments}
                keyExtractor={(item) => item.id}
                style={{ zIndex: 10, elevation: 10 }}
                renderItem={({ item }) => (
                  <CommentItem
                    comment={{
                      ...item,
                      username: item.userProfile?.username || item.accountId,
                      displayname: item.userProfile?.displayname || item.accountId,
                    }}
                    onReply={() => {
                      inputRef.current?.focus();
                      const usernameToReplyTo = item.displayname;
                      console.log(item)
                      setCommentText(`@${usernameToReplyTo} `);
                    }}
                  />
                )}
                contentContainerStyle={styles.commentsList}
              />
            </BottomSheetScrollView>

            {/* Comment input section */}
            <View style={styles.inputContainer}>
              <Image source={profileImageSource} style={styles.inputAvatar} />
              <View style={styles.textInputContainer}>
                <BottomSheetTextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Add a comment"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={1000}
                  onSubmitEditing={handleSubmitComment}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    !commentText.trim() && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSubmitComment}
                  disabled={!commentText.trim()}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  darkContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  darkTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: 'white'
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentContainer: {
    flexDirection: "row",
    marginVertical: 8,
    alignItems: "flex-start",
    position: "relative",
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    
  },
  commentUsername: {
    fontWeight: "600",
    marginRight: 8,
    
  },
  commentTime: {
    color: "#666",
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  darkCommentUsername: {
    fontWeight: "600",
    marginRight: 8,
    color: 'white'
  },
  darkCommentTime: {
    fontSize: 12,
    color: 'lightgray'
  },
  darkCommentText: {
    fontSize: 14,
    lineHeight: 20,
    color: 'white'
  },
  replyButton: {
    marginTop: 4,
  },
  replyButtonText: {
    color: "#666",
    fontSize: 12,
  },
  darkReplyButtonText: {
    color: "lightgray",
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "flex-end",
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: "row",
    //alignItems: "flex-end",
    alignItems: "center",
  },
  input: {
    flex: 50,
    maxHeight: 100,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    fontSize: 14,
    paddingVertical: 9,
  },
  sendButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
    flex: 1,
    minWidth: 60,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: "#21BFBF",
    fontWeight: "600",
  },
  deleteButton: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 8,
  },
});

export default CommentsSheet;
