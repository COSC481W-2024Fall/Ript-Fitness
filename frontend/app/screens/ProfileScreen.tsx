import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView } from 'react-native-gesture-handler';

const ProfileScreen: React.FC = () => {
  const friends:any = [
    //{ id: '1', avatar: require('../assets/friend1.png') },
    //{ id: '2', avatar: require('../assets/friend2.png') },
    //{ id: '3', avatar: require('../assets/friend3.png') },
  ];

  const renderCalendarDay = (day: number, type: number) => { 
    let myStyle;
    let textStyle;
    if (type == 1) {
        myStyle = styles.activeDay
    } else if (type == 2) {
        myStyle = styles.restDay
    } else if (type == 3) {
        myStyle = styles.inactiveDay
    } else {
        myStyle = styles.upcomingDay
        textStyle = styles.dayTextOverwrite;
    }

    return (
    <View style={[styles.day, myStyle]} key={day}>
      <Text style={[styles.dayText,textStyle]}>{day}</Text>
    </View>
  );}
  let exampleDays = [1,2,3,1,3,1,2,2,3,1,1,]
  return (
    <ScrollView style={styles.container}>
        <View style={styles.center}>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image source={require('../../assets/images/profile/Profile.png')} style={styles.avatar} />
        <Text style={styles.name}>Steve</Text>

        <View style={styles.friendsSection}>
          <Text style={styles.friendsLabel}>Friends:</Text>
          <FlatList
            horizontal
            data={friends}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Image source={item.avatar} style={styles.friendAvatar} />
            )}
            ListFooterComponent={
              <View style={styles.moreFriends}>
                <Text style={styles.moreFriendsText}>+1</Text>
              </View>
            }
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>

      {/* Calendar Section */}
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <Ionicons name="chevron-back-outline" size={24} />
          <Text style={styles.month}>September 2024</Text>
          <Ionicons name="chevron-forward-outline" size={24} />
        </View>

        <View style={styles.daysRow}>
          {[...Array(29)].map((_, i) => renderCalendarDay(i + 1, i > 10 ? 4 : exampleDays[i]))}
        </View>
      </View>

      {/* Navigation Links */}
      <View style={styles.links}>
        <TouchableOpacity style={styles.link}>
          <Text style={styles.linkText}>Food Log</Text>
          <Ionicons name="chevron-forward-outline" size={24} style={styles.linkIcon}/>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link}>
          <Text style={styles.linkText}>Graphs</Text>
          <Ionicons name="chevron-forward-outline" size={24} style={styles.linkIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.link}>
          <Text style={styles.linkText}>Account Settings</Text>
          <Ionicons name="chevron-forward-outline" size={24} style={styles.linkIcon}/>
        </TouchableOpacity>
      </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  center: {
    alignItems:'center'

  },
  title: { fontSize: 24, fontWeight: 'bold' },
  profileSection: { alignItems: 'center', marginTop: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  name: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  friendsSection: { flexDirection: 'row', alignItems: 'center', marginTop: 10, alignContent:'center', width:'100%', backgroundColor:'green'},
  friendsLabel: { marginRight: 10, fontSize: 16 },
  friendAvatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 5 },
  moreFriends: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreFriendsText: { fontWeight: 'bold' },
  calendar: { marginVertical: 20, alignItems: 'center' , width:'80%'},
  calendarHeader: { flexDirection: 'row', alignItems: 'center' },
  month: { marginHorizontal: 10, fontSize: 18, fontWeight: 'bold' },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  day: { width: 40, height: 40, margin: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  activeDay: { backgroundColor: 'green' },
  inactiveDay: { backgroundColor: 'red' },
  restDay: { backgroundColor: 'green' },
  upcomingDay:  { backgroundColor: 'white', borderColor:'black', borderWidth:1, color:'black'},
  dayText: { color: '#fff', fontWeight: 'bold' },
  dayTextOverwrite: { color: 'black', fontWeight: 'bold' },
  links: { marginHorizontal: 16, width:'100%' },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  linkText: { fontSize: 18, paddingLeft:'5%' },
  linkIcon:{
    paddingRight:'5%'
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
});

export default ProfileScreen;
