import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View, Modal, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';


type LogFoodButtonProps = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cholesterol: number;
  saturatedFat: number;
  transFat: number;
  sodium: number;
  fiber: number;
  sugars: number;
  calcium: number;
  iron: number;
  potassium: number;
  serving: number;
  saveFoodChanges: (updatedFood: any) => void;
  logFoodToDay: (foodData: any) => void;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  width?: any;
  textColor?: string;
  fontSize?: number;
  onPress?: any;
  underlineOnPress?: boolean;
};

const LogFoodButton: React.FC<LogFoodButtonProps> = ({
  id,
  name,
  calories,
  protein,
  carbs,
  fat,
  serving,
  cholesterol,
  saturatedFat,
  transFat,
  sodium,
  fiber,
  sugars,
  calcium,
  iron,
  potassium,
  saveFoodChanges,
  logFoodToDay,
  backgroundColor,
  borderColor,
  borderWidth,
  width,
  textColor,
  fontSize,
}) => {
  const [isFoodModalVisible, setFoodModalVisible] = useState(false);
  const [isFoodEditMode, setIsFoodEditMode] = useState(false);

  // Temporary states for editing
  const [tempName, setTempName] = useState(name);
  const [tempCalories, setTempCalories] = useState(calories);
  const [tempProtein, setTempProtein] = useState(protein);
  const [tempCarbs, setTempCarbs] = useState(carbs);
  const [tempFat, setTempFat] = useState(fat);
  const [tempCholesterol, setTempCholesterol] = useState(cholesterol);
  const [tempSaturatedFat, setTempSaturatedFat] = useState(saturatedFat);
  const [tempTransFat, setTempTransFat] = useState(transFat);
  const [tempSodium, setTempSodium] = useState(sodium);
  const [tempFiber, setTempFiber] = useState(fiber);
  const [tempSugars, setTempSugars] = useState(sugars);
  const [tempCalcium, setTempCalcium] = useState(calcium);
  const [tempIron, setTempIron] = useState(iron);
  const [tempPotassium, setTempPotassium] = useState(potassium);
  const [tempServing, setTempServing] = useState(serving);

  // Original states to revert if the user does not save
  const [thisName, setName] = useState(name);
  const [thisCalories, setCalories] = useState(calories);
  const [thisProtein, setProtein] = useState(protein);
  const [thisCarbs, setCarbs] = useState(carbs);
  const [thisFat, setFat] = useState(fat);
  const [thisCholesterol, setCholesterol] = useState(cholesterol);
  const [thisSaturatedFat, setSaturatedFat] = useState(saturatedFat);
  const [thisTransFat, setTransFat] = useState(transFat);
  const [thisSodium, setSodium] = useState(sodium);
  const [thisFiber, setFiber] = useState(fiber);
  const [thisSugars, setSugars] = useState(sugars);
  const [thisCalcium, setCalcium] = useState(calcium);
  const [thisIron, setIron] = useState(iron);
  const [thisPotassium, setPotassium] = useState(potassium);

  const [thisServing, setServing] = useState(serving);

  const toggleEditMode = () => setIsFoodEditMode((prev) => !prev);

  const saveChanges = () => {
    const updatedFood = {
      id,
      name: tempName, 
      calories: tempCalories, 
      protein: tempProtein, 
      carbs: tempCarbs, 
      fat: tempFat, 
      cholesterol: tempCholesterol,
      saturatedFat: tempSaturatedFat,
      transFat: tempTransFat,
      sodium: tempSodium,
      fiber: tempFiber,
      sugars: tempSugars,
      calcium: tempCalcium,
      iron: tempIron,
      potassium: tempPotassium,
      serving: tempServing,
      isDeleted: false,
    };
    // call the parent function
    console.log("updated food: ", updatedFood)
    saveFoodChanges(updatedFood);

    setName(tempName);
    setCalories(tempCalories);
    setProtein(tempProtein);
    setCarbs(tempCarbs);
    setFat(tempFat);
    setCholesterol(tempCholesterol);
    setSaturatedFat(tempSaturatedFat);
    setTransFat(tempTransFat);
    setSodium(tempSodium);
    setFiber(tempFiber);
    setSugars(tempSugars);
    setCalcium(tempCalcium);
    setIron(tempIron);
    setPotassium(tempPotassium);
    setServing(tempServing);

    setIsFoodEditMode(false);
  };

  const foodSaveAndAddToDay = () => {
    const updatedFood = {
      id,
      name: tempName, 
      calories: tempCalories, 
      protein: tempProtein, 
      carbs: tempCarbs, 
      fat: tempFat, 
      cholesterol: tempCholesterol,
      saturatedFat: tempSaturatedFat,
      transFat: tempTransFat,
      sodium: tempSodium,
      fiber: tempFiber,
      sugars: tempSugars,
      calcium: tempCalcium,
      iron: tempIron,
      potassium: tempPotassium,
      serving: tempServing,
      isDeleted: false,
    };
    // call the parent function
    console.log("updated food: ", updatedFood)
    saveFoodChanges(updatedFood);
    logFoodToDay(updatedFood);

    setFoodModalVisible(false);
  }

  const closeWithoutSaving = () => {
    setTempName(thisName);
    setTempCalories(thisCalories);
    setTempProtein(thisProtein);
    setTempCarbs(thisCarbs);
    setTempFat(thisFat);
    setTempCholesterol(thisCholesterol);
    setTempSaturatedFat(thisSaturatedFat);
    setTempTransFat(thisTransFat);
    setTempSodium(thisSodium);
    setTempFiber(thisFiber);
    setTempSugars(thisSugars);
    setTempCalcium(thisCalcium);
    setTempIron(thisIron);
    setTempPotassium(thisPotassium);
    setTempServing(thisServing);
    setIsFoodEditMode(false);
    setFoodModalVisible(false);
  };

  const buttonStyle: ViewStyle = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    borderWidth: borderWidth,
    width: width || 'auto',
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.foodItemContainer, buttonStyle]}
        onPress={() => setFoodModalVisible(true)}
        activeOpacity={0.5}
      >
        <Text style={styles.foodName}>{name}</Text>
        <View style={styles.foodTextRight}>
          <Text>{calories} Calories</Text>
        </View>
      </TouchableOpacity>

      <Modal
        transparent
        visible={isFoodModalVisible}
        animationType="slide"
        onRequestClose={closeWithoutSaving}
      >
        <View style={styles.modalOverlay}>

          <KeyboardAvoidingView
            style={styles.modalContentContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          >

            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {isFoodEditMode ? (
                    <TextInput
                    style={styles.modalTitleEdit}
                    value={tempName}
                    autoFocus={true}
                    onChangeText={setTempName} // Set the name directly
                    keyboardType="default"
                  />
                ) : ( 
                  <Text style={styles.modalTitle}>{tempName}</Text>
                )}
              
                <TouchableOpacity onPress={closeWithoutSaving}>
                  <Ionicons name="close-circle-outline" size={30} color="#747474" />
                </TouchableOpacity>
              </View>

              {/* Map through stateMappings for numerical values */}
              {['Calories', 'Protein', 'Carbs', 'Fat', 'cholesterol', 'saturatedFat', 'transFat', 'sodium', 'fiber', 'sugars', 'calcium', 'iron', 'potassium', 'Servings'].map((label, index) => {
                // Define state mappings for numerical fields only
                const stateMappings: [
                  number,
                  React.Dispatch<React.SetStateAction<number>>
                ][] = [
                  [tempCalories, setTempCalories],
                  [tempProtein, setTempProtein],
                  [tempCarbs, setTempCarbs],
                  [tempFat, setTempFat],
                  [tempCholesterol, setTempCholesterol],
                  [tempSaturatedFat, setTempSaturatedFat],
                  [tempTransFat, setTempTransFat],
                  [tempSodium, setTempSodium],
                  [tempFiber, setTempFiber],
                  [tempSugars, setTempSugars],
                  [tempCalcium, setTempCalcium],
                  [tempIron, setTempIron],
                  [tempPotassium, setTempPotassium],
                  [tempServing, setTempServing],
                  
                ];

                const [value, setValue] = stateMappings[index]; // Deconstruct state and setter

                return (
                  <View
                    key={label}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                      width: '90%',
                      alignSelf: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{label}</Text>
                    {isFoodEditMode ? (
                      <TextInput
                        style={styles.repInputEdit}
                        value={value.toString()} // Ensure the value is a string
                        onChangeText={(text) => {
                          const numericValue = parseFloat(text) || 0; // Parse text to a number or default to 0
                          setValue(numericValue); // Update the corresponding state
                        }}
                        keyboardType="numeric"
                      />
                    ) : (
                      <Text style={styles.repInput}>{value}{(index == 1 || index == 2 || index == 3) ? 'g' : ''}</Text>
                    )}
                  </View>
                );
              })}

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity style={styles.modalButton1} onPress={foodSaveAndAddToDay}>
                  <Text style={{ color: '#21BFBF', fontSize: 15 }}>Log Today</Text>
                </TouchableOpacity>
                {isFoodEditMode ? (
                  <TouchableOpacity style={styles.modalButton2} onPress={saveChanges}>
                    <Text style={{ color: '#fff', fontSize: 15 }}>Save</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.modalButton2} onPress={toggleEditMode}>
                    <Text style={{ color: '#fff', fontSize: 15 }}>Edit</Text>
                  </TouchableOpacity>
                ) }
                
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  foodItemContainer: {
    padding: 3,
    backgroundColor: '#EDEDED',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 3,
    marginBottom: 1,
    marginTop: 1,
    flexDirection: 'row',
  },
  foodName: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  foodTextRight: {
    position: 'absolute',
    right: 5,
    flexDirection: 'row',
    marginTop: 8,
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalTitleEdit: {
    fontSize: 18,
    width: '80%',
    borderRadius: 5,
    color: '#B6B6B6',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  repInputEdit: {
    fontSize: Platform.OS === "ios" ? 16 : 14,
    backgroundColor: '#D9D9D9',
    width: '20%',
    borderRadius: 5,
    textAlign: 'center',
    color: 'black',
    maxHeight: 30,
    textAlignVertical: 'center', 
    paddingVertical: 0,
  },
  repInput: {
    fontSize: 16,
    backgroundColor: 'white',
    width: '20%',
    borderRadius: 5,
    textAlign: 'center',
    color: 'black',
    textAlignVertical: 'center', 
    paddingVertical: 0,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton1: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#21BFBF',
    borderRadius: 20,
    padding: 10,
    width: '48%',
    alignItems: 'center',
  },
  modalButton2: {
    backgroundColor: '#21BFBF',
    borderRadius: 20,
    padding: 10,
    width: '48%',
    alignItems: 'center',
  },
});

export default LogFoodButton;
