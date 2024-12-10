import React, { Component, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  Platform,
} from 'react-native';
import * as Haptics from "expo-haptics";
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView } from 'react-native-gesture-handler';
import { DrawerActions, NavigationContainer, useFocusEffect, useNavigation } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { httpRequests } from '@/api/httpRequests';
import { GlobalContext, ProfileObject } from '@/context/GlobalContext';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ProfileScreenNavigationProp } from '../../(tabs)/ProfileStack';
import GraphScreen from './GraphScreen';
import { ProfileContext } from '@/context/ProfileContext';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DEFAULT_PROFILE_PICTURE from '@/assets/base64/defaultPicture';
import timeZone from '@/api/timeZone'
import TimeZone from '@/api/timeZone';
import { Timer } from 'victory';

const Tab = createMaterialTopTabNavigator();
const Drawer = createDrawerNavigator();

function getDateRange() {
  // Get the current date
  const currentDate = new Date();

  // Set endYear and endMonth to the current year and month
  const endYear = currentDate.getFullYear();
  const endMonth = currentDate.getMonth() + 1; // getMonth() is zero-based

  // Calculate last month's date
  const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 4, 1);

  // Set startYear and startMonth to the year and month of last month
  const startYear = lastMonthDate.getFullYear();
  const startMonth = lastMonthDate.getMonth() + 1; // Adjust for zero-based month

  // Return the results
  return { startYear, startMonth, endYear, endMonth };
}
const printImageDimensions = (uri : any) => {
  Image.getSize(
    uri,
    (width, height) => {
      console.log(`Image Dimensions: ${width} x ${height}`);
    },
    (error) => {
      console.error('Error getting image dimensions:', error);
    }
  );
};

const uploadPhoto = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photo library.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;

      console.log('Selected Image URI: ', imageUri);

      printImageDimensions(imageUri)
      // Create FormData object
      const resizedUri = await resizeImage(imageUri, 1080)

      printImageDimensions(resizedUri)

      const timestamp = Date.now(); // Current timestamp in milliseconds
      const dynamicFileName = `photo-${timestamp}.jpg`;

      const formData = new FormData();

      formData.append('file', {
        uri: resizedUri,
        name: dynamicFileName, // You can use a dynamic name if needed
        type: 'image/jpeg', // Adjust based on the selected file's format
      } as any);

      return formData;
    }
  } catch (error) {
    console.error('Error picking image:', error);
  }

  return null; // Return null if an error occurs or no image is selected
};


const resizeImage = async (uri: string, maxDimension: number): Promise<string> => {
  try {
    // Get original image dimensions
    const { width: originalWidth, height: originalHeight } = await new Promise<{width: number, height: number}>((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        (error) => reject(error)
      );
    });

    // Calculate the scaling factor to maintain aspect ratio
    let newWidth;
    let newHeight;

    if (originalWidth > originalHeight) {
      newWidth = maxDimension;
      newHeight = Math.round((originalHeight / originalWidth) * maxDimension);
    } else {
      newHeight = maxDimension;
      newWidth = Math.round((originalWidth / originalHeight) * maxDimension);
    }

    console.log('Resized Dimensions:', newWidth, 'x', newHeight);

    // Resize and compress the image
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: newWidth, height: newHeight } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    return result.uri;
  } catch (error) {
    console.error('Error resizing image:', error);
    throw error;
  }
};
const ProfileTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarIndicatorStyle: { backgroundColor: '#40bcbc', height: '100%' }, // Customize the active tab indicator color
        tabBarLabelStyle: { fontWeight: 'bold' },
        tabBarStyle: {
          overflow: 'hidden',
          alignSelf: 'center',
          backgroundColor: 'white',
          width: '80%',
          borderColor: '#40bcbc',
          borderRadius: 50,
          borderWidth: 2,
          marginBottom: 10,
        }, // Tab bar background
        tabBarIndicatorContainerStyle: {},
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#40bcbc',
        tabBarScrollEnabled: false,
      }}
      style={styles.nav}
    >
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Photos" component={PhotosScreen} />
      <Tab.Screen name="Posts" component={PostsScreen} />
    </Tab.Navigator>
  );
};

