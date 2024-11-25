import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalContext } from '@/context/GlobalContext';
import { httpRequests } from '@/api/httpRequests';


const FriendsScreen = ({ navigation }: any) => {
const context = useContext(GlobalContext)
  const [search, setSearch] = useState('');

  const filteredFriends = context?.friends.filter((friend: any) =>
    friend.username.toLowerCase().includes(search.toLowerCase())
  );

  const deleteFriend = async (id: string) => {
    try {
        context?.removeFriend(id)
        const response = await fetch(`${httpRequests.getBaseURL()}/friends/deleteFriend/${id}`, {
          method: 'DELETE', // Set method to POST
          headers: {
            'Content-Type': 'application/json', // Set content type to JSON
            "Authorization": `Bearer ${context?.data.token}`,
          },
          body: "", // Convert the data to a JSON string
        }); // Use endpoint or replace with BASE_URL if needed
        if (!response.ok) {
            console.log("that's bad")
        }
        const json = await response.text() //.json(); // Parse the response as JSON;
        //return json; // Return the JSON data directly
      } catch (error) {
      
        console.error('0001 GET request failed:', error);
        throw error; // Throw the error for further handling if needed
      }
  }


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
      <TouchableOpacity style={styles.removeButton} onPress={() => {deleteFriend(item.id)}}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  )};

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Friends</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FindFriendsScreen')}>
          <Ionicons name="add" size={30} color="black" style={styles.addButton} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search Friends"
        value={search}
        onChangeText={setSearch}
      />

      {/* Friend List or Empty Message */}
      {context?.friends.length === 0 ? (
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
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  addButton: { marginRight: 10 },
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
});

export default FriendsScreen;
