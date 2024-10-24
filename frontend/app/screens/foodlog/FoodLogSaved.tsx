import { TextInput, StyleSheet, ScrollView, Text, View, FlatList } from "react-native";
import React,  { useEffect, useState } from 'react';

const FoodListPage () => {
    const [foods, setfoods] = useState('');
    const [loading, setLoading] = useState(true);


     // Function to fetch all the food items from the database
     const fetchFoods = async () => {
        try {
            const response = await fetch('https://ript-fitness-app.azurewebsites.net/nutritionCalculator/getFood/InsertFoodNameHere', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setFoods(data);  // Update state with food data from API
            setLoading(false);  // Disable loading once data is fetched
        } catch (error) {
            console.error("Error fetching food data: ", error);
        }
    };

    
}