function PhotosScreen() {
  const context = useContext(GlobalContext);
  const navigation = useNavigation<ProfileScreenNavigationProp>()





  const [requested, setRequested] = useState(false);
  const [returned, setReturned] = useState(false);

  const [photos, setPhotos] = useState<string[]>([]);

  const profContext = useContext(ProfileContext);

  const [refreshing, setRefreshing] = React.useState(false);

  const [loadingMore, setLoadingMore] = useState(false);

  const [photosPerLoad, setPhotosPerLoad] = useState(14);

  const [allPhotosLoaded, setAllPhotosLoaded] = useState(false);

  let [currentEndIndex, setCurrentEndIndex] = useState(photosPerLoad);


  const refreshPhotos = async () => {
    setRefreshing(true);
    setLoadingMore(false);
    setAllPhotosLoaded(false);
    await setCurrentEndIndex(photosPerLoad);
    await fetchPhotosList(0, photosPerLoad);
    setTimeout(() => {
      setRefreshing(false);
    }, 0);
  }


  const fetchPhotosList = async (startIndex: number, endIndex: number, clear: boolean = true) => {
    console.log(startIndex, " ", endIndex)
    try {
      const response = await fetch(
        `${httpRequests.getBaseURL()}/userProfile/photos?startIndex=${startIndex}&endIndex=${endIndex}`,
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
        setPhotos(json);
      } else {
        console.log(json.length())
        setPhotos((prevPhotos) => [...prevPhotos, ...json]);
      }
      return json; // Return the JSON data directly
    } catch (error) {
      setAllPhotosLoaded(true);
      // If access denied
      // Send to login page

      //console.error('GET request failed:', error);
      //throw error; // Throw the error for further handling if needed
    } finally {
      setReturned(true);
      setLoadingMore(false);
      
    }
  };

  if (!requested) {
    setRequested(true);
    refreshPhotos();
    //fetchPostList(0, currentEndIndex);
  }

  const handlePhoto = async () => {
    const formData = await uploadPhoto();
    if (formData) {
      try {
        setPhotos((prevPhotos) => [
          "Loading",
          ...prevPhotos,
        ]);
        console.log(`${httpRequests.getBaseURL()}/userProfile/photo`);
        const response = await fetch(`${httpRequests.getBaseURL()}/userProfile/photo`, {
          method: 'POST', // Set method to POST
          headers: {
            Authorization: `Bearer ${context?.data.token}`,
          },
          body: formData, // Convert the data to a JSON string
        }); // Use endpoint or replace with BASE_URL if needed
        if (!response.ok) {
          const text = await response.text();
          console.log(text);
          throw new Error(`Error: ${response.status}`);
        }
        const json = await response.text();
        await refreshPhotos();
        //console.log(json);
      } catch (error) {
        console.error(error);
      }
      // setSelectedImage(base64Image);
    }
  };

  const handleDeleteImage = async (uri : any) => {
    // Find the photo to delete
    const photoToDelete = photos.find((photo) => photo === uri);
    if (!photoToDelete) {
      console.error('Photo not found');
      return;
    }

    try {
      // Construct the endpoint URL

      const endpoint = `${httpRequests.getBaseURL()}/userProfile/deletePhoto?photoUrl=${photoToDelete}`;
      // Send the DELETE request
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${context?.data.token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Error deleting photo:', text);
        throw new Error(`Error: ${response.status}`);
      }

      // Update the state to remove the deleted photo
      setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo !== uri));

      console.log('Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };
  const renderFooter = () => {
    if (!returned || loadingMore) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator size="large" />
        </View>
      );
    } else {
      return null;
    }

  };

  const handleLoadMore = async () => {
    if (returned && !loadingMore && !allPhotosLoaded) {
      setLoadingMore(true);
      let start = currentEndIndex + 1;
      await fetchPhotosList(start, currentEndIndex + photosPerLoad, false);
      setCurrentEndIndex(currentEndIndex + photosPerLoad);
      // Fetch or load more data here
    }
  };

  const renderItem = ({ item } : any) => {
    if (item == 'Loading') {
      // Render the loading indicator
      return (
        <View style={[styles.photo, {justifyContent:'center'}]}>
          <ActivityIndicator size="large" />
        </View>
      );
    } else {
      // Render the photo
      return <TouchableOpacity onPress={() =>
        navigation.navigate('ImageFullScreen', {
          imageUri: item,
          onDelete: () => handleDeleteImage(item),
        })
      }><Image source={{ uri: item }} style={styles.photo} /></TouchableOpacity>;
    }
  };

  
  return (

    <View style={{width:'100%', flex:1, backgroundColor:'#fff'}}>
      <TouchableOpacity style={styles.addPhotoButton} onPress={handlePhoto}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
<View style={styles.photosContainer}>
  {photos.length > 0 ? <></>: <View style={{width:'100%', height:'80%', justifyContent:'center'}}><Text style={{textAlign:'center'}}>Add your first photo! These photos are private.</Text></View>}
<FlatList
  data={photos}
  keyExtractor={(item, index) => index.toString()}
  numColumns={3} // Adjust the number of columns as needed
  renderItem={renderItem}
  contentContainerStyle={{
    justifyContent: 'flex-start',
    alignItems: 'flex-start', // Align items to the left
    paddingTop: 10,
    backgroundColor: '#fff',
  }}
  showsVerticalScrollIndicator={true}
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={renderFooter}
/>
</View>
</View>
  );
}

