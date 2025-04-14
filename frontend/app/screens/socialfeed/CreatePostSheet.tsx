import React, {
  useRef,
  useState,
  useContext,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import BottomSheet, { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSocialFeed } from "@/context/SocialFeedContext";
import ProfileImage from "../../../assets/images/profile/Profile.png";
import { TextInput } from "react-native";
import { GlobalContext } from "@/context/GlobalContext";


export interface CreatePostSheetRef {
  snapToIndex: (index: number) => void;
  close: () => void;
}

interface CreatePostSheetProps {
  userProfilePicture?: string;
}

const CreatePostSheet = forwardRef<CreatePostSheetRef, CreatePostSheetProps>(
  ({ userProfilePicture }, ref) => {
    const [postText, setPostText] = useState("");
    const { addPost } = useSocialFeed();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const inputRef = useRef<any>(null);
    const snapPoints = React.useMemo(() => ["100%"], []);

    const context = useContext(GlobalContext);
    const isDarkMode = context?.isDarkMode;

    const [isPublic, setIsPublic] = useState(false); //from DeepSeek


    // Handle sheet state changes
    const handleSheetChange = useCallback((index: number) => {
      if (index === -1) {
        setPostText("");
        Keyboard.dismiss();
      }
    }, []);

    const handleCancel = () => {
      setPostText("");
      Keyboard.dismiss();
      bottomSheetRef.current?.close();
    };

    useImperativeHandle(ref, () => ({
      snapToIndex: (index: number) => {
        bottomSheetRef.current?.snapToIndex(index);
        if (index === 0 || index === 1) {
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        }
      },
      close: () => {
        Keyboard.dismiss();
        bottomSheetRef.current?.close();
      },
    }));
    //adjusted handlePost by DeepSeek to try to fix the issue of add post page not 
    //completely disapearing after saving a post
    const handlePost = async () => {
      if (!postText.trim()) return;
    
      try {
        // Immediately close the sheet while the post is being submitted
        bottomSheetRef.current?.close();
        
        // Reset UI state
        setPostText("");
        setIsPublic(false);
        Keyboard.dismiss();
        
        // Submit the post after closing the sheet
        await addPost(postText, isPublic);
      } catch (error) {
        console.error("Failed to post:", error);
        // Optionally re-open the sheet if posting fails
        bottomSheetRef.current?.snapToIndex(0);
      }
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onChange={handleSheetChange}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="none"
        android_keyboardInputMode="adjustResize"
        handleStyle={{
          backgroundColor: isDarkMode?'#21BFBF' : 'white',
          height: 25,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,

        }}
      >
        <View style={isDarkMode? styles.darkContainer : styles.container} testID="create-post-sheet">
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={isDarkMode? styles.darkCancelButtonText : styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={isDarkMode? styles.darkTitle : styles.title}>New Post</Text>
            <TouchableOpacity
              style={[
                styles.shareButton,
                !postText.trim() && styles.shareButtonDisabled,
              ]}
              onPress={handlePost}
              disabled={!postText.trim()}
            >
              <Text
                style={[
                  styles.shareButtonText,
                  !postText.trim() && styles.shareButtonDisabled,
                ]}
              >
                Share
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mainContent}>
            <View style={styles.userInfoContainer}>
              <Image
                source={
                  userProfilePicture
                    ? { uri: `data:image/png;base64,${userProfilePicture}` }
                    : ProfileImage
                }
                style={styles.profileImage}
              />
              <BottomSheetTextInput
                ref={inputRef}
                style={isDarkMode? styles.darkInput : styles.input}
                multiline
                placeholder="What's happening?"
                placeholderTextColor={isDarkMode? 'lightgray' : 'darkgray'}
                value={postText}
                onChangeText={setPostText}
                autoFocus={false}
                scrollEnabled={true}
                onSubmitEditing={handlePost}
              />
            </View>
          </View>
          {/* For the public/private toggle from DeepSeek */}
          <View style={styles.visibilityContainer}>
            <Text style={isDarkMode ? styles.darkVisibilityText : styles.visibilityText}>
              {isPublic ? '🌍 Public' : '🔒 Private (Friends Only)'}
            </Text>
            <TouchableOpacity 
              onPress={() => setIsPublic(!isPublic)}
              testID="visibility-toggle"  // DeepSeek - for test
              style={styles.toggleButton}
            >
              <Ionicons 
                name={isPublic ? "toggle" : "toggle-outline"} 
                size={24} 
                color={isDarkMode ? "#21BFBF" : "#21BFBF"} 
              />
            </TouchableOpacity>
          </View>
          {/* remove {display: "none"} to see the media buttons again (to be implemented) */}
          <View style={(styles.mediaButtonsContainer, { display: "none" })}>
            <TouchableOpacity style={styles.mediaButton}>
              <MaterialIcons name="photo" size={24} color="#21BFBF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton}>
              <MaterialIcons name="camera-alt" size={24} color="#21BFBF" />
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    overflow: "hidden",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginHorizontal: 30,
  },
  darkTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginHorizontal: 30,
    color: 'white'
  },
  cancelButton: {
    width: 80,
    padding: 4,
    flex: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#000",
  },
  darkCancelButtonText: {
    fontSize: 16,
    color: "white",
  },
  shareButton: {
    width: "20%",
    paddingVertical: 5,
    // paddingHorizontal: 8,
    borderRadius: 25,
    backgroundColor: "#21BFBF",
    justifyContent: "center",
    alignItems: "center",
    // flex: 1,
  },
  shareButtonText: {
    color: "white",
    fontWeight: "400",
    fontSize: 16,
    letterSpacing: 0.1,
    lineHeight: 24,
  },
  shareButtonDisabled: {
    opacity: 0.5,
    // backgroundColor: '#03B7B7'
  },
  mainContent: {
    flexShrink: 1,
  },
  userInfoContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingTop: 0,
    minHeight: 230,
    maxHeight: 230,
  },
  darkInput: {
    flex: 1,
    fontSize: 16,
    paddingTop: 0,
    minHeight: 230,
    maxHeight: 230,
    color: 'white'
  },
  mediaButtonsContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  mediaButton: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  //from DeepSeek for private/public toggle
  visibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  visibilityText: {
    fontSize: 16,
    color: '#000',
  },
  darkVisibilityText: {
    fontSize: 16,
    color: 'white',
  },
  toggleButton: {
    padding: 8,
  },
});

export default CreatePostSheet;
