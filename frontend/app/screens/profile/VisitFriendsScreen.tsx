import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalContext } from '@/context/GlobalContext';
import { httpRequests } from '@/api/httpRequests';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { ProfileScreenNavigationProp } from '@/app/(tabs)/ProfileStack';
import { ProfileContext } from '@/context/ProfileContext';


const VisitFriendsScreen: React.FC = () => {
    const route = useRoute();
    const navigation = useNavigation<ProfileScreenNavigationProp>();
const { friends } = route.params as any;

const profContext = useContext(ProfileContext)
const context = useContext(GlobalContext)
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState<number[]>([])

  const filteredFriends = friends.filter((friend: any) =>
    friend.username.toLowerCase().includes(search.toLowerCase())
  );

  const sendFriendRequest = async (id: number, username: string) => {
    //Get Account ID
    console.log(id)
    //Send Request to Account ID
   const request = {
      "accountIdOfToAccount": id,
      "status": "SENT"
  }
  if (adding.indexOf(id) == -1 && !profContext?.sentFriendRequests.includes(username)) {
    setAdding((prevNumbers) => [...prevNumbers, id]);
  try {
    const response = await fetch(`${httpRequests.getBaseURL()}/friendRequest/sendNewRequest`, {
      method: 'POST', // Set method to POST
      headers: {
        'Content-Type': 'application/json', // Set content type to JSON
        "Authorization": `Bearer ${context?.data.token}`,
      },
      body: JSON.stringify(request), // Convert the data to a JSON string
    }); // Use endpoint or replace with BASE_URL if needed
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const json = await response.json() //.json(); // Parse the response as JSON
    profContext?.handleAddSentFriendRequest(username)
    //return json; // Return the JSON data directly
  } catch (error) {
    console.error('GET request failed:', error);
    throw error; // Throw the error for further handling if needed
  } finally {
  setAdding((prev) => {
    const updated = [...prev];
    updated.splice(prev.indexOf(id), 1); // Remove the item
    return updated; // Return the updated array
  });
}
  }
}


console.log("FEE: " , profContext)
  const renderItem = ({ item }: any) => { 
    return (

    <View style={styles.friendItem}>
      <TouchableOpacity style={{flex:1, flexDirection:'row', alignItems: 'center'}} onPress={() => {navigation.navigate("VisitProfileScreen", {item})}}>
        <Image source={{ uri: `data:image/png;base64,${item.profilePicture}` }} style={styles.profileImage} />
        <View style={{flex:1}}>
        <Text style={styles.friendName}>{item.displayname}</Text>
        <Text style={styles.friendUserName}>@{item.username}</Text>
      </View>
      </TouchableOpacity>

      <TouchableOpacity
  style={[
    styles.addButton,
    (adding.includes(item.id) || 
    context?.friends.some((friend : any) => friend.id === item.id) || 
     profContext?.sentFriendRequests.includes(item.username)) && styles.disabledButton
  ]}
  onPress={() => sendFriendRequest(item.id, item.username)}
  disabled={
    adding.includes(item.id) ||
    context?.friends.some((friend : any) => friend.id === item.id) ||
    profContext?.sentFriendRequests.includes(item.username)
  }
>
  <Text style={styles.addButtonText}>
    {adding.includes(item.id)
      ? "Sending..."
      : context?.friends.some((friend : any) => friend.id === item.id)
      ? "Already Friends"
      : profContext?.sentFriendRequests.includes(item.username)
      ? "Request Sent"
      : "Send Request"}
  </Text>
</TouchableOpacity>


    </View>
  );}


  return (
    <View style={[styles.container, {paddingTop: Platform.OS === "ios" ? 30 : 0, // Add paddingTop for iOS
      height: Platform.OS === "ios" ? 80 : 60,    // Adjust header height if necessary
      backgroundColor: 'white', }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Friends</Text>
        <View style={{paddingRight:20}}></View>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        value={search}
        onChangeText={setSearch}
      />

      {/* Friend List or Empty Message */}
      {friends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>Press + to add a friend</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff',  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  addButton: {
    backgroundColor: '#21BFBF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  searchBar: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    margin: 16,
    borderRadius: 8,
  },
  list: { paddingHorizontal: 16 },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold', 
},

  friendUserName: {     
    fontSize: 14,
    color: '#888', 
},
  removeButton: {
    backgroundColor: '#f0f0f0',
    alignContent:'flex-end',
    alignSelf:'flex-end',
    alignItems:'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: { color: '#888' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  disabledButton: {
    backgroundColor: "#EDEDED", // Light grey
  },
});

export default VisitFriendsScreen;
