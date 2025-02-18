import { TextInput, StyleSheet, ScrollView, Text, View, FlatList, Alert, TouchableOpacity, Modal } from "react-native";
import React,  { useCallback, useContext, useEffect, useState } from 'react';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { GlobalContext } from "@/context/GlobalContext";
import { httpRequests } from "@/api/httpRequests";
import LogFoodButton from "@/components/foodlog/FoodLogButton";
import { WorkoutScreenNavigationProp } from "@/app/(tabs)/WorkoutStack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Swipeable } from "react-native-gesture-handler";


interface Food {
    id: number;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    multiplier: number;
    isDelted: boolean;
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

const FoodLogLoggedPage = () => { 
    const [foodDetails, setFoodDetails] = useState<Food[]>([]);
    const [loading, setLoading] = useState(true);
    const [cached, setCached] = useState(false);
    const [refreshing, setRefreshing] = useState(false); 
    const [day, setDay] = useState();
    const [dayIndex, setDayIndex] = useState(0);
    const context = useContext(GlobalContext);

     // Prefix all keys with user ID (assuming it's stored in context)
     const userID = context?.data.token; 
     if (!userID) throw new Error("User ID not found");

     const foodTodayKey = `${userID}_foodTodayDetails`;
     const dayKey = `${userID}_day`;

     const isDarkMode = context?.isDarkMode;



    // Function to fetch food details
    const fetchFoods = async () => {
        try {
            const cachedFoodTodayDetails = await AsyncStorage.getItem(foodTodayKey);
            
            if (cachedFoodTodayDetails) {
                console.log("Using cached food details", cachedFoodTodayDetails);
                setFoodDetails(JSON.parse(cachedFoodTodayDetails));
                setCached(true);
            } else {
                console.log("there are no cached foods to use");
                setFoodDetails([]);
                setCached(false);
            }

            // console.log("the day is: ", day);
            const thisDay = await AsyncStorage.getItem(dayKey);
            if (thisDay) {
                setDay(JSON.parse(thisDay));
            } else {
                console.log("Error setting day: ", thisDay);
            }

            // console.log("using this day: ", day);
            // console.log("using this day index: ", dayIndex);

            const response = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/getDayOfLoggedInUser/${dayIndex}`, {
                method: 'GET', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${context?.data.token}`,
                }
            });

            // console.log("response status for get Day of logged in user : ", response.status);

            if (response.status === 200) {
                const dayData = await response.json();
                const foodArray = dayData.foodsEatenInDay;
                const dayID = dayData.id;
                // console.log("Foods today: ", foodArray);
                
                await AsyncStorage.setItem(foodTodayKey, JSON.stringify(foodArray));
                await AsyncStorage.setItem(dayKey, JSON.stringify(dayID));

                // console.log("cached", cached);
                // console.log("loading", loading);
            } else {
                console.log("Error getting day");
                // console.log("day response: ", response.status);
                // console.log("day json: ", response.json());
            }
            
        } catch (error) {
            console.log('Error fetching food details: ', error);
        } finally {
            setLoading(false);
        }
}; 


const saveFoodChanges = async (updatedFood: Food) => {
    // console.log("Updated food: ", updatedFood);
    
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

    //   console.log("UpdatedFoodID", updatedFood.id);
      
    try {
        const response = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/editFood/${updatedFood.id}`, {
            method: "PUT", 
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${context?.data.token}`,
            }, 
            body: body, 
        });

        // console.log(body);
        // console.log(response.status);

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
        // console.log("Logging food: ", food);

        const response = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/addFoodsToDay/${day}`, {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${context?.data.token}`,
            },
            body: body,
        });

        // console.log("Response status for logging food: ", response.status);
        if (response.status === 201) {
            console.log("Successfully logged food to the day.");
            // Optionally update the local state to reflect the change.
            setFoodDetails((prev) => [...prev, food]);
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
        removeFoodFromDay(id);
    };
    
    const removeFoodFromDay = async (id: number) => {
        try {
            const response = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/deleteFoodsInDay/${day}`,
                   {
                       method: "POST", 
                       headers: {
                           'Content-Type': 'application/json',
                           'Authorization': `Bearer ${context?.data.token}`,
                       }, 
                       body: JSON.stringify([id]),
                   });
                //    console.log("Response status: ", response.status);
                   if (response.status === 201) {
                       Alert.alert("Successfully deleted.");
                   } else {
                       console.log("did not delete");
                   }
               } catch (error) {
                   console.error(error);
               }
    }

    const renderItem = ({ item }:{item: Food}) => (
        <Swipeable
            renderLeftActions={() => (
                <View style={styles.swipeDeleteButton}>
                    <Text 
                        style={styles.deleteText}
                        onPress={() => confirmDeleteFood(item.id)}
                    >Delete</Text>
                </View>
            )}
        >
        <FoodItem food={item} saveFoodChanges={saveFoodChanges} logFoodToDay={logFoodToDay}/>
        </Swipeable>
    
    );


    return cached && foodDetails.length > 0 ? (
        <View style={[isDarkMode ? styles.darkBottomContainer : styles.bottomContainer]}>
            <FlatList<Food>
                data={foodDetails}
                renderItem={renderItem}
                keyExtractor={(item) => `${item.id}`}
                refreshing={refreshing} // Add refreshing prop
                onRefresh={onRefresh}  // Add onRefresh callback
            />
        </View>
    ) :  loading ? (
        <View>
             <Text style={styles.message}>Loading...</Text>
        </View>
     ) : foodDetails.length === 0 ? (
        <View>
            <Text style={[isDarkMode? styles.darkMessage : styles.message]}>No food items found.</Text>
        </View>
     ) : (
// {/* THIS IS THE NEW STUFF FOR THE ADD PAGE*/}
        <View style={styles.bottomContainer}>
            {/* Bottom section displaying list of foods */}
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
    foodList :{
        paddingBottom: 20, 
    }, 
    foodItemContainer: {
        position: 'relative',
        padding: 15, 
        backgroundColor: 'white', 
        borderBottomWidth: 1, 
        borderColor: 'black',
        alignItems: 'center',
        flexDirection: 'row',
    }, 
    foodName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    foodTextRight: {
        position: 'absolute',
        fontSize: 16, 
        right: 5, 
    },
    bottomContainer: {
        height: '100%',
        backgroundColor: '#fff',
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
    darkMessage: {
        textAlign: 'center', 
        fontWeight: 'bold', 
        fontSize: 20,
        padding: 30,
        color: 'white',
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

export default FoodLogLoggedPage;