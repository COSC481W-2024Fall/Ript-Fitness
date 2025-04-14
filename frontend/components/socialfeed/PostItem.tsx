import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { GlobalContext } from "@/context/GlobalContext";
import { useSocialFeed } from "@/context/SocialFeedContext";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers,
} from "react-native-popup-menu";

type PostItemType = {
  id: string;
  type: "text" | "image";
  content?: string;
  imageUrl?: string;
  caption?: string;
  user: {
    name: string;
    profilePicture: any;
    id?: string;
  };
  dateTimeCreated: string;
  likes: string[];
  numberOfLikes: number;
  comments: Array<{
    id: string;
    content: string;
    postId: string;
    accountId: string;
    dateTimeCreated: string;
  }>;
  userProfile?: {
    id?: string;
    username?: string;
  } | null;
};

type ItemProps = {
  item: PostItemType;
  isPublic: boolean; // DeepSeek
  liked: boolean;
  onLikePress: () => void;
  onCommentPress: () => void;
};

const formatTimestamp = (dateTimeCreated: string): string => {
  const cleanedTimestamp = dateTimeCreated.split(".")[0].replace("T", " ");
  const date = new Date(cleanedTimestamp);

  if (isNaN(date.getTime())) {
    console.warn("Invalid date:", dateTimeCreated);
    return "Invalid Date";
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};

const PostItem = ({ item, liked, onLikePress, onCommentPress }: ItemProps) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { deletePost } = useSocialFeed();
  const context = useContext(GlobalContext);
  const isDarkMode = context?.isDarkMode;

  const currentUserID = context?.userProfile.id;
  const isOwner = currentUserID === item.userProfile?.id;

  const handleDeletePost = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deletePost(item.id),
        },
      ],
      { cancelable: true }
    );
  };

  const handleUsernamePress = () => {
    const userProfile = item.userProfile;

    if (!userProfile || !userProfile.id) {
      console.log("Navigation failed: No userProfile available", { item });
      return;
    }

    navigation.navigate("VisitProfileScreen", { item: userProfile });
  };

  const handlePostPress = () => {
    if (item.type === "text") {
      navigation.navigate("TextPostScreen", {
        postId: item.id,
        content: item.content,
      });
    } else if (item.type === "image") {
      navigation.navigate("ImagePostScreen", {
        postId: item.id,
        imageUrl: item.imageUrl,
      });
    }
  };

  return (
    <View style={isDarkMode? styles.darkItem:styles.item}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleUsernamePress} style={styles.header}>
          <Image style={styles.profile} source={item.user.profilePicture} />
          <Text style={isDarkMode? styles.darkUsername:styles.username}>{item.user.name}</Text>
        </TouchableOpacity>
        {/* MENU SECTION - Moved to top right */}
        <View style={styles.menuContainer}>
          <Menu>
            <MenuTrigger customStyles={menuTriggerStyles}>
              <MaterialCommunityIcons
                name="dots-horizontal"
                color={isDarkMode? 'lightgray':"#B1B6C0"}
                size={23}
              />
            </MenuTrigger>
            <MenuOptions customStyles={menuOptionsStyles}>
              {isOwner ? (
                <MenuOption
                  onSelect={handleDeletePost}
                  customStyles={menuOptionStyles}
                >
                  <Text style={styles.deleteText}>Delete Post</Text>
                </MenuOption>
              ) : (
                <MenuOption disabled customStyles={menuOptionStyles}>
                  <Text style={{ color: "#999" }}>No options available</Text>
                </MenuOption>
              )}
            </MenuOptions>
          </Menu>
        </View>
      </View>

      {/* Rest of the post content */}
      {item.type === "text" && item.content && (
        <Text style={isDarkMode? styles.darkContentText:styles.contentText}>{item.content}</Text>
      )}
      {item.type === "image" && item.imageUrl && (
        <TouchableOpacity onPress={handlePostPress}>
          <Image style={styles.postImage} source={{ uri: item.imageUrl }} />
        </TouchableOpacity>
      )}
      {item.type === "image" && item.caption && (
        <Text style={styles.caption}>{item.caption}</Text>
      )}

      <View style={styles.footer}>
        <View style={styles.likecomment}>
          <TouchableOpacity
            onPress={onLikePress}
            style={styles.likeButton}
            accessibilityLabel="Like post"
            accessibilityHint="Toggles the like state for this post"
          >
            <Ionicons
              name="heart"
              size={24}
              color={liked ? "#FF3B30" : "#B1B6C0"}
            />
          </TouchableOpacity>
          <Text style={isDarkMode? styles.darkLikeCounter:styles.likeCounter}>{item.numberOfLikes}</Text>

          <TouchableOpacity
            onPress={onCommentPress}
            style={styles.commentButton}
            accessibilityLabel="Open comments"
            accessibilityHint="Opens the comments for this post"
          >
            <Ionicons name="chatbubble" color="#B1B6C0" size={23} />
          </TouchableOpacity>
          <Text style={isDarkMode? styles.darkCommentCounter:styles.commentCounter}>
            {item.comments.filter((comment) => !comment.isDeleted).length}
          </Text>
        </View>
        <Text style={styles.timestamp}>{item.dateTimeCreated}</Text>
      </View>
    </View>
  );
};

const menuTriggerStyles = {
  triggerWrapper: {
    // transform: [{ translateX: -20 }],
    marginLeft: -40,
  },
};

const menuOptionsStyles = {
  optionsContainer: {
    width: 200,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionsWrapper: {
    backgroundColor: "white",
  },
};

const menuOptionStyles = {
  optionWrapper: {
    padding: 10,
    backgroundColor: "white",
  },
  optionText: {
    color: "black",
  },
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: "#fff",
    borderColor: "#B1B6C0",
    borderWidth: 1,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  darkItem: {
    backgroundColor: "#333333",
    borderWidth: 1,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  username: {
    flex: 1,
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "left",
    marginLeft: 7,
  },
  darkUsername: {
    flex: 1,
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "left",
    marginLeft: 7,
    color: 'white'
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  contentText: {
    fontSize: 16,
    marginTop: 5,
    lineHeight: 22,
  },
  darkContentText: {
    fontSize: 16,
    marginTop: 5,
    lineHeight: 22,
    color: 'white'
  },
  postImage: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 10,
    resizeMode: "cover",
  },
  caption: {
    fontSize: 16,
    marginTop: 5,
    lineHeight: 22,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  timestamp: {
    fontSize: 13,
    color: "#999",
    alignSelf: "flex-end",
  },
  likeButton: {
    // padding: 7,
    borderRadius: 10,
  },
  commentButton: {
    paddingLeft: 7,
    borderRadius: 10,
  },
  likecomment: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: 'red',

  },
  likeCounter: {
    color: "black",
    padding: 7,
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 30,
  },
  darkLikeCounter: {
    color: "white",
    padding: 7,
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 30,
  },
  commentCounter: {
    color: "black",
    padding: 7,
    fontSize: 16,
    fontWeight: "bold",
  },
  darkCommentCounter: {
    color: "white",
    padding: 7,
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteText: {
    color: "red",
    padding: 10,
    fontSize: 16,
  },
  menuContainer: {
    marginRight: -10, // Adjust this value to fine-tune
  },
  //from DeepSeek
  visibilityBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  visibilityText: {
    fontSize: 12,
    color: '#999',
  },
});

export default PostItem;
