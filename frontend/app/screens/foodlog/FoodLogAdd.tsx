
import { TextInput, StyleSheet, ScrollView, Text, View, KeyboardAvoidingView, Platform, TouchableOpacity, Dimensions, Button, Alert  } from "react-native";
import React, { useContext, useEffect, useState } from 'react';
import { Modal } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import AddFoodButton from "@/components/foodlog/AddFoodButton";
import BarcodeScannerButton from "@/components/foodlog/BarcodeScannerButton";
import  Scanner  from "@/components/foodlog/scanner";
import { httpRequests } from "@/api/httpRequests";
import { GlobalContext } from "@/context/GlobalContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AlignJustify } from "react-native-feather";

//Need to figure out how to get the day to work on login and then not switch until the next day 


const FoodLogAddPage = () => {
// export default async function FoodLogAddPage() {
    const [foodName, setFoodName] = useState('');
    const [foodCalories, setCalories] = useState('');
    const [foodFat, setFat] = useState('');
    const [foodCarbs, setCarbs] = useState('');
    const [foodProtein, setProtein] = useState('');
    const [foodCholesterol, setCholesterol] = useState('');
    const [foodSaturatedFat, setSaturatedFat] = useState('');
    const [foodTransFat, setTransFat] = useState('');
    const [foodSodium, setSodium] = useState('');
    const [foodFiber, setFiber] = useState('');
    const [foodSugars, setSugars] = useState('');
    const [foodCalcium, setCalcium] = useState('');
    const [foodIron, setIron] = useState('');
    const [foodPotassium, setPotassium] = useState('');

    const [foodServings, setServings] = useState('');
    const [totalCalories, setTotalCalories] = useState(0);
    const [totalFat, setTotalFat] = useState(0);
    const [totalCarbs, setTotalCarbs] = useState(0);
    const [totalProtein, setTotalProtein] = useState(0);
    const [totalWater, setTotalWater] = useState(0);
    const [totalCholesterol, setTotalCholesterol] = useState(0);
    const [totalSaturatedFat, setTotalSaturatedFat] = useState(0);
    const [totalTransFat, setTotalTransFat] = useState(0);
    const [totalSodium, setTotalSodium] = useState(0);
    const [totalFiber, setTotalFiber] = useState(0);
    const [totalSugars, setTotalSugars] = useState(0);
    const [totalCalcium, setTotalCalcium] = useState(0);
    const [totalIron, setTotalIron] = useState(0);
    const [totalPotassium, setTotalPotassium] = useState(0);

    const [day, setDay] = useState();
    const context = useContext(GlobalContext);
    const [scannerVisible, setScannerVisible] = useState(false);
    const isDarkMode = context?.isDarkMode;


     // Prefix all keys with user ID (assuming it's stored in context)
     const userID = context?.data.token; 
     if (!userID) throw new Error("User ID not found");

     const foodTodayKey = `${userID}_foodTodayDetails`;
     const foodKey = `${userID}_foodDetails`;
     const dayKey = `${userID}_day`;

     async function fetchFoodData(barcode: string) {
        const token = context?.data?.token;
        if (!token) {
            console.error("Token is undefined.");
            return;
        }
        try {
            // Use httpRequests.get instead of fetch + response.status
            const data = await httpRequests.get(`/nutritionCalculator/getFoodByBarcode/${barcode}`, token);

            // If no data or missing name, show alert
            if (!data || !data.name) {
                Alert.alert("Error", "Food not found in database.");
                return;
            }

            // Update states with the returned data
            setFoodName(data.name || "Unknown");
            setCalories(data.calories?.toString() || "0");
            setCarbs(data.carbs?.toString() || "0");
            setProtein(data.protein?.toString() || "0");
            setFat(data.fat?.toString() || "0");
            setCholesterol(data.cholesterol?.toString() || "0");
            setSaturatedFat(data.saturatedFat?.toString() || "0");
            setTransFat(data.transFat?.toString() || "0");
            setSodium(data.sodium?.toString() || "0");
            setFiber(data.fiber?.toString() || "0");
            setSugars(data.sugars?.toString() || "0");
            setCalcium(data.calcium?.toString() || "0");
            setPotassium(data.potassium?.toString() || "0");

            Alert.alert("Success", `Food Found: ${data.name}`);
        } catch (error) {
            console.error("Error fetching food data:", error);
            Alert.alert("Error", "Failed to fetch food details.");
        }
    }

    const setTotalForDay = async () => {
        console.log("the day is: ", day);
        const thisDay = await AsyncStorage.getItem(dayKey);
        if (thisDay) {
            setDay(JSON.parse(thisDay));
        } else {
            console.log("Error setting day: ", thisDay);
        }

        try {
            console.log("day", day);
            const getDayResponse = await fetch (`${httpRequests.getBaseURL()}/nutritionCalculator/getDayOfLoggedInUser/0`, {
                method: 'GET', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${context?.data.token}`,
                }
            }); 
            console.log(getDayResponse.status);

            if (getDayResponse.status == 200) {
                const dayData = await getDayResponse.json(); 
                console.log(dayData);
                setTotalCalories(dayData.calories); 
                setTotalCarbs(dayData.totalCarbs);
                setTotalProtein(dayData.totalProtein);
                setTotalFat(dayData.totalFat);
                setTotalCholesterol(dayData.totalCholesterol);
                setTotalSaturatedFat(dayData.totalSaturatedFat);
                setTotalTransFat(dayData.totalTransFat);
                setTotalSodium(dayData.totalSodium);
                setTotalFiber(dayData.totalFiber);
                setTotalSugars(dayData.totalSugars);
                setTotalCalcium(dayData.totalCalcium);
                setTotalIron(dayData.totalIron);
                setTotalPotassium(dayData.totalPotassium);

                // updateMacros(dayData.calories, dayData.totalFat, dayData.totalCarbs, dayData.totalProtein);
            } else {
                console.log('Failed to get day');
                return; 
            }
        } catch (error) {
            console.log('Error', 'An error occurred. Please try again.');
        }
    }

    //This is in case we want to ensure food names are unique... i think this is a feature we decided against for now. 

    // const doesFoodExist = async (foodName: string) => {
    //     try {
    //         const response = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/getFoodsOfLoggedInUser/0/200`, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${context?.data.token}`,
    //             }
    //         });
    
    //         if (response.status === 200) {
    //             const foods = await response.json(); // Assume this returns an array of food objects
    
    //             // Check if any food's name matches the input foodName
    //             return foods.some((food: any) => food.name && food.name.toLowerCase() === foodName.toLowerCase());
    //         } else {
    //             console.log('Error fetching foods');
    //             return false;
    //         }
    //     } catch (error) {
    //         console.log('Error', 'An error occurred while checking for duplicate food.');
    //         return false;
    //     }
    // };
    
    const handleFoodDataSaveOnly = async () => {
        // Check if food with the same name exists
        // const foodExists = await doesFoodExist(foodName);
        // if (foodExists) {
        //     Alert.alert("Error", "A food with this name already exists. Please use a different name.");
        // return;
        // }
        const foodData = {
            name: foodName, 
            calories: foodCalories, 
            protein: foodProtein,
            carbs: foodCarbs,  
            fat: foodFat, 
            cholestreol: foodCholesterol,
            saturatedfat: foodSaturatedFat,
            transfat: foodTransFat,
            sodium: foodSodium,
            fiber: foodFiber,
            sugar: foodSugars,
            calcium: foodCalcium,
            iron: foodIron,
            potassium: foodPotassium,
            serving: foodServings, 
            isDeleted: false, 
        };
        
        try {
            const response = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/addFood`, { 
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${context?.data.token}`,
                  },
                  body: JSON.stringify(foodData),
            }, 
            );
            if (response.status === 201) {
                Alert.alert("Success", 'Food data saved successfully!');
              } else {
                Alert.alert("Error", 'Failed to save food data');
              }
        } catch (error) {
              console.log('Error', 'An error occurred. Please try again.');
        }
    };


    const handleFoodDataSaveAddDay = async () => {
    //     const foodExists = await doesFoodExist(foodName);
    //     if (foodExists) {
    //         Alert.alert("Error", "A food with this name already exists. Please use a different name.");
    //     return;
    // }
        const foodData = {
            name: foodName, 
            calories: foodCalories, 
            protein: foodProtein,
            carbs: foodCarbs,  
            fat: foodFat, 
            cholestreol: foodCholesterol,
            saturatedfat: foodSaturatedFat,
            transfat: foodTransFat,
            sodium: foodSodium,
            fiber: foodFiber,
            sugar: foodSugars,
            calcium: foodCalcium,
            iron: foodIron,
            potassium: foodPotassium,
            serving: foodServings, 
            isDeleted: false, 
        };

        console.log("the day is: ", day);
        const thisDay = await AsyncStorage.getItem(dayKey);
        if (thisDay) {
            setDay(JSON.parse(thisDay));
        } else {
            console.log("Error setting day: ", thisDay);
        }

        // first add food to the database
        try {
            console.log("day in foodadd: ", day);
            const foodResponse = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/addFood`, { 
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${context?.data.token}`,
                },
                body: JSON.stringify(foodData),
            },
            );
            console.log("foodResponseAdd status: ", foodResponse.status);
            console.log("day id: ", day);

            if (foodResponse.status === 201) {
                const foodData = await foodResponse.json();
                const foodID = foodData.id;
                console.log("day in foodlog add: ", day);
                
                const addResponse = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/addFoodsToDay/${day}`, {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${context?.data.token}`,
                    }, 
                    body: JSON.stringify([foodID]),
                });
                console.log("add to day response status", addResponse.status);
                if (addResponse.status === 201) {
                    console.log('Success', 'Food data added to day successfully!');
                    setTotalForDay();
                    clearInputFields();
                } else {
                    console.log('Error', 'Failed to save food data to day.');
                }
                // console.log('Success', 'Food data saved successfully!');
                Alert.alert("Success", 'Food data saved successfully!');
            } else {    
                // console.log('Error', 'Failed to save food data.');
                Alert.alert("Error", 'Failed to save food data');
            }
        } catch {
            console.log('Error', 'An error occurred. Please try again.');
        }
    };

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
        
    // Helper function to clear input fields
    const clearInputFields = () => {
        setFoodName('');
        setCalories('');
        setFat('');
        setCarbs('');
        setProtein('');
        setCholesterol('');
        setSaturatedFat('');
        setTransFat('');
        setSodium('');
        setFiber('');
        setSugars('');
        setCalcium('');
        setIron('');
        setPotassium('');
    };


    //Section for validating inputs 
    const [validCals, setValidCals] = useState(true);
    const [validFat, setValidFat] = useState(true);
    const [validCarbs, setValidCarbs] = useState(true);
    const [validProtein, setValidProtein] = useState(true);
    const [validCholesterol, setValidCholesterol] = useState(true);
    const [validSaturatedFat, setValidSaturatedFat] = useState(true);
    const [validTransFat, setValidTransFat] = useState(true);
    const [validSodium, setValidSodium] = useState(true);
    const [validFiber, setValidFiber] = useState(true);
    const [validSugars, setValidSugars] = useState(true);
    const [validCalcium, setValidCalcium] = useState(true);
    const [validIron, setValidIron] = useState(true);
    const [validPotassium, setValidPotassium] = useState(true);
    const [validServings, setValidServings] = useState(true);
    const [validName, setValidName] = useState(true);

    const handleFoodNameChange = (text: string) => {
        setFoodName(text);
        setValidName(text.trim().length > 0);
    }

    const handleCaloriesChange = (text: string) => {
        if ((/^\d*\.?\d*$/.test(text) && parseFloat(text) >= 0)) {
            setCalories(text);
            setValidCals(true);
        } else {
            setCalories('');
            setValidCals(false);
        }
    };
    
    const handleFatChange = (text: string) => {
        if ((/^\d*\.?\d*$/.test(text) && parseFloat(text) >= 0)) {
            setFat(text);
            setValidFat(true);
        } else {
            setFat('');
            setValidFat(false);
        }
    };
    
    const handleCarbsChange = (text: string) => {
        if ((/^\d*\.?\d*$/.test(text) && parseFloat(text) >= 0)) {
            setCarbs(text);
            setValidCarbs(true);
        } else {
            setCarbs('');
            setValidCarbs(false);
        }
    };
    
    const handleProteinChange = (text: string) => {
        if ((/^\d*\.?\d*$/.test(text) && parseFloat(text) >= 0)) {
            setProtein(text);
            setValidProtein(true);
        } else {
            setProtein('');
            setValidProtein(false);
        }
    };
    
    const handleServingsChange = (text: string) => {
        if ((/^\d*\.?\d*$/.test(text) && parseFloat(text) >= 0) && text.trim().length > 0) {
            setServings(text);
            setValidServings(true);
        } else {
            setServings('');
            setValidServings(false);
        }
    };
    const handleCholesterolChange = (text: string) => {
        if ((/^\d*\.?\d*$/.test(text) && parseFloat(text) >= 0)) {
            setCholesterol(text);
            setValidCholesterol(true);
        } else {
            setCholesterol('');
            setValidCholesterol(false);
        }
    };
    
    const handleSaturatedFatChange = (text: string) => {
        if ((/^\d*\.?\d*$/.test(text) && parseFloat(text) >= 0)) {
            setSaturatedFat(text);
            setValidSaturatedFat(true);
        } else {
            setSaturatedFat('');
            setValidSaturatedFat(false);
        }
    };
    
    const handleTransFatChange = (text: string) => {
        if ((/^\d*\.?\d*$/.test(text) && parseFloat(text) >= 0)) {
            setTransFat(text);
            setValidTransFat(true);
        } else {
            setTransFat('');
            setValidTransFat(false);
        }
    };
    
    const handleSodiumChange = (text: string) => {
        if ((/^\d*\.?\d*$/.test(text) && parseFloat(text) >= 0)) {
            setSodium(text);
            setValidSodium(true);
        } else {
            setSodium('');
            setValidSodium(false);
        }
    };
    
    const handleFiberChange = (text: string) => {
        if ((/^\d*\.?\d*$/.test(text) && parseFloat(text) >= 0)) {
            setFiber(text);
            setValidFiber(true);
        } else {
            setFiber('');
            setValidFiber(false);
        }
    };
    
    const handleSugarsChange = (text: string) => {
        if ((/^\d*\.?\d*$/.test(text) && parseFloat(text) >= 0)) {
            setSugars(text);
            setValidSugars(true);
        } else {
            setSugars('');
            setValidSugars(false);
        }
    };
    
    const handleCalciumChange = (text: string) => {
        if ((/^\d*\.?\d*$/.test(text) && parseFloat(text) >= 0)) {
            setCalcium(text);
            setValidCalcium(true);
        } else {
            setCalcium('');
            setValidCalcium(false);
        }
    };
    
    const handleIronChange = (text: string) => {
        if ((/^\d*\.?\d*$/.test(text) && parseFloat(text) >= 0)) {
            setIron(text);
            setValidIron(true);
        } else {
            setIron('');
            setValidIron(false);
        }
    };
    
    const handlePotassiumChange = (text: string) => {
        if ((/^\d*\.?\d*$/.test(text) && parseFloat(text) >= 0)) {
            setPotassium(text);
            setValidPotassium(true);
        } else {
            setPotassium('');
            setValidPotassium(false);
        }
    };

    const validateAllFields = () => {
        const isNameValid = foodName.trim().length > 0;
    //     const isCalsValid = /^\d*\.?\d*$/.test(foodCalories) && parseFloat(foodCalories) >= 0;
    //     const isFatValid = /^\d*\.?\d*$/.test(foodFat) && parseFloat(foodFat) >= 0;
    //     const isCarbsValid = /^\d*\.?\d*$/.test(foodCarbs) && parseFloat(foodCarbs) >= 0;
    //     const isProteinValid = /^\d*\.?\d*$/.test(foodProtein) && parseFloat(foodProtein) >= 0;
    //     const isServingsValid = /^\d*\.?\d*$/.test(foodServings) && parseFloat(foodServings) >= 0;

        setValidName(isNameValid);
    //     setValidCals(isCalsValid);
    //     setValidFat(isFatValid);
    //     setValidCarbs(isCarbsValid);
    //     setValidProtein(isProteinValid);
    //     setValidServings(isServingsValid);
        
    //     return (
    //         validName &&
    //         validCals &&
    //         validFat &&
    //         validCarbs &&
    //         validProtein &&
    //         validServings
    //     );
        return (validName);
    };

    const handleBlur = (field: string, value: string) => {
        if (field == 'foodName') {
            setValidName(value.trim().length > 0);
        }
        // switch (field) {
        //     case 'foodName':
        //         setValidName(value.trim().length > 0);
        //         break;
        //     case 'calories':
        //         setValidCals(/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0);
        //         break;
        //     case 'fat':
        //         setValidFat(/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0);
        //         break;
        //     case 'carbs':
        //         setValidCarbs(/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0);
        //         break;
        //     case 'protein':
        //         setValidProtein(/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0);
        //         break;
        //     case 'servings':
        //         setValidServings(/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0);
        //         break;
        //     default:
        //         break;
        // }
    };

    return(

        <KeyboardAwareScrollView 
            style={{ flex: 1, backgroundColor: isDarkMode? 'black' : '#fff' }}
            //behavior={Platform.OS === "ios" ? "padding" : "height"} , justifyContent: 'space-between'
            //keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Adjust this value based on your header height
        > 
            <ScrollView 
                style={{maxHeight: '100%', marginTop: 10, marginHorizontal: 5, marginBottom: 0, backgroundColor: isDarkMode? 'black' : '#fff'}} 
                contentContainerStyle={{  }}
            >
                    <View style={styles.nutritionHeader}>
                <Text style={isDarkMode ? styles.darkLabel : styles.label}>Nutrition Facts</Text>
                <BarcodeScannerButton 
                    title="Scan"
                    backgroundColor="#21BFBF"
                    onPress={() => setScannerVisible(true)}
                    style={{
                        width: 140,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 10,
                    }}
                />
                </View>
                <Text style={isDarkMode ? styles.darkDescription : styles.description}>Enter the details from the label or scan a barcode</Text>


                {/* Input fields */}
                <View style = {isDarkMode? styles.darkRowStart:styles.rowStart}>
                    <Text style={isDarkMode? styles.darkInputLabel : styles.inputLabel}>Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={!validName ? "Food name required" : "Add Name"}
                        placeholderTextColor="#999"

                        value={foodName}
                        onChangeText={(text) => setFoodName(text)}
                    />
                </View>


                <View style = {isDarkMode? styles.darkRow: styles.row}>
                    <Text style={isDarkMode? styles.darkInputLabel : styles.inputLabel}>Calories</Text>

                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={foodCalories}
                        onChangeText={(text) => setCalories(text)}
                        placeholder="Add Calories"
                        placeholderTextColor="#999"
                    />
                </View>


                <View style = {isDarkMode? styles.darkRow: styles.row}>
                    <Text style={isDarkMode? styles.darkInputLabel : styles.inputLabel}>Fat (g)</Text>

                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={foodFat}
                        onChangeText={(text) => setFat(text)}
                        placeholder="Add Grams"
                        placeholderTextColor="#999"
                    />
                </View>


                <View style = {isDarkMode? styles.darkRow: styles.row}>
                    <Text style={isDarkMode? styles.darkInputLabel : styles.inputLabel}>Carbs (g)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={foodCarbs}
                        onChangeText={(text) => setCarbs(text)}
                        placeholder="Add Grams"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style = {isDarkMode? styles.darkRow: styles.row}>
                    <Text style={isDarkMode? styles.darkInputLabel : styles.inputLabel}>Protein (g)</Text>
                    <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={foodProtein}
                    onChangeText={handleProteinChange}
                    placeholder={"Add Grams"}
                    placeholderTextColor={'#999'}
                    //    onBlur={() => handleBlur('protein', foodProtein)}
                    />
                </View>

                <View style={isDarkMode? styles.darkRow: styles.row}>
                    <Text style={isDarkMode? styles.darkInputLabel:styles.inputLabel}>Cholesterol (mg)</Text>
                    <TextInput
                        style={isDarkMode? styles.darkInput:styles.input}
                        keyboardType="numeric"
                        value={foodCholesterol}
                        onChangeText={handleCholesterolChange}
                        placeholder={"Add Milligrams"}
                        placeholderTextColor={'#999'}
                    />
                </View>

                <View style={isDarkMode? styles.darkRow: styles.row}>
                    <Text style={isDarkMode? styles.darkInputLabel:styles.inputLabel}>Saturated Fat (g)</Text>
                    <TextInput
                        style={isDarkMode? styles.darkInput:styles.input}
                        keyboardType="numeric"
                        value={foodSaturatedFat}
                        onChangeText={handleSaturatedFatChange}
                        placeholder={"Add Grams"}
                        placeholderTextColor={'#999'}
                    />
                </View>

                <View style={isDarkMode? styles.darkRow:styles.row}>
                    <Text style={isDarkMode? styles.darkInputLabel:styles.inputLabel}>Trans Fat (g)</Text>
                    <TextInput
                        style={isDarkMode?styles.darkInput:styles.input}
                        keyboardType="numeric"
                        value={foodTransFat}
                        onChangeText={handleTransFatChange}
                        placeholder={"Add Grams"}
                        placeholderTextColor={'#999'}
                    />
                </View>

                <View style={isDarkMode? styles.darkRow:styles.row}>
                    <Text style={isDarkMode?styles.darkInputLabel:styles.inputLabel}>Sodium (mg)</Text>
                    <TextInput
                        style={isDarkMode?styles.darkInput:styles.input}
                        keyboardType="numeric"
                        value={foodSodium}
                        onChangeText={handleSodiumChange}
                        placeholder={"Add Milligrams"}
                        placeholderTextColor={'#999'}
                    />
                </View>

                <View style={isDarkMode?styles.darkRow:styles.row}>
                    <Text style={isDarkMode?styles.darkInputLabel:styles.inputLabel}>Fiber (g)</Text>
                    <TextInput
                        style={isDarkMode?styles.darkInput:styles.input}
                        keyboardType="numeric"
                        value={foodFiber}
                        onChangeText={handleFiberChange}
                        placeholder={"Add Grams"}
                        placeholderTextColor={'#999'}
                    />
                </View>

                <View style={isDarkMode?styles.darkRow:styles.row}>
                    <Text style={isDarkMode?styles.darkInputLabel:styles.inputLabel}>Sugars (g)</Text>
                    <TextInput
                        style={isDarkMode?styles.darkInput:styles.input}
                        keyboardType="numeric"
                        value={foodSugars}
                        onChangeText={handleSugarsChange}
                        placeholder={"Add Grams"}
                        placeholderTextColor={'#999'}
                    />
                </View>

                <View style={isDarkMode?styles.darkRow:styles.row}>
                    <Text style={isDarkMode?styles.darkInputLabel:styles.inputLabel}>Calcium (mg)</Text>
                    <TextInput
                        style={isDarkMode?styles.darkInput:styles.input}
                        keyboardType="numeric"
                        value={foodCalcium}
                        onChangeText={handleCalciumChange}
                        placeholder={"Add Milligrams"}
                        placeholderTextColor={'#999'}
                    />
                </View>

                <View style={isDarkMode?styles.darkRow:styles.row}>
                    <Text style={isDarkMode?styles.darkInputLabel:styles.inputLabel}>Iron (mg)</Text>
                    <TextInput
                        style={isDarkMode?styles.darkInput:styles.input}
                        keyboardType="numeric"
                        value={foodIron}
                        onChangeText={handleIronChange}
                        placeholder={"Add Milligrams"}
                        placeholderTextColor={'#999'}
                    />
                </View>

                <View style={isDarkMode?styles.darkRow:styles.row}>
                    <Text style={isDarkMode?styles.darkInputLabel:styles.inputLabel}>Potassium (mg)</Text>
                    <TextInput
                        style={isDarkMode?styles.darkInput:styles.input}
                        keyboardType="numeric"
                        value={foodPotassium}
                        onChangeText={handlePotassiumChange}
                        placeholder={"Add Milligrams"}
                        placeholderTextColor={'#999'}
                    />
                </View>


                <View style = {isDarkMode? styles.darkRow: styles.row}>
                    <Text style={isDarkMode? styles.darkInputLabel : styles.inputLabel}>Servings:</Text>
                    <TextInput
                        style={isDarkMode? styles.darkInput:styles.input}
                        keyboardType="numeric"
                        value={foodServings}
                        onChangeText={(text) => setServings(text)}
                        placeholder="Add Servings"
                        placeholderTextColor="#999"
                    />
                </View>

                {/* Save button */}
                <View style={styles.buttonRow}>
                    <AddFoodButton   
                        title="Save Food" 
                        textColor="white"
                        backgroundColor="#21BFBF"
                        borderColor="#21BFBF"
                        borderWidth={0}
                        fontSize={16}
                        width={150}
                        onPress={() => {
                            if ((validateAllFields())) {
                                handleFoodDataSaveOnly();
                            } else {
                                alert("A food name is required.");
                            }
                        }} 
                />
                <AddFoodButton   
                        title="Log Food Today" 
                        textColor="#21BFBF"
                        backgroundColor="white"
                        borderColor="#21BFBF"
                        borderWidth={2}
                        fontSize={16}
                        width={150}
                        onPress={() => {
                            if (validateAllFields()) {
                                handleFoodDataSaveAddDay();
                            } else {
                                alert("A food name is required.");
                            }
                        }} 
                    />
                </View>
                
            </ScrollView>
            
            <Modal visible={scannerVisible} animationType="slide">
                <Scanner 
                    onClose={() => setScannerVisible(false)}
                    onScan={(barcode) => fetchFoodData(barcode)}
                />
            </Modal>
            {/* Save buttons */}
            <View style={styles.buttonRow}>
                {/* handleFoodDataSaveOnly and handleFoodDataSaveAddDay remain unchanged */}
                {/* Just ensure your "ValidateAllFields()" logic is placed accordingly */}
            </View>
        </KeyboardAwareScrollView>
    )
};
const styles = StyleSheet.create({
    addFoodContainer: { 
        paddingBottom: 29,
        padding: 5,
        // width:"100%",
        // height: '100%',
        backgroundColor: 'white',
      },
      label: {
        fontSize: 20,
        fontWeight: 'bold',
      },
      darkLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
      },
      description: {
        fontSize: 15,
      },
      input: {
        flex: 1,
        // borderWidth: 1,
        // borderColor: 'white',
        padding: 5,
        marginVertical: 2,
        // borderRadius: 2,
        textAlign: 'right',
        // backgroundColor:'red'
      },
    //   inputInvalid: {
    //     borderColor: 'red',
    // },
    darkInput: {
        flex: 1,
        // borderWidth: 1,
        // borderColor: 'white',
        padding: 5,
        marginVertical: 2,
        // borderRadius: 2,
        textAlign: 'right',
        // backgroundColor:'red'
        color: 'white'
      },
      inputLabel: {
        marginLeft: 20,
        fontSize: 16,
        marginRight: 10, // Space between the label and input
        width: '30%', // Adjust width based on your layout needs
      },
      darkInputLabel: {
        marginLeft: 20,
        fontSize: 16,
        marginRight: 10, // Space between the label and input
        width: '30%', // Adjust width based on your layout needs
        color: 'white'
      },
      rowStart: {
        flexDirection: 'row', // Align items in a row
        alignItems: 'center', // Vertically center the text and input
        marginTop: 10, 
        padding: 7,
        gap: 20,
        borderTopColor: 'black', 
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        borderTopWidth: 1,
        width: '90%',
        alignSelf: 'center',
      },
      darkRowStart: {
        flexDirection: 'row', // Align items in a row
        alignItems: 'center', // Vertically center the text and input
        marginTop: 10, 
        padding: 7,
        gap: 20,
        borderTopColor: 'white', 
        borderBottomColor: 'white',
        borderBottomWidth: 1,
        borderTopWidth: 1,
        width: '90%',
        alignSelf: 'center',
      },
      row: {
        flexDirection: 'row', // Align items in a row
        alignItems: 'center', // Vertically center the text and input
        padding: 7, 
        gap: 20,
        // borderTopColor: 'white', 
        borderBottomColor: 'black',
        borderBottomWidth: 1, 
        width: '90%',
        alignSelf: 'center',
      }, 
      darkDescription: {
        fontSize: 15,
        color: 'white',
      },      
      darkRow: {
        flexDirection: 'row', // Align items in a row
        alignItems: 'center', // Vertically center the text and input
        padding: 7, 
        gap: 20,
        // borderTopColor: 'white', 
        borderBottomColor: 'white',
        borderBottomWidth: 1, 
        width: '90%',
        alignSelf: 'center',
      }, 
      buttonRow: {
        flexDirection: 'row', // Align items in a row
        alignItems: 'center', // Vertically center the text and input
        justifyContent: 'center',
        marginVertical: 5,
      },

      nutritionHeader: {
        flexDirection: 'row',  
        alignItems: 'center',  
        justifyContent: 'space-between',  
        paddingHorizontal: 10,  
        marginBottom: 5,  
        width: '100%',  
      }
      
      
})

export default FoodLogAddPage;