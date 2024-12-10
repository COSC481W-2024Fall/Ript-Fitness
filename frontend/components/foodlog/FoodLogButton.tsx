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
  multiplier: number;
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
  multiplier,
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
  const [tempMultiplier, setTempMultiplier] = useState(multiplier);

  // Original states to revert if the user does not save
  const [thisName, setName] = useState(name);
  const [thisCalories, setCalories] = useState(calories);
  const [thisProtein, setProtein] = useState(protein);
  const [thisCarbs, setCarbs] = useState(carbs);
  const [thisFat, setFat] = useState(fat);
  const [thisMultiplier, setMultiplier] = useState(multiplier);

  const toggleEditMode = () => setIsFoodEditMode((prev) => !prev);

  const saveChanges = () => {
    const updatedFood = {
      id,
      name: tempName, 
      calories: tempCalories, 
      protein: tempProtein, 
      carbs: tempCarbs, 
      fat: tempFat, 
      multiplier: tempMultiplier,
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
    setMultiplier(tempMultiplier);

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
      multiplier: tempMultiplier,
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
    setTempMultiplier(thisMultiplier);
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
              {['Calories', 'Protein', 'Carbs', 'Fat', 'Servings'].map((label, index) => {
                // Define state mappings for numerical fields only
                const stateMappings: [
                  number,
                  React.Dispatch<React.SetStateAction<number>>
                ][] = [
                  [tempCalories, setTempCalories],
                  [tempProtein, setTempProtein],
                  [tempCarbs, setTempCarbs],
                  [tempFat, setTempFat],
                  [tempMultiplier, setTempMultiplier],
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
    padding: 20,
    backgroundColor: '#EDEDED',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 5,
    marginTop: 7,
    // borderBottomWidth: 1,
    // borderColor: 'black',
    flexDirection: 'row',
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodTextRight: {
    position: 'absolute',
    right: 10,
    flexDirection: 'row',
    marginTop: 23,
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
    // backgroundColor: '#D9D9D9',
    width: '80%',
    borderRadius: 5,
    // textAlign: 'center',
    color: '#B6B6B6',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  repInputEdit: {
    // fontSize: 16,
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
