import React, {
  useRef,
  useState,
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
import { MaterialIcons } from "@expo/vector-icons";
import { useSocialFeed } from "@/context/SocialFeedContext";
import ProfileImage from "../../../assets/images/profile/Profile.png";
import { TextInput } from "react-native";

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

    const handlePost = async () => {
      if (postText.trim()) {
        await addPost(postText);
        setPostText("");
        Keyboard.dismiss();
        bottomSheetRef.current?.close();
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
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>New Post</Text>
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
                style={styles.input}
                multiline
                placeholder="What's happening?"
                value={postText}
                onChangeText={setPostText}
                autoFocus={false}
                scrollEnabled={true}
                onSubmitEditing={handlePost}
              />
            </View>
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
  cancelButton: {
    width: 80,
    padding: 4,
    flex: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#000",
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
});

export default CreatePostSheet;
