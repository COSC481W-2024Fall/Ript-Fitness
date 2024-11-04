import { TextInput, StyleSheet, ScrollView, Text, View, FlatList, Alert } from "react-native";
import React,  { useContext, useEffect, useState } from 'react';
import { useNavigation } from "@react-navigation/native";
import { GlobalContext } from "@/context/GlobalContext";
import { httpRequests } from "@/api/httpRequests";
import LogFoodButton from "@/components/foodlog/FoodLogButton";
import { WorkoutScreenNavigationProp } from "@/app/(tabs)/WorkoutStack";


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

const FoodItem: React.FC<{ food: Food }> =  ({ food }) => {
    const navigation = useNavigation<WorkoutScreenNavigationProp>();
    return (
    <LogFoodButton 
        id={food.id}
        name={food.name}
        calories={food.calories}
        protein={food.protein}
        carbs={food.carbs}
        fat={food.fat}
        multiplier={food.multiplier}
        textColor="black"
        backgroundColor='white'
        borderWidth={1}
        fontSize={16}
        width ='100%'
        onPress={() => navigation.navigate('ApiScreen', {})}
        />
    )
};

const getFoodDetails = async (foodId: any) => {

}

const FoodLogSavedPage = () => { 
    const [foodDetails, setFoodDetails] = useState<Food[]>([]);

    const context = useContext(GlobalContext);

    // Function to fetch food details based on the food ID
    const fetchFoodIDs = async () => {
        try {
            const response = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/getFoodIdsOfLoggedInUser`, {
                method: 'GET', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${context?.data.token}`,
                }
            });
            if (response.status === 200) {
                const foodIDs = await response.json();
                setFoodDetails(foodIDs);
                // console.log('Fetched food IDs: ', foodIDs);
                
                // handle fetching and displaying food details for all IDs 
                const detailsArray = await Promise.all(foodIDs.map((id: number) => fetchingSingleFoodDetail(id)));

                // Filter out any failed requests
                const validDetails = detailsArray.filter((food) => food !== null);
                validDetails.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by food name
                setFoodDetails(validDetails);
            } else {
                // console.error('Failed to fetch food details');
                return null; 
            }
        } catch (error) {
            console.log('Error fetching food details: ', error);
        }
    }; 
    const fetchingSingleFoodDetail = async (foodID: number) => {
        try {
            const response = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/getFood/${foodID}`, {
                method: 'GET', 
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${context?.data.token}`,
                }
            });

            if (response.status === 200) {
                const foodData = await response.json();
                // console.log(`Fetched details for food ID ${foodID}: `, foodData);
                return foodData; 
            } else {
                // console.error(`Failed to fetch details for food ID: ${foodID}`);
                return null;
            }
        } catch (error) {
            console.log(`Error fetching details for food ID ${foodID}:`, error);
            return null;
        }
    };


    useEffect(() => {
        fetchFoodIDs();
    }, []);

    const renderItem = ({ item }:{item: Food}) => <FoodItem food={item} />;


    return(
        <View>

                   
                    <FlatList
                        data={foodDetails}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => `${item.name}-${index}`}
                        contentContainerStyle={styles.foodList}
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
        paddingBottom: 29,
        height: '100%',
    }
})

export default FoodLogSavedPage;