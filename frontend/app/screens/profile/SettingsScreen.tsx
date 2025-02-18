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
import { Picker } from '@react-native-picker/picker'; // <-- ADDED
import { Dropdown } from 'react-native-element-dropdown';

// We add a static list of some common time zones.
// DO NOT REMOVE ANYTHING ELSE, ONLY ADD WHAT'S NEEDED.
const timeZones: string[] = [
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Tokyo",
  "Australia/Sydney",
];

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
  const isDarkMode = context?.isDarkMode;


// ADDING STATE FOR TIMEZONE, NO REMOVALS
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>("America/New_York");

  useEffect(() => {
    if (context?.userProfile) {
      setDisplayName(context.userProfile.displayname);
      setFirstName(context.userProfile.firstName);
      setLastName(context.userProfile.lastName);
      setRestDays(context.userProfile.restDays.toString());
      setBio(context.userProfile.bio);
      // SET TIMEZONE IF AVAILABLE, OTHERWISE KEEP DEFAULT
      setSelectedTimeZone(context.userProfile.timeZone || "America/New_York");
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
      context?.userProfile.profilePicture !== selectedImage ||
      // ADD CHECK FOR TIMEZONE
      context?.userProfile.timeZone !== selectedTimeZone
    ) {
      const newProfile: any = {
        ...context?.userProfile,
        displayname: displayName ?? context?.userProfile.displayname,
        firstName: firstName ?? context?.userProfile.firstName,
        lastName: lastName ?? context?.userProfile.lastName,
        restDays: parseInt(restDays ?? "") ?? context?.userProfile.restDays,
        bio: bio ?? context?.userProfile.bio,
        profilePicture: selectedImage ?? context?.userProfile.profilePicture,
        // INCLUDE TIMEZONE IN PROFILE
        timeZone: selectedTimeZone ?? context?.userProfile.timeZone,
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
  const [selection, setSelection] = useState<{ start: number; end: number } | undefined>(undefined);
  const [lastFocus, setLastFocus] = useState(-1)
  const [isFocus, setIsFocus] = useState(false);
  return (
    <KeyboardAwareScrollView
      style={[isDarkMode? styles.darkContainer : styles.container]}
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      enableResetScrollToCoords={false}
      enableOnAndroid={true}
      extraScrollHeight={80}
    >
      <View style={[isDarkMode? styles.darkHeader : styles.header]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode? "white" : "black"} />
        </TouchableOpacity>
        <Text style={[isDarkMode? styles.darkTitle : styles.title]}>Account Settings</Text>
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
          <Text style={[isDarkMode? styles.darkLabel : styles.label]}>First Name</Text>
          <TextInput
            style={[isDarkMode? styles.darkInput : styles.input]}
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              // Once the user has typed something, stop controlling the selection
            }}
            onSelectionChange={() => {
              if (selection !== undefined) {
                setSelection(undefined);
              }


            }}
            onFocus={() => {
              // When the user taps on the TextInput, move the cursor to the end
              if (lastFocus != 0) {
              const length = firstName.length;
              setSelection({ start: length, end: length });
              setLastFocus(0)
              }
            }}
            selection={selection}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={[isDarkMode? styles.darkLabel : styles.label]}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              // Once the user has typed something, stop controlling the selection
            }}
            onSelectionChange={() => {
              if (selection !== undefined) {
                setSelection(undefined);
              }


            }}
            onFocus={() => {
              // When the user taps on the TextInput, move the cursor to the end
              if (lastFocus != 1) {
                const length = lastName.length;
                setSelection({ start: length, end: length });
                setLastFocus(1)
                }
            }}
            selection={selection}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={[isDarkMode? styles.darkLabel : styles.label]}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={(text) => {
              setDisplayName(text);
              // Once the user has typed something, stop controlling the selection
            }}
            onFocus={() => {
              console.log(lastFocus)
              // When the user taps on the TextInput, move the cursor to the end
              if (lastFocus != 2) {
                const length = displayName.length;
                setSelection({ start: length, end: length });
                setLastFocus(2);
                }
            }}
            onSelectionChange={() => {
              if (selection !== undefined) {
                setSelection(undefined);
              }


            }}
            selection={selection}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={[isDarkMode? styles.darkLabel : styles.label]}>Rest Days</Text>
          <TextInput
            style={styles.input}
            value={restDays}
            onChangeText={(text) => {
              setRestDays(text);
              // Once the user has typed something, stop controlling the selection
            }}
            keyboardType="numeric"
            onFocus={() => {
              // When the user taps on the TextInput, move the cursor to the end
              if (lastFocus != 3) {
                const length = restDays.length;
                setSelection({ start: length, end: length });
                setLastFocus(3)
                }
            }}
            onSelectionChange={() => {
              if (selection !== undefined) {
                setSelection(undefined);
              }


            }}
            selection={selection}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={[isDarkMode? styles.darkLabel : styles.label]}>Bio</Text>
          <TextInput
            style={styles.input}
            value={bio}
            onChangeText={(text) => {
              setBio(text);
              // Once the user has typed something, stop controlling the selection
            }}
            multiline
            onSelectionChange={() => {
              if (selection !== undefined) {
                setSelection(undefined);
              }


            }}
            onFocus={() => {
              // When the user taps on the TextInput, move the cursor to the end
              if (lastFocus != 4) {
                const length = bio ? bio.length : 0;
                setSelection({ start: length, end: length });
                setLastFocus(4)
                }
            }}
            selection={selection}
          />
        </View>
        {/* ADD TIME ZONE DROPDOWN HERE WITHOUT REMOVING ANYTHING */}
        <View style={[styles.infoRow]}>
          <Text style={[[isDarkMode? styles.darkLabel : styles.label], {flex:1}]}>Time Zone</Text>
          <View style={{flex:2, justifyContent:'center'}}>
          <Dropdown
        data={timeZones.map(tz => ({ label: tz, value: tz }))}
        labelField="label"
        valueField="value"
        value={selectedTimeZone}
        placeholder={context && context.userProfile.timeZone ? context.userProfile.timeZone : ""}
        placeholderStyle={{marginLeft:10}}
        style={{ flex:2,borderWidth: 1, borderColor: '#ccc', borderRadius:10, minHeight:30 }}
        containerStyle={{ maxHeight: 200 }} // optional, limit dropdown height
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        selectedTextStyle={{ marginLeft: 10, color:isDarkMode?'white':'black' }}
        onChange={item => {
          setSelectedTimeZone(item.value);
          setIsFocus(false);
        }}
        // Control whether the dropdown is open
        //visible={isFocus}
      />
</View>
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
          <Text style={[isDarkMode? styles.darkLabel : styles.label]}>Change password</Text>
          <Ionicons name="chevron-forward" size={20} color={isDarkMode? "white" : "black"} style={{paddingRight: 15}} />
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', },
  darkContainer: { flex: 1, backgroundColor: 'black', },
  scrollContainer: { flexGrow: 1, },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginTop: Platform.OS === "ios" ? '10%' : 0,
  },
  darkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginTop: Platform.OS === "ios" ? '10%' : 0,
    backgroundColor: 'black',
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  darkTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
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
  darkInfoContainer: { paddingHorizontal: 16, flexGrow: 1, backgroundColor: 'black' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  label: { fontSize: 16, fontWeight: '500', color: '#333' },
  darkLabel: { fontSize: 16, fontWeight: '500', color: 'white' },
  input: { fontSize: 16, color: 'white', flex: 1, textAlign: 'right', minWidth:30, marginRight:10 },
  darkInput: { fontSize: 16, color: 'white', flex: 1, textAlign: 'right', minWidth:30, marginRight:10 },
  dropdown: { fontSize: 16, color: '#333', flex: 2, textAlign: 'right', minWidth:50, backgroundColor:'grey' },
});

export default SettingsScreen;
