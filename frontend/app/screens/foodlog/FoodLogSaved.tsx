import { TextInput, StyleSheet, ScrollView, Text, View, FlatList, Alert, TouchableOpacity, Modal, TouchableWithoutFeedback, Dimensions } from "react-native";
import React,  { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { GlobalContext } from "@/context/GlobalContext";
import { httpRequests } from "@/api/httpRequests";
import LogFoodButton from "@/components/foodlog/FoodLogButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Swipeable } from 'react-native-gesture-handler';
import CustomSearchBar from '@/components/custom/CustomSearchBar';
import { Ionicons } from "@expo/vector-icons";
import CustomTextInput from "@/components/custom/CustomTextInput";

interface Food {
    id: number;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    multiplier: number;
    isDeleted: boolean;
}

const FoodItem: React.FC<{ food: Food; saveFoodChanges: (food: Food) => void; logFoodToDay: (food: Food) => void}> =  ({ food, saveFoodChanges, logFoodToDay}) => {    
    return(
        <LogFoodButton 
            id={food.id}
            name={food.name}
            calories={food.calories}
            protein={food.protein}
            carbs={food.carbs}
            fat={food.fat}
            multiplier={food.multiplier}
            saveFoodChanges={(updatedFood) => saveFoodChanges(updatedFood)}
            logFoodToDay={(updatedFood) => logFoodToDay(updatedFood)}
            textColor="black"
            backgroundColor='#EDEDED'
            borderWidth={0}
            fontSize={16}
            width ='95%'
            />
    );
    };


const FoodLogSavedPage = () => { 
    const [foodDetails, setFoodDetails] = useState<Food[]>([]);
    const [filteredFoodDetails, setFilteredFoodDetails] = useState<Food[]>([]); // For filtered data
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [cached, setCached] = useState(false);
    const [refreshing, setRefreshing] = useState(false); 
    const [day, setDay] = useState();
    const context = useContext(GlobalContext);
    const { width } = Dimensions.get("window");
    const isDarkMode = context?.isDarkMode;



     // Prefix all keys with user ID (assuming it's stored in context)
     const userID = context?.data.token; 
     if (!userID) throw new Error("User ID not found");

     const foodKey = `${userID}_foodDetails`;
     const dayKey = `${userID}_day`;

    
    const fetchFoods = async () => {
        try {
            console.log("Fetching food details...");
            const cachedFoodDetails = await AsyncStorage.getItem(foodKey);
            
            if (cachedFoodDetails) {
                console.log("Using cached food details");
                setCached(true);
                setFoodDetails(JSON.parse(cachedFoodDetails));
                setFilteredFoodDetails(JSON.parse(cachedFoodDetails)); // Initialize filtered data
            } 
                const response = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/getFoodsOfLoggedInUser/0/200`,
                {
                    method: "GET", 
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${context?.data.token}`,
                    }
                });
            
                if (response.status === 200) {

                    const foodArray = await response.json();
                   
                    // Ensure the array is sorted by food name alphabetically
                    foodArray.sort((a: Food, b: Food) => a.name.localeCompare(b.name));

                    console.log("Fetched and sorted food details:", foodArray);
                    setFoodDetails(foodArray);
                    setFilteredFoodDetails(foodArray); // Initialize filtered data

                     // Cache the sorted food details
                    await AsyncStorage.setItem(foodKey, JSON.stringify(foodArray));
                } else {
                    console.log("Failed to fetch food IDs. Status:", response.status);
                }
            
        } catch (error) {
            console.error("Error fetching food IDs or details:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveFoodChanges = async (updatedFood: Food) => {
        console.log("Updated food: ", updatedFood);
        
        function customJSONStringify(obj: any, keysOrder: string[]): string {
            const orderedObj: any = {};
            for (const key of keysOrder) {
              if (key in obj) {
                orderedObj[key] = obj[key];
              }
            }
            return JSON.stringify(orderedObj);
          }
          
          // Specify the desired order of keys
          const keysOrder = ["name", "calories", "protein", "carbs", "fat", "multiplier", "isDeleted"];
          
          // Serialize updatedFood with the desired key order
          const body = customJSONStringify(updatedFood, keysOrder);

          console.log("UpdatedFoodID", updatedFood.id);
          
        try {
            const response = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/editFood/${updatedFood.id}`, {
                method: "PUT", 
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${context?.data.token}`,
                }, 
                body: body, 
            });

            console.log(body);
            console.log(response.status);

            if (response.status === 200) {
                //update local state with the updated food details 
                setFoodDetails((prev) => 
                prev.map((food) => (food.id === updatedFood.id ? updatedFood : food))
                );
            } else {
                console.error("Failed to save food changes");
            }
        } catch (error) {
            console.error("Error saving food changes: ", error);
        }
    };

    const logFoodToDay = async (food: Food) => {
        try {
            
            const body = JSON.stringify([food.id]);
            console.log("Logging food: ", food);
    
            const response = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/addFoodsToDay/${day}`, {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${context?.data.token}`,
                },
                body: body,
            });
    
            console.log("Response status for logging food: ", response.status);
            if (response.status === 201) {
                console.log("Successfully logged food to the day.");
                Alert.alert("Success", "Successfully added food to day.");
                // Optionally update the local state to reflect the change.
                // setFoodDetails((prev) => [...prev, food]);
            } else {
                console.error("Failed to log food.");
            }
        } catch (error) {
            console.error("Error logging food to day: ", error);
        }
    };

    const onRefresh = async () => {
        // Triggered when user performs a pull-to-refresh action
        console.log("Refreshing food details...");
        setRefreshing(true);
        await fetchFoods();
        setRefreshing(false);
    };

    useFocusEffect(
        useCallback(() => {
            fetchFoods();
        }, [])
    );

    useEffect(() => {
        const fetchDayID = async () => {
            const dayID = await AsyncStorage.getItem(dayKey);
            console.log(dayID); // Should print the stored ID
            if(dayID) {
                setDay(JSON.parse(dayID));
            } else {
                console.log("dayID is null");
            }
        };
        fetchDayID();
    }, []);


    // Show a confirmation before deleting a food
  const confirmDeleteFood = (id: number) => {
    Alert.alert(
      "Delete Food",
      "Are you sure you want to delete this food?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => removeFood(id) }
      ]
    );
  };

    // Remove a food by ID
    const removeFood = (id: number) => {
        setFoodDetails(foodDetails.filter((food) => food.id !== id));   
        removeFromDatabase(id);
    };

    const removeFromDatabase = async (id: number) => {
        try {
         const response = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/deleteFood/${id}`,
                {
                    method: "DELETE", 
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${context?.data.token}`,
                    }
                });
                console.log("Response status: ", response.status);
                if (response.status === 200) {
                    Alert.alert("Successfully deleted.");
                } else {
                    console.log("did not delete");
                }
            } catch (error) {
                console.error(error);
            };
    };

    const filteredFoods = foodDetails.filter((food: any) =>
        food.name.toLowerCase().includes(searchText.toLowerCase())
      );


    const renderItem = ({ item }:{item: Food}) => (
        <Swipeable
            renderLeftActions={() => (
            <View style={styles.swipeDeleteButton}>
                <Text
                    style={styles.deleteText}
                    onPress={() => confirmDeleteFood(item.id)}
                >
                Delete
                </Text>
            </View>
        )}
        >
        
        <FoodItem food={item} saveFoodChanges={saveFoodChanges} logFoodToDay={logFoodToDay}/> 
            
        </Swipeable>
    );


    return cached ? (
        <View style={[isDarkMode? styles.darkBottomContainer : styles.bottomContainer]}>
            <View style={styles.searchContainer}>
                <Ionicons
                name="search-outline"
                size={20}
                color="#747474"
                style={styles.iconContainer}
                />
                <CustomTextInput
                placeholder="Search"
                placeholderTextColor="#999"
                width={width * 0.85}
                value={searchText}
                onChangeText={setSearchText}
                style={{
                    borderWidth: 0,
                    fontSize: 16,
                    paddingLeft: 30,
                    borderRadius: 25,
                    backgroundColor: "#EDEDED",
                    // width: '90%'
                }}
        />
        </View>
            <FlatList 
                data={filteredFoods}
                renderItem={renderItem}
                keyExtractor={(item) => `${item.id}`}
                refreshing={refreshing} // Add refreshing prop
                onRefresh={onRefresh}  // Add onRefresh callback
            />
        </View>
    ) : loading ? (
        <View style={[isDarkMode ? styles.darkBottomContainer : styles.bottomContainer]}>
           <View style={styles.searchContainer}>
                <Ionicons
                name="search-outline"
                size={20}
                color="#747474"
                style={styles.iconContainer}
                />
                <CustomTextInput
                placeholder="Search"
                placeholderTextColor="#999"
                width={width * 0.85}
                value={searchText}
                onChangeText={setSearchText}
                style={{
                    borderWidth: 0,
                    fontSize: 16,
                    paddingLeft: 30,
                    borderRadius: 25,
                    backgroundColor: "#EDEDED",
                }}
        />
        </View>
            <Text style={styles.message}>Loading...</Text>
       </View>
    ) : foodDetails.length === 0 ? (
        <View style={[isDarkMode? styles.darkBottomContainer : styles.bottomContainer]}>
           <View style={styles.searchContainer}>
                <Ionicons
                name="search-outline"
                size={20}
                color="#747474"
                style={styles.iconContainer}
                />
                <CustomTextInput
                placeholder="Search"
                placeholderTextColor="#999"
                width={width * 0.85}
                value={searchText}
                onChangeText={setSearchText}
                style={{
                    borderWidth: 0,
                    fontSize: 16,
                    paddingLeft: 30,
                    borderRadius: 25,
                    backgroundColor: "#EDEDED",
                }}
        />
        </View>
            <Text style={styles.message}>No food items logged.</Text>
        </View>
    ) : (
        <View style={[isDarkMode ? styles.darkBottomContainer : styles.bottomContainer]}>
            <View style={{alignContent: 'center'}}>
          <View style={styles.searchContainer}>
                <Ionicons
                name="search-outline"
                size={20}
                color="#747474"
                style={styles.iconContainer}
                />
                <CustomTextInput
                placeholder="Search"
                placeholderTextColor="#999"
                width={width * 0.85}
                value={searchText}
                onChangeText={setSearchText}
                style={{
                    borderWidth: 0,
                    fontSize: 16,
                    paddingLeft: 30,
                    borderRadius: 25,
                    backgroundColor: "#EDEDED",
                }}
        />
        </View>
            </View>

            <FlatList 
                data={foodDetails}
                renderItem={renderItem}
                keyExtractor={(item) => `${item.id}`}
                refreshing={refreshing} // Add refreshing prop
                onRefresh={onRefresh}  // Add onRefresh callback
            />
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        justifyContent: "center",
        alignSelf: 'center',
        paddingTop: 15,
      },
      iconContainer: {
        position: "absolute",
        paddingTop: 15,
        paddingLeft: 7,
        zIndex: 1,
      },
    container: {
        flex: 1, 
        padding: 20,
    },
    foodList :{
        paddingBottom: 20, 
    }, 
    foodItemContainer: {
        padding: 30, 
        backgroundColor: 'white', 
        borderBottomWidth: 1, 
        borderColor: 'black',
        alignItems: 'center',
        flexDirection: 'row',
    }, 
    foodName: {
        position: 'absolute',
        fontSize: 16,
        fontWeight: 'bold',
        left: 10, 
    },
    foodTextRight: {
        position: 'absolute',
        fontSize: 16, 
        right: 10, 
    },
    bottomContainer: {
        height: '100%',
        backgroundColor: '#fff',
        // alignItems: 'center',
    }, 
    darkBottomContainer: {
        height: '100%',
        backgroundColor: 'black',
    }, 
    message: {
        textAlign: 'center', 
        fontWeight: 'bold', 
        fontSize: 20,
        padding: 30,
    }, 
    swipeDeleteButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 85,
        height: '80%',
        marginTop: 7,
        // borderRadius: 10,
      },
      deleteText: {
        color: 'white',
        fontWeight: 'bold',
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
      },
      modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
      },
})

export default FoodLogSavedPage;