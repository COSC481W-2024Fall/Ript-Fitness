import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalContext } from '@/context/GlobalContext';
import { httpRequests } from '@/api/httpRequests';
import { useFocusEffect } from '@react-navigation/native';


const FriendsScreen = ({ navigation }: any) => {
const context = useContext(GlobalContext)
  const [search, setSearch] = useState('');
  const isDarkMode = context?.isDarkMode; 

  const filteredFriends = context?.friends.filter((friend: any) =>
    friend.username.toLowerCase().includes(search.toLowerCase())
  );


  const deleteFriend = async (id: string) => {
    try {
        context?.removeFriend(id)
        context?.incrementRemovePending();
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
      } finally {
        context?.decrementRemovePending();
      }
  }


  const renderItem = ({ item }: any) => { 
    return (
    <View style={styles.friendItem}>
      <TouchableOpacity style={{flex:1, flexDirection:'row', alignItems: 'center'}} onPress={() => {navigation.navigate("VisitProfileScreen", {item})}}>
        <Image source={{ uri: `data:image/png;base64,${item.profilePicture}` }} style={styles.profileImage} />
        <View style={{flex:1}}>
        <Text style={[isDarkMode? styles.darkFriendName : styles.friendName]}>{item.displayname}</Text>
        <Text style={styles.friendUserName}>@{item.username}</Text>
      </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.removeButton} onPress={() => {deleteFriend(item.id)}}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  )};

  return (
    <View style={[styles.container, {paddingTop: Platform.OS === "ios" ? 30 : 0, // Add paddingTop for iOS
      height: Platform.OS === "ios" ? 80 : 60, },   // Adjust header height if necessary
      {backgroundColor: isDarkMode? 'black' : 'white', }]}>
      {/* Header */}
      <View style={[isDarkMode? styles.darkHeader : styles.header]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode? "white" : "black"} />
        </TouchableOpacity>
        <Text style={[isDarkMode? styles.darkTitle : styles.title]}>Friends List</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FindFriendsScreen')}>
          <Ionicons name="add" size={30} color={isDarkMode? "white" : "black"} style={styles.addButton} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        value={search}
        onChangeText={setSearch}
      />

      {/* Friend List or Empty Message */}
      {context?.friends.length === 0 ? (
        <View style={[isDarkMode? styles.darkEmptyContainer : styles.emptyContainer]}>
          <Text style={styles.emptyMessage}>Press + to add a friend</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, backgroundColor: '#fff',  
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  darkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'black',
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  darkTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  addButton: { marginRight: 10 },
  searchBar: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    margin: 16,
    borderRadius: 8,
  },
  list: { paddingHorizontal: 16, },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold', 
    //color: 'white'
  },
  darkFriendName: {
  fontSize: 16,
  fontWeight: 'bold', 
  color: 'white'
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
  darkEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black'
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default FriendsScreen;
