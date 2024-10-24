
import { TextInput, StyleSheet, ScrollView, Text, View, KeyboardAvoidingView, Platform, TouchableOpacity, Dimensions, Button, Alert  } from "react-native";
import React, { useState } from 'react';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemedText } from '@/components/ThemedText';
import { useLayoutEffect } from "react";
import Logged from '@/app/screens/foodlog/FoodLogLogged';
import Saved from '@/app/screens/foodlog/FoodLogSaved';
import Add from '@/app/screens/foodlog/FoodLogAdd';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import MacroButton from "@/components/foodlog/MacroButton";
import AddFoodButton from "@/components/foodlog/AddFoodButton";



/* 
{
  "name": "Pringles",
  "calories": 290,
  "protein": 20,
  "carbs": 30,
  "fat": 10,
  "multiplier": 1.0,
  "isDeleted": false
}

DayDto object  (for addDay endpoint, always make a new Day object empty like below:
{
    "foodsEatenInDay": [],
    "foodIdsInFoodsEatenInDayList": []
}

Array of Food Ids:
[2]
[1, 2, 3] 
*/

//const FoodLogAddScreen: React.FC<FoodLogAddProps> = ({navigation}) => {
const FoodLogAddForm = () => {
    const [foodName, setFoodName] = useState('');
    const [foodCalories, setCalories] = useState('');
    const [foodFat, setFat] = useState('');
    const [foodCarbs, setCarbs] = useState('');
    const [foodProtein, setProtein] = useState('');
    const [day, setDay] = useState('');


    const handleFoodDataSaveOnly = async () => {
        const foodData = {
            name: foodName, 
            calories: foodCalories, 
            protein: foodProtein,
            carbs: foodCarbs,  
            fat: foodFat, 
            multiplier: 1.0, 
            isDelted: false, 
        };

        try {
            const response = await fetch('https://ript-fitness-app.azurewebsites.net/nutritionCalculator/addFood', { 
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(foodData),
            }, 
            );
            if (response.status === 201) {
                console.log('Success', 'Food data saved successfully!');
                Alert.alert("Success", 'Food data saved successfully!');
              } else {
                console.log('Error', 'Failed to save food data.');
                Alert.alert("Error", 'Failed to save food data');
              }
        } catch (error) {
              console.log('Error', 'An error occurred. Please try again.');
        }
    };

    const handleFoodDataSaveAddDay = async () => {
        const foodData = {
            name: foodName, 
            calories: foodCalories, 
            protein: foodProtein,
            carbs: foodCarbs,  
            fat: foodFat, 
            multiplier: 1.0, 
            isDelted: false, 
        };

        const dayData = {
            foodsEatenInDay: [],
            foodIdsInFoodsEatenInDayList: []
        }

        //This will create a new day everytime the user logs a new food today so will need to change this later.
        try {
            const response = await fetch('https://ript-fitness-app.azurewebsites.net/nutritionCalculator/addDay', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                }, 
                body: JSON.stringify(dayData),
            });
            if (response.status === 201) {
                const data = await response.json();
                setDay(data.id);
                console.log('New Day ID: ', day);
                console.log('Success', 'Food data saved successfully!');
                Alert.alert("Success", 'Food data saved successfully!');
              } else {
                console.log('Error', 'Failed to save food data.');
                Alert.alert("Error", 'Failed to save food data');
              }
        } catch {
            console.log('Error', 'An error occurred. Please try again.');
        }

        try {
            const response = await fetch(`https://ript-fitness-app.azurewebsites.net/nutritionCalculator/addFoodsToDay/${day}`, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                }, 
                body: JSON.stringify([34,33]),
            });
            // const response = await fetch('https://ript-fitness-app.azurewebsites.net/nutritionCalculator/addFood', { 
            //     method: 'POST', 
            //     headers: {
            //         'Content-Type': 'application/json',
            //       },
            //       body: JSON.stringify(foodData),
            // });
            if (response.status === 201) {
                console.log('Success', 'Food data saved successfully!');
                Alert.alert("Success", 'Food data saved successfully!');
              } else {
                console.log('Error', 'Failed to save food data.');
                Alert.alert("Error", 'Failed to save food data');
              }
        } catch (error) {
              console.log('Error', 'An error occurred. Please try again.');
        }

    };
        
    
    const navigation = useNavigation();


    return(
// {/* THIS IS THE NEW STUFF FOR THE ADD PAGE*/}
<View>
        <ScrollView>
            <View style={styles.addFoodContainer}>
                <Text style={styles.label}>New Food:</Text>

            {/* Input fields */}
            <View style = {styles.row}>
            <Text style={styles.inputLabel}>Name:</Text>
            <TextInput
                style={styles.input}
                value={foodName}
                onChangeText={setFoodName}
                placeholder="Food Name"
                
            /></View>

            <View style = {styles.row}>
            <Text style={styles.inputLabel}>Calories:</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={foodCalories}
                onChangeText={setCalories}
                placeholder="Calories"
            /></View>

            <View style = {styles.row}>
            <Text style={styles.inputLabel}>Fat (g):</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={foodFat}
                onChangeText={setFat}
                placeholder="Total Fat"
            /></View>

            <View style = {styles.row}>
            <Text style={styles.inputLabel}>Carbs (g):</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={foodCarbs}
                onChangeText={setCarbs}
                placeholder="Total Carbohydrates"
            /></View>

            <View style = {styles.row}>
            <Text style={styles.inputLabel}>Protein (g):</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={foodProtein}
                onChangeText={setProtein}
                placeholder="Total Protein"
            /></View>

            {/* Save button */}
            <View style={styles.row}>
                <AddFoodButton   
                        title="Save Food" 
                        textColor="white"
                        backgroundColor="#F2846C"
                        borderWidth={1}
                        fontSize={16}
                        width={150}
                        onPress={handleFoodDataSaveOnly} />
                <AddFoodButton   
                        title="Log Food Today" 
                        textColor="white"
                        backgroundColor="#088C7F"
                        borderWidth={1}
                        fontSize={16}
                        width={150}
                        onPress={handleFoodDataSaveAddDay} />
            </View>
            </View>
        </ScrollView>
</View>
    );
    };
const styles = StyleSheet.create({
    addFoodContainer: {
        padding: 20,
      },
      label: {
        fontSize: 20,
        marginBottom: 10,
      },
      input: {
        flex: 100,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 5,
        marginVertical: 5,
        borderRadius: 5,
      },
      inputLabel: {
        fontSize: 16,
        marginRight: 10, // Space between the label and input
        width: 100, // Adjust width based on your layout needs
      },
      row: {
        flexDirection: 'row', // Align items in a row
        alignItems: 'center', // Vertically center the text and input
        marginBottom: 10,
      }, 
})

export default FoodLogAddForm;