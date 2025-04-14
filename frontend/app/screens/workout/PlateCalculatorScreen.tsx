import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { GlobalContext } from "@/context/GlobalContext";


const PlateCalculatorScreen = () => {
  const [weight, setWeight] = useState("");
  const [plates, setPlates] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const barbellAnimation = useState(new Animated.Value(0))[0];
  const context = useContext(GlobalContext);
  const isDarkMode = context?.isDarkMode;


  // Define available plate weights (standard)
  const plateSizes = [45, 35, 25, 10, 5, 2.5]; // lbs
  const barbellWeight = 45; // Standard Olympic barbell

  // Function to calculate plates
  const calculatePlates = () => {
    let targetWeight = parseFloat(weight);

    if (isNaN(targetWeight) || targetWeight <= barbellWeight) {
      Alert.alert("Error", "Enter a valid weight above 45 lbs (barbell weight)."
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const weightPerSide = (targetWeight - barbellWeight) / 2; // Each side of bar
      let remainingWeight = weightPerSide;
      let selectedPlates: number[] = [];

      for (let plate of plateSizes) {
        while (remainingWeight >= plate) {
          selectedPlates.push(plate);
          remainingWeight -= plate;
        }
      }

      setPlates(selectedPlates);
      setLoading(false);

      // Trigger animation
      Animated.timing(barbellAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => barbellAnimation.setValue(0)); // Reset animation
    }, 500);
  };

  const plateToHeight = (plate: number) => {
    switch (plate) {
      case 45:
        return 80;
      case 35:
        return 70;
      case 25:
        return 60;
      case 10:
        return 50;
      case 5:
        return 40;
      case 2.5:
        return 30;
      default:
        return 30;
    }
  };

  const plateToColor = (plate: number) => {
    switch (plate) {
      case 45: return "red";
      case 35: return "blue";
      case 25: return "gold";
      case 10: return "green";
      case 5: return "orange";
      case 2.5: return "gray";
      default: return "gray";
    }
  };


  return (

    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#F5F5F5" },
      ]}
    >
      <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>Weight Plate Calculator</Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDarkMode ? "#333" : "#fff",
            color: isDarkMode ? "#fff" : "#000", // sets input text color
            borderColor: isDarkMode ? "#555" : "gray",
          },
        ]}
        placeholder="Enter weight (lbs)"
        placeholderTextColor={isDarkMode ? "#aaa" : "#888"} // ← important!
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />



      <TouchableOpacity onPress={calculatePlates} style={styles.button}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Calculate Plates</Text>
        )}
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.barbell,
          {
            transform: [
              {
                scaleX: barbellAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.plateContainer}>
          {plates?.slice().reverse().map((plate, index) => (
            <View
              key={index}
              style={[
                styles.plate,
                {
                  width: 10,
                  height: plateToHeight(plate),
                  backgroundColor: plateToColor(plate),
                  marginHorizontal: 1,
                  borderRadius: 3,
                },
              ]}
            />
          ))}
        </View>

        <View
          style={[
            styles.bar,
            { backgroundColor: isDarkMode ? "#aaa" : "black" },
          ]}
        />


        <View style={styles.plateContainer}>
          {plates?.map((plate, index) => (
            <View
              key={index}
              style={[
                styles.plate,
                {
                  width: 10,
                  height: plateToHeight(plate),
                  backgroundColor: plateToColor(plate),
                  marginHorizontal: 1,
                  borderRadius: 3,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
      
      {plates && plates.length > 0 && (
          <View style={styles.plateListContainer}>
            <Text style={[styles.plateListTitle, { color: isDarkMode ? "#fff" : "#000" }]}>
              Plates per side:
            </Text>
            <Text style={[styles.plateListText, { color: isDarkMode ? "#ddd" : "#333" }]}>
              {plates
                .slice()
                .sort((a, b) => b - a)
                .map((plate) => plate.toString())
                .join(", ")}
            </Text>
          </View>
        )}
    </View>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#2493BF",
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  barbell: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },
  bar: {
    width: 100,
    height: 10,
    backgroundColor: "black",
  },
  plateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  plate: {
    marginHorizontal: 1,
    borderRadius: 3,
  },

  plateListContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  plateListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  plateListText: {
    fontSize: 16,
    marginTop: 4,
  },

});

export default PlateCalculatorScreen;
