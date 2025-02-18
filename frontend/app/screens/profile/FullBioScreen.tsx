import React, { useContext, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { GlobalContext, ProfileObject } from '@/context/GlobalContext';
import { RouteProp, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ProfileStackParamList } from '@/app/(tabs)/ProfileStack';



const FullBioScreen: React.FC<any> = ({ route }) => {
    const { userProfile } = route.params;
  const context = useContext(GlobalContext);
  const navigation = useNavigation();

  const isDarkMode = context?.isDarkMode;

  if (!context) {
    return <Text>Error: GlobalContext is undefined.</Text>;
  }

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
          <Text style={[isDarkMode ? styles.darkBioText : styles.bioText]}>{userProfile.bio}</Text>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  darkContainer: {
    flex: 1,
    backgroundColor: 'black',
    paddingHorizontal: 16,
    paddingTop: 20,
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
});

export default FullBioScreen;
