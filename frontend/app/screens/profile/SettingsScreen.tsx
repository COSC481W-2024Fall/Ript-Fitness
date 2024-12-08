import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Image as ImgTag } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { GlobalContext } from '@/context/GlobalContext';
import { httpRequests } from '@/api/httpRequests';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { ProfileScreenNavigationProp } from '@/app/(tabs)/ProfileStack';


const uploadPhoto = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;

      console.log("myURI: ", imageUri);
      const resizedUri = await resizeImage(imageUri, 250);

      const base64 = await FileSystem.readAsStringAsync(resizedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return (base64);
    }
  } catch (error) {
    console.error("Error picking or resizing image:", error);
  }
};

const resizeImage = async (uri: string, maxDimension: number): Promise<string> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxDimension } }], // Resize only width to maintain aspect ratio
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    console.log("Resized Image URI:", result.uri);
    return result.uri;
  } catch (error) {
    console.error("Error resizing image:", error);
    throw error;
  }
};


const SettingsScreen = ({ navigation }: any) => {
  const context = useContext(GlobalContext);

  const [displayName, setDisplayName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [restDays, setRestDays] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  useEffect(() => {
    if (context?.userProfile) {
      setDisplayName(context.userProfile.displayname);
      setFirstName(context.userProfile.firstName);
      setLastName(context.userProfile.lastName);
      setRestDays(context.userProfile.restDays.toString());
      setBio(context.userProfile.bio);
    }
  }, [context?.userProfile]);

  useEffect(() => {
    setSelectedImage(context?.userProfile.profilePicture || null);
  }, [context?.userProfile.profilePicture]);
  



  const [email, setEmail] = useState("placeholder");
  const [error, setError] = useState("");

  const setEmailChecked = (value: string) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (emailRegex.test(value)) {
      setError("");
      setEmail(value);
    } else {
      setError("Please use a valid email address.");
      setEmail(value);
    }
  };

  const handlePhoto = async () => {
    const base64Image = await uploadPhoto();
    if (base64Image) {
      setSelectedImage(base64Image);
    }
  };
  

  const saveSettings = async () => {
    console.log(displayName)
    console.log(context?.userProfile.displayname)
    if (
      context?.userProfile.displayname !== displayName ||
      context?.userProfile.bio !== bio ||
      context?.userProfile.firstName !== firstName ||
      context?.userProfile.lastName !== lastName ||
      context?.userProfile.restDays.toString() !== restDays ||
      context?.userProfile.profilePicture !== selectedImage
    ) {
      const newProfile: any = {
        ...context?.userProfile,
        displayname: displayName ?? context?.userProfile.displayname,
        firstName: firstName ?? context?.userProfile.firstName,
        lastName: lastName ?? context?.userProfile.lastName,
        restDays: parseInt(restDays ?? "") ?? context?.userProfile.restDays,
        bio: bio ?? context?.userProfile.bio,
        profilePicture: selectedImage ?? context?.userProfile.profilePicture,
      };
      try {
        await context?.updateUserProfile(newProfile);
        const response = await fetch(
          `${httpRequests.getBaseURL()}/userProfile/updateUserProfile`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${context?.data.token}`,
            },
            body: `${JSON.stringify(newProfile)}`,
          }
        );
        if (!response.ok) {
          console.error("Failed to update profile.");
        }
        navigation.goBack()
      } catch (error) {
        console.error("GET request failed:", error);
        throw error;
      }
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      enableOnAndroid={true}
      extraScrollHeight={80}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Account Settings</Text>
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileImageContainer}>
        <ImgTag
          source={{
            uri: `data:image/png;base64,${selectedImage}` }}
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.cameraIcon} onPress={handlePhoto}>
          <Ionicons name="camera" size={50} color="white" style={{ opacity: 0.75 }} />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorLabel}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Rest Days</Text>
          <TextInput
            style={styles.input}
            value={restDays}
            onChangeText={setRestDays}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={styles.input}
            value={bio}
            onChangeText={setBio}
            multiline
          />
        </View>
        {/*<View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmailChecked}
            keyboardType="email-address"
          />
        </View>*/}
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => navigation.navigate("ChangePasswordScreen")}
        >
          <Text style={styles.label}>Change password</Text>
          <Ionicons name="chevron-forward" size={20} color="black" style={{paddingRight: 15}} />
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', },
  scrollContainer: { flexGrow: 1, },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginTop: Platform.OS === "ios" ? '10%' : 0
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  saveButton: {
    backgroundColor: '#21BFBF',
    paddingHorizontal: 16,
    height:'100%',
    paddingVertical: 6,
    borderRadius: 20,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  cameraIcon: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  errorContainer: {
    marginHorizontal: '10%',
    alignItems: 'center',
    marginVertical: 8,
  },
  errorLabel: { fontSize: 16, color: 'red' },
  infoContainer: { paddingHorizontal: 16, flexGrow: 1 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  label: { fontSize: 16, fontWeight: '500', color: '#333' },
  input: { fontSize: 16, color: '#333', paddingRight: 15, flex: 1, textAlign: 'right', },
});

export default SettingsScreen;
