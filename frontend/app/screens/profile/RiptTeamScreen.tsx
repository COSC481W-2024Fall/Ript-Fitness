import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useEffect, useState, useContext } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Platform, Image, SafeAreaView } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { GlobalContext } from '@/context/GlobalContext';


const Tab = createMaterialTopTabNavigator();

    
const data = [
  {
    id: 1,
    name: "Evan Snowgold",
    imageSrc: require('@/assets/images/team_photos/evan.jpg'),
    title: "Lead Frontend Developer"
  },
  {
    id: 2,
    name: "Rob Hewison",
    imageSrc: require('@/assets/images/team_photos/rob.jpg'),
    title: "Frontend Developer"
  },
  {
    id: 3,
    name: "Natalie Hoang",
    imageSrc: require('@/assets/images/team_photos/natalie.jpg'),
    title: "Frontend Developer"
  },
  {
    id: 4,
    name: "Michael Shahine",
    imageSrc: require('@/assets/images/team_photos/michael.jpg'),
    title: "Frontend Developer"
  },
  {
    id: 5,
    name: "Ciara Wheeler",
    imageSrc: require('@/assets/images/team_photos/ciara.jpg'),
    title: "Frontend Developer"
  },
  {
    id: 6,
    name: "Christopher Pichler",
    imageSrc: require('@/assets/images/team_photos/christopher_p.png'),
    title: "Lead Backend Developer"
  },
  {
    id: 7,
    name: "Tom Van den Bulck",
    imageSrc: require('@/assets/images/team_photos/tom.jpg'),
    title: "Co-Lead Backend Developer"
  },
  {
    id: 8,
    name: "Nathan Halash",
    imageSrc: require('@/assets/images/team_photos/nathan.jpg'),
    title: "Backend Developer"
  },
  {
    id: 9,
    name: "Christopher Martus",
    imageSrc: require('@/assets/images/team_photos/christopher_m.jpg'),
    title: "Backend Developer"
  },
  {
    id: 10,
    name: "Christina Trotta",
    imageSrc: require('@/assets/images/team_photos/tina.jpg'),
    title: "Database Developer"
  },
  {
    id: 11,
    name: "Jaison Eccleston",
    imageSrc: require('@/assets/images/team_photos/Jaison.jpeg'),
    title: "Lead Database Developer"
  },
  {
    id: 12,
    name: "Brianna Smith",
    imageSrc: require('@/assets/images/team_photos/brianna.jpg'),
    title: "Frontend Developer"
  },
  {
    id: 13,
    name: "Maryam Judeh",
    imageSrc: require('@/assets/images/team_photos/placeholder.png'),
    title: "Backend Developer"
  },
  {
    id: 14,
    name: "Rong Hu",
    imageSrc: require('@/assets/images/team_photos/ronghu.jpg'),
    title: "Frontend Developer"
  },
  {
    id: 15,
    name: "Jake Phaydavong",
    imageSrc: require('@/assets/images/team_photos/placeholder.png'),
    title: "Frontend Developer"
  }
];

interface TeamMember {
  id: number;
  name: string;
  imageSrc: any; 
  title: string;
}

interface TeamScreenProps {
  filteredData: TeamMember[];
}


function TeamScreen({ filteredData }: TeamScreenProps) {

  const context = useContext(GlobalContext);
  const isDarkMode = context?.isDarkMode;
  
  return (
    <ThemedView style={{ flex: 1, backgroundColor: isDarkMode? "black" : "white"}}>
      <SafeAreaView style={{ flex: 1 }} />
      <FlatList
        data={filteredData} // Pass filtered data
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-evenly" }}
        contentContainerStyle={{ paddingBottom: '25%' }}
        renderItem={({ item }) => (
          <View style={{ alignItems: "center", marginVertical: 10 }}>
            <Image
              source={item.imageSrc} 
              style={{ height: 150, width: 150, borderRadius: 100 }}
            />
            <Text style={{marginTop: 3, fontWeight: 'bold', fontSize: 15, color: isDarkMode? "white" : "black"}}>{item.name}</Text>
            <Text style={{fontSize: 13, color: isDarkMode? "white" : "black"}}>{item.title}</Text>
          </View>
        )}
      />
    </ThemedView>
  );
}


function FallScreen() {
  const fallMembers = data.filter((item) => item.id <= 10);

  return (
    <TeamScreen filteredData={fallMembers} />
  );
}

function WinterScreen() {
  const winterMembers = data.filter((item) => item.id > 10);

  return (
    <TeamScreen filteredData={winterMembers} />
  );
}

const RiptTeamScreen = ({ navigation }: any) => {
  const context = useContext(GlobalContext);  
  const isDarkMode = context?.isDarkMode;

  const [activeTab, setActiveTab] = useState("Fall");

  return (
    <View style={{ flex: 1 }}>
      <View style={[isDarkMode ? styles.darkEntireContainer : styles.entireContainer]}>
        
        {/* Top Section */}
        <View style={styles.topContainer}>
          <View style={{ width: '100%', paddingHorizontal: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? "white" : "black"} />
            </TouchableOpacity>
            <Text style={styles.heading}>Ript Fitness Team</Text>
          </View>

          {/* Conditional image based on tab */}
          <Image
            style={styles.mainImage}
            source={
              activeTab === "Fall"
                ? require('@/assets/images/team-photo-1.jpg')
                : require('@/assets/images/Team-photo-2.jpg') 
            }
          />
        </View>

        {/* Tabs */}
        <View style={{ height: 500 }}>
          <Tab.Navigator
            screenOptions={{
              tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold', color: isDarkMode ? 'white' : 'black' },
              tabBarStyle: { backgroundColor: isDarkMode ? 'black' : '#fff' },
              tabBarIndicatorStyle: { backgroundColor: '#21BFBF', height: 3 },
            }}
            screenListeners={{
              state: (e) => {
                const index = e.data.state.index;
                const tabName = e.data.state.routeNames[index];
                setActiveTab(tabName);
              },
            }}
          >
            <Tab.Screen name="Fall" component={FallScreen} />
            <Tab.Screen name="Winter" component={WinterScreen} />
          </Tab.Navigator>
        </View>
      </View>
    </View>
  );
};

export default RiptTeamScreen;

const styles = StyleSheet.create({
  entireContainer: {
    flex: 1,
    // backgroundColor: 'blue',
  },
  darkEntireContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginTop: Platform.OS === "ios" ? '10%' : 0,
    // backgroundColor: 'green'
  },
  topContainer: {
    height: '40%',
    alignItems: 'center',
    // justifyContent: 'space-evenly',    
    marginTop: Platform.OS === "ios" ? '12%' : 0,
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold',
    marginLeft: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#21BFBF',
    paddingBottom: 15,
  },
  mainImage: {
    width: '80%',
    height: '65%',
    borderRadius: 10,
  },
});