function PostsScreen() {
  const [requested, setRequested] = useState(false);
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
        `${httpRequests.getBaseURL()}/socialPost/getPostsFromAccountId/${context?.userProfile.id}/${startIndex}/${endIndex}`,
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
    console.log("now")
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
          console.log("unlike")
          const index = post.userIDsOfLikes.indexOf(userId);
          if (index !== -1) {
            post.userIDsOfLikes.splice(index, 1);
          }
        } else {
          console.log("like")
          post.userIDsOfLikes.push(userId);
        }
        console.log("Is Liked: " , post.userIDsOfLikes.includes(userId))
      const foundHandler = likeHandlers.current.find(handler => handler.PostId === post.id);
      if (foundHandler) {
        console.log("found handler")
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
          <ActivityIndicator size="large" />
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
          showsVerticalScrollIndicator={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            returned ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No posts available</Text>
                <Text style={styles.emptyEmoji}>😔</Text>
              </View>
            ) : null
          }
          //columnWrapperStyle={{ padding: 0, margin: 0 }}
        />
      ) : (
        <ActivityIndicator size="large" />
      )}
    </View>
  );
}

function ProgressScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const context = useContext(GlobalContext);
  const [loadingDates, setLoadingDates] = useState<Date[]>([]);


  useFocusEffect(
    useCallback(() => {
      const dateRange = getDateRange();
      //context?.clearCalendar();
      context?.loadCalendarDays(dateRange, true);
      // Optionally, return a cleanup function if needed
      return () => {};
    }, [])
  );

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1); // Months are zero-based
    const day = String(date.getDate());
    return `${month}/${day}/${year}`;
  };

  let spacerKey = 100;
  const renderCalendarDay = (day: number, month: number, year: number, type: number) => {
    let myStyle;
    let textStyle;
    if (day == 0) {
      spacerKey++;
      day = spacerKey;
    }

    if (type == 1) {
      myStyle = styles.activeDay;
    } else if (type == 2) {
      myStyle = styles.restDay;
    } else if (type == 3) {
      myStyle = styles.inactiveDay;
    } else if (type == 4) {
      myStyle = styles.upcomingDay;
      textStyle = styles.dayTextOverwrite;
    } else if (type == 5) {
      myStyle = styles.hiddenDay;
      textStyle = styles.hiddenDayText;
    }
    return (
      <View style={[styles.day, myStyle]} key={day}>
        <Text style={[styles.dayText, textStyle]}>{day}</Text>
      </View>
    );
  };

  const getActivityType = (myDate: Date): number => {
    console.log("Checking: " , formatDate(myDate))
    console.log("Is: " , context!.calendar[formatDate(myDate)])
    console.log(context!.calendar)
    if (context && context.calendar[formatDate(myDate)]) {
      // If date is in context, use the context date
      return context.calendar[formatDate(myDate)];
    } else if (new Date(myDate) < new Date() && context && new Date(myDate) <= new Date(context.userProfile.accountCreatedDate)) {
      return 4;

    } else if (new Date(myDate) < new Date()) {
      // If date is not in context and is before today, return 3
      return 3;
    } else {
      // If date is today or after, return 4
      return 4;
    }
  };
  const addLoadingDate = (date: Date) => {
    setLoadingDates((prevLoadingDates) => {
      // Check if the date already exists in the array
      const exists = prevLoadingDates.some((d) => d.getTime() === date.getTime());
      // If not, append the date; otherwise, return the previous state
      return exists ? prevLoadingDates : [...prevLoadingDates, date];
    });
  };
  const adjustDate = (year: number, month: number) => {
    // Handle month overflows and underflows
    const adjustedDate = new Date(year, month);
    return {
      year: adjustedDate.getFullYear(),
      month: adjustedDate.getMonth() + 1, // Convert to 1-based month
    };
  };
  const [refreshKey, setRefreshKey] = useState(0); // State to trigger re-render
  
  const Calendar = () => {
    const daysInMonth = new Date(myDate.getFullYear(), myDate.getMonth()+1, 0).getDate(); // Directly calculate days

    React.useEffect(() => {

    }, [refreshKey]);

    if (context) {
      const loadedStartDate = new Date(context.calendarLoadTracker.startDate);
      if (new Date(loadedStartDate.getFullYear(), loadedStartDate.getMonth() + 2, loadedStartDate.getDate()) > myDate) {
        const exists = loadingDates.some((d) => d.getTime() === myDate.getTime());
        if (!exists) {
          const startDate = adjustDate(myDate.getFullYear(), myDate.getMonth() - 3); // Subtract 3 months
          const endDate = adjustDate(loadedStartDate.getFullYear(), loadedStartDate.getMonth() + 1); // Add 1 month

          // Call the function with the corrected date ranges
          context?.loadCalendarDays({
            startYear: startDate.year,
            startMonth: startDate.month,
            endYear: endDate.year,
            endMonth: endDate.month,
          });
        }
      }
      if (loadedStartDate > myDate) {
        return <ActivityIndicator size="large" />;
      }
    }

    let spacers: JSX.Element[] = [];
    const calendarDays = [...Array(daysInMonth)].map((_, i) => {
      const day = i + 1;

      if (i === 0) {
        const firstDay = new Date(myDate.getFullYear(), myDate.getMonth(), 1).getDay(); // Get first weekday of the month
        for (let j = 0; j < firstDay; j++) {
          spacers.push(renderCalendarDay(0, myDate.getFullYear(), myDate.getMonth(), 5)); // Render empty spacers
        }
      }
      // if date is in context
      // use context date
      // else if date is not in context
      // if date is before today, 3
      // if date is today or after, 4
      return (
        <React.Fragment key={i}>
          {renderCalendarDay(
            day,
            myDate.getFullYear(),
            myDate.getMonth(),
            getActivityType(new Date(myDate.getFullYear(), myDate.getMonth(), day))
          )}
        </React.Fragment>
      );
    });
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.daysContainer}>
          {spacers}
          {calendarDays}
        </View>
      </View>
    );
  };

  const [myDate, setMyDate] = useState(new Date(Date.now()));
  // const [year, setYear] = useState(today.getFullYear())
  // const [month, setMonth] = useState(today.getMonth())
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const setToFirstOfPreviousMonth = () => {
    const date = new Date(myDate);
    date.setMonth(date.getMonth() - 1);
    date.setDate(1);
    setMyDate(date);
  };

  // Set myDate to the 1st of the next month
  const setToFirstOfNextMonth = () => {
    const date = new Date(myDate);
    date.setMonth(date.getMonth() + 1);
    date.setDate(1);
    setMyDate(date);
  };

  const useRestDay = async () => {
    if (context && context?.userProfile.restDaysLeft > 0) {
      const currentRestDays = context?.userProfile.restDaysLeft;
      context?.updateUserProfile({
        ...context.userProfile, // Spread existing userProfile to retain all required fields
        restDaysLeft: Math.max((context.userProfile?.restDaysLeft || 0) - 1, 0),
      });

      const today = new Date().toISOString().split('T')[0]; // Get today's date in yyyy-MM-dd format

      try {
        const response = await fetch(`${httpRequests.getBaseURL()}/calendar/logRestDay?timeZone=${TimeZone.get()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Set content type to JSON
            Authorization: `Bearer ${context?.data.token}`, // Replace with the correct token
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error: ${response.status} - ${errorText}`);
        }

        const result = await response.text();
        console.log('Rest day logged successfully:', result);
        // context?.clearCalendar()
        const dateRange = getDateRange();
        await context?.loadCalendarDays(dateRange);
        setRefreshKey((prevKey) => prevKey + 1);
      } catch (error) {
        context?.updateUserProfile({
          ...context.userProfile, // Spread existing userProfile to retain all required fields
          restDaysLeft: currentRestDays, // change failed. Reset local data.
        });

        console.error('Error logging rest day:', error);
      }
    }
  };

  return (
    <ScrollView>
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={setToFirstOfPreviousMonth}>
            <Ionicons name="chevron-back-outline" size={24} />
          </TouchableOpacity>
          <View style={styles.minWidth}>
            <Text style={styles.month}>
              {monthNames[myDate.getMonth()]} {myDate.getFullYear()}
            </Text>
          </View>
          <TouchableOpacity onPress={setToFirstOfNextMonth}>
            <Ionicons name="chevron-forward-outline" size={24} />
          </TouchableOpacity>
        </View>

   
    <Calendar/>

    <View style={{ marginBottom: '10%', flexDirection: 'row', alignItems: 'center', }}>
      <Text style={{ }} >{context?.userProfile.restDaysLeft} days available</Text>
      <TouchableOpacity
        style={{
          marginLeft: 10,
          backgroundColor: '#21BFBF',
          paddingHorizontal: 15,
          paddingVertical: 10,
          borderRadius: 20,
          alignSelf: 'center'
          // shadowColor: '#000',
          // shadowOffset: { width: 0, height: 2 },
          // shadowOpacity: 0.25,
          // shadowRadius: 4,
          // elevation: 5, // Adds shadow on Android
        }}
        onPress={useRestDay}
      >
        <Text style={{ color: '#fff', }}>Use Rest Day</Text>
      </TouchableOpacity>
      </View>


        {/* <View style={styles.links}>
          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('GraphScreen')}>
            <Text style={styles.linkText}>Graphs</Text>
            <Ionicons name="chevron-forward-outline" size={24} style={styles.linkIcon} />
          </TouchableOpacity>
        </View> */}
      </View>
    </ScrollView>
  );
}

