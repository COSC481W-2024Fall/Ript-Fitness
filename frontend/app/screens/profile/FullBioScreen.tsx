import React, { useContext, useLayoutEffect,useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform,TextInput,Alert } from 'react-native';
import { GlobalContext, ProfileObject } from '@/context/GlobalContext';
import { RouteProp, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ProfileStackParamList } from '@/app/(tabs)/ProfileStack';
import { httpRequests } from "@/api/httpRequests";



const FullBioScreen: React.FC<any> = ({ route }) => {
    const { userProfile } = route.params;
  const context = useContext(GlobalContext);
  const navigation = useNavigation();

  const isDarkMode = context?.isDarkMode;

  // Check if the user viewing the profile is the currently logged-in user
  const isCurrentUser = context?.userProfile.id === userProfile.id;

  // Initialize the bio state with userProfile.bio, or an empty string if it's null or undefined
  const [editedBio, setEditedBio] = useState(userProfile.bio || '');

  if (!context) {
    return <Text>Error: GlobalContext is undefined.</Text>;
  }

  // Sends the updated bio to the backend, updates local context if successful, and navigates back.
  const handleSaveBio = async () => {
    try {
      const payload = { bio: editedBio };
      console.log("Sending to backend:", payload);

      const response = await fetch(`${httpRequests.getBaseURL()}/userProfile/updateUserProfile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${context?.data.token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log(" Backend response:", responseText);


      if (!response.ok) {
        Alert.alert('Failed to update bio', responseText);
        return;
      }

      // Update GlobalContext with new bio
      context?.updateUserProfile({
        ...context.userProfile,
        bio: editedBio,
      });

      Alert.alert('Success', 'Your bio has been updated!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View style={[isDarkMode ? styles.darkContainer : styles.container]}>
      {/* User Avatar and Username */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode? "white" : "#000"} />
        </TouchableOpacity>
        <Image
          source={{ uri: `data:image/png;base64,${userProfile.profilePicture}` }}
          style={styles.avatar}
        />
        <Text style={[isDarkMode? styles.darkUsername : styles.username]}>{userProfile.displayname}</Text>
      </View>

      {/* Bio Content */}
      <View style={[isDarkMode? styles.darkBioContainer : styles.bioContainer ]}>
        <ScrollView>
        {isCurrentUser ? (
            <TextInput
              multiline
              value={editedBio}
              onChangeText={setEditedBio}
              placeholder="Enter your bio..."
              placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
              style={[styles.bioInput, isDarkMode ? styles.darkBioInput : {}]}
            />
          ) : (
            <Text style={[isDarkMode ? styles.darkBioText : styles.bioText]}>{userProfile.bio}</Text>
          )}
        </ScrollView>

        {isCurrentUser && (
          <TouchableOpacity style={styles.saveButton} 
          onPress={() => {
            handleSaveBio();
          }}
        >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  darkContainer: {
    flex: 1,
    backgroundColor: 'black',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: Platform.OS === "ios" ? '10%' : 0
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
  },
  darkUsername: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    color: 'white',
  },
  bioContainer: {
    flex: 1,
    marginBottom:15,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  darkBioContainer: {
    flex: 1,
    marginBottom:15,
    backgroundColor: 'black',
    borderRadius: 15,
    padding: 20,
    elevation: 3, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  darkBioText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
  },
  backButton: {
    //marginLeft: 15,
    position:'absolute',
    top:0,
    left:0,
  },
  bioInput: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  darkBioInput: {
    color: '#fff',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#40bcbc',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: 100,
    alignSelf: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FullBioScreen;
