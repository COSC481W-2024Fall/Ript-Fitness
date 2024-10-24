
import { TextInput, StyleSheet, ScrollView, Text, View } from "react-native";
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import MacroButton from "@/components/foodlog/MacroButton";
import FoodLogAddFrom from "@/app/screens/foodlog/FoodLogAdd";
import FoodLogSaved from "@/app/screens/foodlog/FoodLogSaved";

export default function FoodLogScreen() {
    
    const navigation = useNavigation();


    return(
        <View>
                <View style={styles.calendarNav}>
                    <Ionicons 
                        name={"chevron-back-outline"} 
                        size={24} 
                        style={styles.leftArrow}
                        onPress={() => navigation.navigate('ApiScreen')}
                />
                    <Ionicons name={"calendar-clear-outline"} size={24}></Ionicons>
                    {/* This will be "today" when it is the current date, if not it will display the date of the data they are viewing*/}
                    <Text>Today</Text>
                    <Ionicons 
                        name={"chevron-forward-outline"} 
                        size={24} 
                        style={styles.rightArrow}
                        onPress={() => navigation.navigate('ApiScreen')}
                    />
                </View>
            <View style={styles.macroView}> 
                <View style={styles.macroRow}>
                    <MacroButton
                        title="Calories"
                        textColor="#0E598D"
                        borderColor="#0E598D"
                        borderWidth={5}
                        fontSize={16}
                        width={100} 
                    ></MacroButton>
                    <MacroButton
                        title="Protein" 
                        textColor="#F2846C"
                        borderColor="#F2846C"
                        borderWidth={5}
                        fontSize={16}
                        width={100} 
                    ></MacroButton>
                    <MacroButton
                        title="Carbs" 
                        textColor="#088C7F"
                        borderColor="#088C7F"
                        borderWidth={5}
                        fontSize={16}
                        width={100} 
                    ></MacroButton>
                </View>
                <View style={styles.macroRow}>
                    <MacroButton
                        title="Fat" 
                        textColor="#AC2641"
                        borderColor="#AC2641"
                        borderWidth={5}
                        fontSize={16}
                        width={100} 
                    ></MacroButton>
                    <MacroButton
                        title="Water" 
                        textColor="black"
                        borderColor="black"
                        borderWidth={5}
                        fontSize={16}
                        width={100} 
                    ></MacroButton>
                </View>
            </View> 
            <View style={styles.dataBar}>
                <Text style={styles.text}
                    onPress={()  => }>Logged</Text>
                <Text style={styles.text}
                    onPress={()  => navigation.navigate('ApiScreen')}>Saved</Text>
                <Text style={styles.textAdd}
                    onPress={()  => <FoodLogAddFrom></FoodLogAddFrom>}>Add</Text>
            </View>
        
        <FoodLogAddFrom></FoodLogAddFrom>
        </View>
    );
}

const styles = StyleSheet.create({
    calendarNav: {
        height: 40,
        width: '100%', 
        backgroundColor: 'lightgray',
        flexDirection: 'row',
        padding: 5,
        alignItems: 'center',
        position: 'relative',
        justifyContent: 'center',
    },
    rightArrow: {
        position: 'absolute',
        right: 0,
    }, 
    leftArrow: {
        position: 'absolute',
        left: 0,
    },
    macroView: {
        height: 220,
        width: '100%',
        backgroundColor: 'white', 
    }, 
    macroRow: {
        flexDirection: 'row',
        justifyContent: 'center', 
    }, 
    dataBar: {
        height: 50,
        width: '100%', 
        backgroundColor: 'lightgray',
        flexDirection: 'row',
        padding: 5,
        alignItems: 'center',
        position: 'relative',
        justifyContent: 'space-between',
    }, 
    text: {
        padding: 10,
    },
    textAdd: {
        padding: 10,
        textDecorationLine: 'underline',
        fontWeight: 'bold',
    }

})