function CustomDrawerContent({ navigation }: any) {
  const drawerNav = async (navigation: any) => {
    navigation.closeDrawer();
    navigation.navigate('SettingsScreen');
  };
  const aboutUs = async (navigation: any) => {
    navigation.closeDrawer();
    navigation.navigate('RiptTeamScreen');
  };

  const context = useContext(GlobalContext);
  return (
    <View style={styles.drawerContent}>
      <View>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            // Navigate to Settings screen or handle accordingly
            drawerNav(navigation);
            // navigation.navigate('SettingsScreen');
          }}
        >
          <View style={styles.drawerItemTextContainer}>
            <Ionicons name="settings-outline" size={24} color={'#1E1E1E'} />
            <Text style={styles.drawerItemText}>Account Settings</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            // Handle logout logic here
            navigation.closeDrawer();
            context?.setToken('');
            // Perform logout actions
          }}
        >
          <View style={styles.drawerItemTextContainer}>
            <Ionicons name="log-out-outline" size={24} color={'#1E1E1E'} />
            <Text style={styles.drawerItemText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => {
          // Navigate to Settings screen or handle accordingly
          aboutUs(navigation);
          // navigation.navigate('SettingsScreen');
        }}
      >
        <View style={[styles.drawerItemTextContainer, {borderTopWidth: 1, paddingTop: 10, borderBottomWidth: 0, borderTopColor: '#ddd'}]}>
          <Ionicons name="people-outline" size={24} color={'#1E1E1E'} />
          <Text style={styles.drawerItemText}>RiptFitness Team</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const MainScreen = () => {
  const context = useContext(GlobalContext);
  const ProfContext = useContext(ProfileContext);
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [adding, setAdding] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      ProfContext?.reloadFriendRequests(); // Example: Fetch profile data or perform actions
      context?.reloadFriends();
      // Optionally, return a cleanup function if needed
      return () => {};
    }, [])
  );

  const handleAddFriend = () => {
    navigation.navigate('FriendsScreen');
  };

  const handleFriendRequest = async (id: any, myStatus: string) => {
    // Get Account ID
    // Send Request to Account ID
    if (adding.indexOf(id) == -1) {
      setAdding((prevNumbers) => [...prevNumbers, id]);
      try {
        const myBody = {
          accountIdOfToAccount: id,
          status: myStatus,
        };
        ProfContext?.removeFriendRequest(id);
        if (myStatus == 'ACCEPTED') {
          const newFriend = ProfContext?.getFriendRequesterById(id);
          if (newFriend && newFriend != null) {
            context?.addFriend(newFriend);
          }
        }
        const response = await fetch(`${httpRequests.getBaseURL()}/friendRequest/sendRequest`, {
          method: 'PUT', // Set method to POST
          headers: {
            'Content-Type': 'application/json', // Set content type to JSON
            Authorization: `Bearer ${context?.data.token}`,
          },
          body: JSON.stringify(myBody), // Convert the data to a JSON string
        }); // Use endpoint or replace with BASE_URL if needed
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const json = await response.text(); //.json(); // Parse the response as JSON
        // return json; // Return the JSON data directly
      } catch (error) {
        console.error('00012 GET request failed:', error);
        throw error; // Throw the error for further handling if needed
      } finally {
        setAdding((prev) => {
          const updated = [...prev];
          updated.splice(prev.indexOf(id), 1); // Remove the item
          return updated; // Return the updated array
        });
        ProfContext?.reloadFriendRequests();
        context?.reloadFriends();
      }
    }
  };

  const handlePressOutside = () => {
    ProfContext?.setRequestsOpen(false);
  };
  return (
    <View style={styles.bg}>
      <Modal
        visible={ProfContext?.requestsOpen}
        transparent={true}
        animationType="fade" // Optional: adds a fade animation
        onRequestClose={() => ProfContext?.setRequestsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Touchable area for dismissing the modal */}
          <TouchableWithoutFeedback onPress={handlePressOutside}>
            <View style={styles.overlayTouchable} />
          </TouchableWithoutFeedback>

          {/* Modal Content */}
          <View style={styles.popup}>
            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {ProfContext && ProfContext?.requestingFriends?.length > 0 ? (
                ProfContext?.requestingFriends.map((friend, index) => (
                  <View
                    key={index}
                    style={[
                      styles.friendRequestItem,
                      index === ProfContext?.requestingFriends?.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <TouchableOpacity
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => {
                        ProfContext?.setRequestsOpen(false);
                        navigation.navigate('VisitProfileScreen', { item: friend });
                      }}
                    >
                      <Image
                        source={{ uri: `data:image/png;base64,${friend.profilePicture}` }}
                        style={styles.friendReqAvatar}
                      />

                      <View style={styles.friendInfo}>
                        <Text style={styles.friendName}>{friend.displayname}</Text>
                        <Text style={styles.friendUsername}>@{friend.username}</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleFriendRequest(friend.id, 'ACCEPTED')}
                    >
                      {adding.indexOf(Number(friend.id)) == -1 ? (
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      ) : (
                        <ActivityIndicator size="small" color="#ffffff" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={() => handleFriendRequest(friend.id, 'DECLINED')}
                    >
                      {adding.indexOf(Number(friend.id)) == -1 ? (
                        <Ionicons name="trash" size={18} color="white" />
                      ) : (
                        <ActivityIndicator size="small" color="#ffffff" />
                      )}
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.noRequests}>No friend requests.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <View style={styles.container}>

        <View style={styles.center}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Image
              source={{ uri: `data:image/png;base64,${context?.userProfile.profilePicture}` }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{context?.userProfile.displayname}</Text>
            {context?.userProfile.bio ? (
              <View style={styles.bioStyle}>
                <TouchableOpacity
                  onPress={() => {
                    if (context?.userProfile) {
                      navigation.navigate('FullBioScreen', { userProfile: context.userProfile });
                    } else {
                      console.error('User profile is undefined.');
                    }
                  }}
                >
                  <Text style={styles.bio}>
                    {context?.userProfile?.bio != null
                      ? `${(context?.userProfile?.bio.split('\n')[0] || '').slice(0, 50)}`
                      : null}
                      {context?.userProfile.bio && (context?.userProfile.bio.length > context?.userProfile.bio.split('\n')[0].length || context?.userProfile.bio.split('\n')[0].length > 50)  ? <Text style={{ color: '#757575', fontWeight: 600 }}>{'...View more'}</Text> : <></>}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.friendsContainer}>
              <View style={styles.friendsSection}>
                <View style={styles.friendsList}>
                  {context?.friends.length === 0 ? (
                    // Render "Add Friend" button when there are no friends
                    <View style={styles.addFriendContainer}>
    <TouchableOpacity style={styles.addFriendButton} onPress={handleAddFriend}>
      <Ionicons name="search-outline" size={18} color={'#757575'} />
      <Text style={{marginLeft: 3, color: '#757575'}} >Find Friends</Text>
    </TouchableOpacity>
                    </View>
                  ) : (
                    // Render the FlatList if there are friends
                    <View>
                      <TouchableOpacity
                        style={styles.addFriendButtonOverlay}
                        onPress={handleAddFriend}
                      >
                        <FlatList
                          horizontal
                          data={context?.friends.slice(0, 4)} // Display only the first 4 friends
                          keyExtractor={(_, index) => index.toString()} // Use index as the key
                          renderItem={({ item, index }) => (
                            <Image
                              source={{ uri: `data:image/png;base64,${item.profilePicture}` }}
                              style={[styles.friendAvatar, { zIndex: 5 - index }]}
                            />
                          )}
                          ListFooterComponent={
                            context && context?.friends.length > 4 ? (
                              <View style={[styles.moreFriends, { marginLeft: -15 }]}>
                                <Text style={styles.moreFriendsText}>
                                  +{context?.friends.length - 4}
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
          </View>
        </View>
      </View>
      <View style={styles.tabContainer}>
        <ProfileTabs />
      </View>
    </View>
  );
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const ProfContext = useContext(ProfileContext);
  const context = useContext(GlobalContext); // Access GlobalContext here
  const insets = useSafeAreaInsets();
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerPosition: 'left',
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Profile"
        component={MainScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitleAlign: 'center', // Center the header title

          headerTitle: context?.userProfile.username,
          headerStyle: {
            // paddingTop: Platform.OS === "ios" ? 20 : 0, // Add paddingTop for iOS
            height: Platform.OS === "ios" ? 80 : 60,    // Adjust header height if necessary
            backgroundColor: 'white',                  // Ensure consistent background

            // You can add more styling properties as needed
          },
          headerRight: () => (
            <View style={{ marginRight: 15 }}>
              <TouchableOpacity
                onPress={() => {
                  ProfContext?.setRequestsOpen(!ProfContext?.requestsOpen);
                }}
              >
                <Ionicons name="notifications-outline" size={24} />
                {ProfContext && ProfContext?.requestingFriends?.length > 0 ? (
                  <View style={styles.pendingFriend}></View>
                ) : null}
              </TouchableOpacity>
            </View>
          ),
          // Add the headerLeft here
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={{ marginLeft: 15 }}
            >
              {/* Replace the View with a circle containing the user's profile picture */}
              <Ionicons name="menu" size={24} />
            </TouchableOpacity>
          ),
        })}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  modalOverlay: {
    flex: 1,
    top: 20,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 5,
    marginTop: 20,
    position: 'absolute',
    top: 0, // Adjust as needed
    bottom: 0,
    height: '30%',
    width: '90%',
    alignSelf: 'center',
  },
  friendRequestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  friendReqAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendUsername: {
    fontSize: 14,
    color: '#888',
  },
  acceptButton: {
    backgroundColor: '#40bcbc',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    zIndex: 10, // Ensure it's on top
    elevation: 5, // For Android
  },
  declineButton: {
    backgroundColor: '#40bcbc',
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    zIndex: 10, // Ensure it's on top
    elevation: 5, // For Android
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noRequests: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  addFriendContainer: {
    marginBottom: 5
  },
  addFriendButton: {
    backgroundColor:"#ececed",
    paddingVertical:8,
    paddingHorizontal:8,
    borderRadius:7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addFriendButtonOverlay: {
    margin: 0,
    padding: 0,
  },
  pendingFriend: {
    backgroundColor: 'red',
    width: 10,
    height: 10,
    position: 'absolute',
    right: 0,
    borderRadius: 5,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 70,
    backgroundColor: '#fff',
    justifyContent: 'space-between'
  },
  drawerItem: {
    padding: 10,
    // borderTopWidth: 1,
    // borderTopColor: '#ddd',
  },
  drawerItemText: {
    fontSize: 18,
    paddingLeft: 5,
  },
  drawerItemTextContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10
  },
  postsContainer: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  postContent: {
    paddingTop: 15,
    flex: 1,
  },
  bioStyle: {
    flexDirection: 'row',
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
  likecomment: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    bottom: 0,
    left: 15,
    marginTop: 10,
  },
  likeCounter: {
    color: 'black',
    padding: 7,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    bottom: 0,
    right: 15,
  },
  avatarView: {
    height: '100%',
    justifyContent: 'center',
    paddingBottom: 10,
  },
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
  textView: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    width: '70%',
    // height:"100%",
    marginLeft: 5,
    marginBottom: 25,
    marginTop: 10,
    borderRadius: 15,
    // backgroundColor:"red",
    // backgroundColor:"#eee"
  },
  postAvatar: {
    width: 60,
    height: 60,
    marginLeft: 10,
    marginTop: 10,
    borderRadius: 30,
    marginRight: 10,
  },
  postItem: {
    marginBottom:10,
    width:"90%",
    minHeight:80,
    backgroundColor:"#eee",
    borderWidth:1,
    borderColor:"#ddd",
    borderRadius:10,
    flexDirection:"row",
  },
  photosContainer: {
    flex: 1, // Allows FlatList to take up full height and be scrollable
    padding: 0,
    margin:0,
    // alignItems:'left',
  },
  addPhotoButton: {
    position: "absolute",
    right: 20,
    bottom: 15,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#21BFBF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    zIndex:10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  photo: {
    width: 128, // Adjust as needed for your layout
    height: 128,
    borderRadius: 10,
    margin:1,
  },
  bg: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: { backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  center: {
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  profileSection: { alignItems: 'center', marginTop: 20, },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  name: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  bio: { fontSize: 13, marginTop: 3, textAlign: 'center' },
  friendsContainer: { },
  friendsSection: { flexDirection: 'row', marginTop: 10},
  friendsLabel: { marginRight: 10, fontSize: 16, },
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

  nav: { height:"10%", width:"100%", marginTop:5,marginBottom:5, backgroundColor:"#fff", flex:1},
  moreFriendsText: { color: '#757575' },
  friendsList: {alignContent:'center'},
  calendar: { paddingTop: 20, paddingBottom:20, alignItems: 'center' , width:'100%', backgroundColor:"white", height:"100%"},
  calendarHeader: { flexDirection: 'row', alignItems: 'center' , paddingBottom:'2%'},
  minWidth: { minWidth:'50%', alignItems:'center'},

  month: { marginHorizontal: 10, fontSize: 18, fontWeight: 'bold' },
  daysRow: {},
  calendarContainer: {
    // backgroundColor:"red",
    alignItems: 'center',
    width: '90%',
    aspectRatio: 1.166,
  },
  daysContainer: {
    paddingLeft: '4%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '95%',
    height: 'auto',
    alignItems: 'center',
    aspectRatio: 1.1,
  },
  day: { width: '11.42%', aspectRatio: 1, margin: 4, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  activeDay: { backgroundColor: '#63c782' },
  inactiveDay: { backgroundColor: '#F2505D' },
  restDay: { backgroundColor: '#f4d47c' },
  upcomingDay: { backgroundColor: '#f0ecec', color: 'black' },
  dayText: { color: '#fff', fontWeight: 'bold' },
  dayTextOverwrite: { color: 'black', fontWeight: 'bold' },
  hiddenDay: { backgroundColor: 'white', borderColor: 'black', borderWidth: 1, color: 'black', opacity: 0 },
  hiddenDayText: { color: '#', fontWeight: 'bold', opacity: 0 },
  links: { marginHorizontal: 16, width: '100%' },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    // backgroundColor: '#ededed'
  },
  linkText: { fontSize: 18, paddingLeft: '5%' },
  linkIcon: {
    paddingRight: '5%',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  postView: {
    backgroundColor: '#fff',
    flex: 1, // Allows FlatList to take up full height and be scrollable
    padding: 0,
    margin: 0,
    // backgroundColor:"#fff",
    // alignItems:"center",
  },
});

export default ProfileScreen;