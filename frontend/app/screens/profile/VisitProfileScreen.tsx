// OtherUserProfileScreen.tsx

import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from "expo-haptics";
import { User, UserCheck, UserMinus, UserPlus } from "react-native-feather";
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { FriendObject, GlobalContext, ProfileObject } from '@/context/GlobalContext';
import { httpRequests } from '@/api/httpRequests';
import { ProfileScreenNavigationProp } from '@/app/(tabs)/ProfileStack';
import { ProfileContext } from '@/context/ProfileContext';
import DEFAULT_PROFILE_PICTURE from '@/assets/base64/defaultPicture';
import TimeZone from '@/api/timeZone';

const Tab = createMaterialTopTabNavigator();

interface Post {
  numberOfLikes: number;
  dateTimeCreated: string;
  content: string;
  // Add other fields as needed
}


const VisitProfileScreen: React.FC = () => {
  const context = useContext(GlobalContext);
  const profContext = useContext(ProfileContext)
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute();

  // Assume that the other user's profile data is passed via navigation params
  const { item } = route.params as any;


  const [addingFriend, setAddingFriend] = useState(false);
  const [DeletingFriend, setDeletingFriend] = useState(false);
  const [friends, setFriends] = useState<FriendObject[]>([]);
  const [loaded, setLoaded] = useState(false)

  const updateFriends = (newFriends: FriendObject[]) => {
    setFriends((prevFriends) => 
      newFriends.map((newFriend, index) => {
        const prevFriend = prevFriends[index] || {}; // Get the corresponding previous friend or an empty object
        return {
          ...prevFriend,
          ...newFriend,
          profilePicture: (newFriend.profilePicture == undefined || newFriend.profilePicture == "")
            ? DEFAULT_PROFILE_PICTURE
            : newFriend.profilePicture,
        };
      })
    );
  };

  const reloadFriends = async () => {
    try {
      const response = await fetch(`${httpRequests.getBaseURL()}/friends/getFriendsList/${item.id}`, {
        method: 'GET', // Set method to POST
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
          "Authorization": `Bearer ${context?.data.token}`,
        },
        body: "", // Convert the data to a JSON string
      }); // Use endpoint or replace with BASE_URL if needed
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const friendNames = await response.json()
            try {
  
  
              const response = await fetch(`${httpRequests.getBaseURL()}/userProfile/getUserProfilesFromList`, {
                method: 'POST', // Set method to POST
                headers: {
                  'Content-Type': 'application/json', // Set content type to JSON
                  "Authorization": `Bearer ${context?.data.token}`,
                },
                body: JSON.stringify(friendNames), // Convert the data to a JSON string
              }); // Use endpoint or replace with BASE_URL if needed
              if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
              }
              const json = await response.json()
              updateFriends(json)
          
            } catch (error) {
              // If access denied
              // Send to login page
              //setToken("")
              console.error('0004 GET request failed:', error);
              throw error; // Throw the error for further handling if needed
            }
  
    } catch (error) {
      // If access denied
      // Send to login page
      //setToken("")
      console.error('0003 GET request failed:', error);
      throw error; // Throw the error for further handling if needed
    }
  }

  const handleAddFriend = async () => {
    if (addingFriend) return;

    setAddingFriend(true);
    try {
        context?.addFriend(item)
      const response = await fetch(
        `${httpRequests.getBaseURL()}/friends/addFriend/${item.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${context?.data.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      // Optionally, update the UI or state to reflect the friend request
      // For example, disable the "Add Friend" button or change its text
    } catch (error) {
        context?.removeFriend(item) //failed to add friend, remove from local data
      console.error('Error adding friend:', error);
    } finally {
      setAddingFriend(false);
    }
  };

  const handleDeleteFriend = async () => {
    if (DeletingFriend) return;

    setDeletingFriend(true);
    try {
    context?.removeFriend(item)
      const response = await fetch(
        `${httpRequests.getBaseURL()}/friends/deleteFriend/${item.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${context?.data.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Optionally, update the UI or state to reflect the friend request
      // For example, disable the "Add Friend" button or change its text
    } catch (error) {
        context?.addFriend(item)  //failed to remove friend, add back to local data
      console.error('Error adding friend:', error);
    } finally {
      setDeletingFriend(false);
    }
  };


  if (!item) {
    // Show a loading indicator while fetching the profile
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  const goBack = () => {
    navigation.goBack()
  }

  const load = async () => {
    await reloadFriends();
    setLoaded(true);
  }

  if (!loaded) {
    load();
  }
  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
  <TouchableOpacity
    onPress={goBack}
    style={styles.backButton}
  >
    <Ionicons name="arrow-back" size={24} color="#000" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>{item.username}</Text>
</View>
<View style={styles.headerBorder}></View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{uri: `data:image/png;base64,${item.profilePicture}` }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{item.displayname}</Text>
        <View style={styles.bioStyle}><TouchableOpacity 
        onPress={() => {
            if (item) {
              navigation.navigate('FullBioScreen', { userProfile: item });
            } else {
              console.error('User profile is undefined.');
            }
          }}>
            
            <Text style={styles.bio}>
  {item.bio != null
    ? `${(item.bio.split('\n')[0] || '').slice(0, 50)}`
    : ''}

{item.bio && (item.bio.length > item.bio.split('\n')[0].length || item.bio.split('\n')[0].length > 50)  ? <Text style={{ color: '#757575', fontWeight: 600 }}>{'...View more'}</Text> : <></>}
</Text>

</TouchableOpacity>

</View>
<View style={styles.friendsContainer}>
<View style={styles.friendsSection}>
<View style={styles.friendsList}>
                  {friends.length === 0 ? (
                    // Render "Add Friend" button when there are no friends
                    (loaded? <></> : <View><ActivityIndicator size="small" /></View>)
                  ) : (
                    // Render the FlatList if there are friends
                    <View>
                      <TouchableOpacity
                        style={styles.addFriendButtonOverlay}
                        onPress={() => navigation.navigate('VisitFriendsScreen', {friends : friends})}
                      >
                        <FlatList
                          horizontal
                          data={friends.slice(0, 4)} // Display only the first 4 friends
                          keyExtractor={(_, index) => index.toString()} // Use index as the key
                          renderItem={({ item, index }) => (
                            <Image
                              source={{ uri: `data:image/png;base64,${item.profilePicture}` }}
                              style={[styles.friendAvatar, { zIndex: 5 - index }]}
                            />
                          )}
                          ListFooterComponent={
                            friends.length > 4 ? (
                              <View style={[styles.moreFriends, { marginLeft: -15 }]}>
                                <Text style={styles.moreFriendsText}>
                                  +{friends.length - 4}
                                </Text>
                              </View>
                            ) : null
                          }
                          showsHorizontalScrollIndicator={false}
                          ItemSeparatorComponent={() => <View style={{ width: 0, marginLeft: -15 }} />}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                </View>
                </View>

        {/* Add Friend Button */}
        <TouchableOpacity style={[
    styles.addFriendButton,
            (context?.friends.some(friend => friend.username === item.username)
            ? styles.friendButton
            : styles.addFriendButtonStyle),


    (addingFriend || 
     context?.friends.some(friend => friend.username === item.username) || 
     profContext?.sentFriendRequests.includes(item.username)) && 
    styles.disabledButton
  ]}
            onPress={() => {
    if (addingFriend) {
      // Do nothing or show a loading indicator
    } else if (context?.friends.some(friend => friend.username === item.username)) {
      // Remove friend action
      handleDeleteFriend();
    } else if (profContext?.sentFriendRequests.includes(item.username)) {
      // Do nothing, request is pending
    } else {
      // Add friend action
      handleAddFriend();
    }
  }}
         disabled={addingFriend || profContext?.sentFriendRequests.includes(item.username)}
        >

  {context?.friends.some(friend => friend.username === item.username) ? (
          <UserCheck stroke={'#1D1B20'} strokeWidth={2.5} width={18} height={18} />
        ) : (
          profContext?.sentFriendRequests.includes(item.username) ?  <UserCheck stroke={'#1D1B20'} strokeWidth={2.5} width={18} height={18} /> :<UserPlus stroke={'#fff'} strokeWidth={2.5} width={18} height={18} /> 
        )}
          {/* <UserCheck stroke={'#1D1B20'} strokeWidth={2.5} width={18} height={18} /> */}
          <Text 
            // style={styles.addFriendButtonText}
            style={[
              styles.addFriendButtonText,
              (context?.friends.some(friend => friend.username === item.username) || profContext?.sentFriendRequests.includes(item.username))
                ? styles.friendButtonText
                : styles.addFriendButtonTextStyle,
            ]}
          >
               {addingFriend
      ? 'Adding...'
      : context?.friends.some(friend => friend.username === item.username)
      ? 'Friends'
      : profContext?.sentFriendRequests.includes(item.username)
      ? 'Requested'
      : 'Add Friend'}
          </Text>
        </TouchableOpacity>


 

      </View>

      {true ? (
          <PostsScreen
          userId={item.id}
          userProfile={item}
        />
) : null}
</View>
  );
};


const PostsScreen: React.FC<any> = ({
  userId,
  userProfile,
}) => { const [requested, setRequested] = useState(false);
  const [returned, setReturned] = useState(false);

  const [postIds, setPostIds] = useState<number[]>([]); // Explicitly define type as number[]
  const [posts, setPosts] = useState<Post[]>([]);

  const context = useContext(GlobalContext);
  const profContext = useContext(ProfileContext);

  const [refreshing, setRefreshing] = React.useState(false);

  const [loadingMore, setLoadingMore] = useState(false);

  const [postsPerLoad, setPostsPerLoad] = useState(9);

  const [AllPostsLoaded, setAllPostsLoaded] = useState(false);

  let [currentEndIndex, setCurrentEndIndex] = useState(postsPerLoad);

  interface Post {
    numberOfLikes: number;
    dateTimeCreated: string;
    id: string;
    content: string;
    userProfile: ProfileObject;
    userIDsOfLikes: number[];
  }


  interface likeHandler {
    PostId: string,
    PendingAction: Number,
    PendingTimer: NodeJS.Timeout,
    OriginalState: Number,
  }
  const likeHandlers = useRef<likeHandler[]>([])

  const fetchPostList = async (startIndex: number, endIndex: number, clear: boolean = true) => {
    try {
      const response = await fetch(
        `${httpRequests.getBaseURL()}/socialPost/getPostsFromAccountId/${userProfile.id}/${startIndex}/${endIndex}`,
        {
          method: 'GET', // Set method to POST
          headers: {
            'Content-Type': 'application/json', // Set content type to JSON
            Authorization: `Bearer ${context?.data.token}`,
          },
          body: '', // Convert the data to a JSON string
        }
      ); // Use endpoint or replace with BASE_URL if needed
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const json = await response.json(); //.json(); // Parse the response as JSON
      if (clear) {
        setPosts(json);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...json]);
      }
      setReturned(true);
      return json; // Return the JSON data directly
    } catch (error) {
      setReturned(true);
      setLoadingMore(false);
      setAllPostsLoaded(true);
      // If access denied
      // Send to login page

      //console.error('GET request failed:', error);
      //throw error; // Throw the error for further handling if needed
    }
  };

  if (!requested) {
    setRequested(true);
    //fetchPostList(0, currentEndIndex);
  }

  const pushLikeAction = async (handler: likeHandler)  => {
    let success = true;
    try {
    if (handler.PendingAction == 1) {
      //        /socialPost/addLike/122
        const response = await fetch(
          `${httpRequests.getBaseURL()}/socialPost/addLike/${handler.PostId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${context?.data.token}`,
            },
            body: ``,
          }
        );
        if (!response.ok) {
          //console.error("Failed to update profile.");
          console.log(await response.text())
        }




    } else if (handler.PendingAction == -1) {
      //      /socialPost/deleteLike/122
        const response = await fetch(
          `${httpRequests.getBaseURL()}/socialPost/deleteLike/${handler.PostId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${context?.data.token}`,
            },
            body: ``,
          }
        );
        if (!response.ok) {
          console.error("Failed to update profile.");
        }
    }
  } catch (error) {
    success = false
  } finally {
    let likeOrDislike = handler.PendingAction
    if (!success) {
      likeOrDislike = handler.OriginalState
    }
    const post = posts.find(p => p.id === handler.PostId);
    if (post && context) {
      const index = post.userIDsOfLikes.indexOf(Number(context.userProfile.id));
      if (!success && likeOrDislike == -1 && index !== -1) {
        // If userId is found, remove it
        post.userIDsOfLikes.splice(index, 1);
      } else if (!success && likeOrDislike == 1 && index == -1){
        // If userId is not found, add it back in
        post.userIDsOfLikes.push(Number(context.userProfile.id));
      }
      likeHandlers.current = likeHandlers.current.filter(h => h !== handler);
  }
}
  }



  const [refreshKey, setRefreshKey] = useState(0)
  function createTimer(duration: number, callback: () => void): NodeJS.Timeout {
    // duration is in milliseconds
    // callback will run after the timer finishes
    const timer = setTimeout(() => {
      callback();
    }, duration);
  
    return timer; // You can store or clear this timeout later if needed
  }

  React.useEffect(() => {
    if (refreshKey != 0)
      setRefreshKey(0)
  }, [refreshKey, likeHandlers]);

  const toggleLike = async (post: Post) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);

    if (context) {
      const userId = Number(context.userProfile.id);
      const action = post.userIDsOfLikes.includes(userId) ? -1 : 1;
      const originalAction = post.userIDsOfLikes.includes(Number(context.userProfile.id)) ? 1 : -1
        if (post.userIDsOfLikes.includes(userId)) {
          const index = post.userIDsOfLikes.indexOf(userId);
          if (index !== -1) {
            post.userIDsOfLikes.splice(index, 1);
          }
        } else {
          post.userIDsOfLikes.push(userId);
        }
      const foundHandler = likeHandlers.current.find(handler => handler.PostId === post.id);
      if (foundHandler) {
        if (foundHandler.PendingAction == 1) {
          foundHandler.PendingAction = -1
          

          clearTimeout(foundHandler.PendingTimer);

          // Now create a fresh timer with a new duration and callback
          foundHandler.PendingTimer = createTimer(2000, () => pushLikeAction(foundHandler));
        } else if (foundHandler.PendingAction == -1) {
          foundHandler.PendingAction = 1

          clearTimeout(foundHandler.PendingTimer);

          // Now create a fresh timer with a new duration and callback
          foundHandler.PendingTimer = createTimer(2000, () => pushLikeAction(foundHandler));
        }
      } else {
        console.log("no handler")
        const newHandler: likeHandler = {
          PostId: post.id,            // Replace with your desired post ID
          PendingAction: action,       // Replace with the initial PendingAction
          PendingTimer: createTimer(2000, () => pushLikeAction(newHandler)), // Replace with the timer object or reference
          OriginalState: originalAction,
        } as likeHandler;
        
        likeHandlers.current = [...likeHandlers.current, newHandler];
      }
      setRefreshKey(1)
    }
  }

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true, // converts to 12 hour format
    });
  };

  const waitForLikeHandlersEmpty = async (): Promise<void> =>  {
    return new Promise((resolve) => {
      const checkIfEmpty = () => {
        // Check if likeHandlers is empty
        console.log(likeHandlers.current.length)
        if (likeHandlers.current.length === 0) {
          console.log("empty now")
          resolve();
        } else {
          // If not empty, check again after a short delay
          setTimeout(checkIfEmpty, 50);
        }
      };
  
      checkIfEmpty();
    });
  }

  const refreshPosts = async () => {
    setRefreshing(true);
    await waitForLikeHandlersEmpty()
    setLoadingMore(false);
    setAllPostsLoaded(false);
    //setLikeHandlers([])
    await setCurrentEndIndex(postsPerLoad);
    await fetchPostList(0, postsPerLoad, true);
    setTimeout(() => {
      setRefreshing(false);
    }, 0);
  }
  const onRefresh = React.useCallback(refreshPosts, []);

  useFocusEffect(
    useCallback(() => {
      refreshPosts()
      context?.reloadFriends();
      return () => {};
    }, [])
  );

  const renderPostItem = ({ item: post }: { item: Post }) => (
    <View style={styles.postItem}>
      <Image
        source={{
          uri: `data:image/png;base64,${
            post.userProfile.profilePicture == '' || post.userProfile.profilePicture == null
              ? DEFAULT_PROFILE_PICTURE
              : post.userProfile.profilePicture
          }`,
        }}
        style={styles.postAvatar}
      />
      <View style={styles.postContent}>
        <Text style={styles.postText}>{post.content}</Text>
        <View style={styles.postFooter}>
          <TouchableOpacity style={styles.likeCommentContainer} onPress={() => {toggleLike(post)}}>
            <Ionicons name="heart" size={24} color={post.userIDsOfLikes.includes(Number(context?.userProfile.id)) ? "#FF3B30" : "#B1B6C0"} />
            <Text style={styles.likeCounter}>{post.userIDsOfLikes.length}</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>{TimeZone.convertToTimeZone(post.dateTimeCreated, TimeZone.get())}</Text>
        </View>
      </View>
    </View>
  );

  const handleLoadMore = async () => {
    if (returned && !loadingMore && !AllPostsLoaded) {
      setLoadingMore(true);
      let start = currentEndIndex + 1;
      await fetchPostList(start, currentEndIndex + postsPerLoad, false);
      setCurrentEndIndex(currentEndIndex + postsPerLoad);
      setLoadingMore(false);
      // Fetch or load more data here
    }
  };

  const renderFooter = () => {
    if (!returned || loadingMore) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    } else {
      return null;
    }

  };

  // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
  return (
    <View style={styles.postView}>
      {true ? (
        <FlatList
          data={posts}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderPostItem}
          //contentContainerStyle={styles.postsContainer} // Optional, to style the FlatList container
          contentContainerStyle={{
            alignItems: 'center',
            paddingTop: 10,
            backgroundColor: '#fff',
          }}
          ListEmptyComponent={
            returned ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No posts available</Text>
                <Text style={styles.emptyEmoji}>😔</Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          //columnWrapperStyle={{ padding: 0, margin: 0 }}
        />
      ) : (
        <ActivityIndicator size="large" color="#40bcbc" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    bioStyle: {
        flexDirection:'row'
      },
  container: {
    paddingTop:5,
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendsContainer: { },
  friendsSection: { flexDirection: 'row', marginTop: 10},
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
    flex:1
  },
  emptyText: {
    fontSize: 20,
    color: "#999",
    margin: 7,
  },
  emptyEmoji: {
    fontSize: 48,
    color: "#999",
    margin: 7,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
    // Positioning the header at the top
    position: 'relative',
    zIndex: 10,
    marginTop: Platform.OS === "ios" ? '10%' : 0
  },
  disabledButton: {
    backgroundColor: "#EDEDED", // Light grey
  },
    headerBorder: {
        borderBottomWidth:1,
        borderColor:'grey',
        opacity:0.5,
        marginBottom:5,
    },
    backButton: {
      position: 'absolute',
      left: 10, 
      padding: 10,
      zIndex:10,
    },
    headerTitle: {
      fontSize: 18, 
      fontWeight: 'bold',
      textAlign: 'center',
    },

  


  profileSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  bioContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bio: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 7,
    marginBottom: 10,
  },
  addFriendButtonStyle: {
    backgroundColor: '#21BFBF',
  },
  friendButton: {
    backgroundColor: '#EDEDED', 
  },
  friendButtonText: {
    color: '#1D1B20'
  },
  addFriendButtonTextStyle: {
    color: '#fff'
  },
  addFriendButtonText: {
    color: '#1D1B20',
    fontWeight: 600,
    fontSize: 14,
    marginLeft: 5,
  },
  tabContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  postView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  postItem: {
    marginBottom: 10,
    width: '90%',
    minHeight: 80,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    flexDirection: 'row',
  },
  postAvatar: {
    width: 60,
    height: 60,
    marginLeft: 10,
    marginTop: 10,
    borderRadius: 30,
    marginRight: 10,
  },
  postContent: {
    paddingTop: 15,
    flex: 1,
  },
  postText: {
    fontSize: 16,
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    bottom: 0,
  },
  likeCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCounter: {
    color: 'black',
    padding: 7,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    marginRight: 15,
  },
  addFriendContainer: {
    marginBottom: 5
  },
  addFriendButtonOverlay: {
    margin: 0,
    padding: 0,
  },
  moreFriendsText: { color: '#757575' },
  friendsList: {alignContent:'center'},
  friendAvatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 5, borderWidth: 1.5, borderColor: '#fff' },
  moreFriends: {
    width: 40,
    height: 40,
    zIndex: 0,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: '#e9e8e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VisitProfileScreen;
