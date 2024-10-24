import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native'

type AddFoodButtonProps = {
  title: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  width?: number,
  textColor?: string;
  fontSize?: number;
  onPress?: () => void;
  underlineOnPress?: boolean;
};

const AddFoodButton: React.FC<AddFoodButtonProps> = ({ title, backgroundColor, borderColor, borderWidth, width, textColor, fontSize, onPress, underlineOnPress = false }) => {
    const [isPressed, setIsPressed] = useState(false);
  
    const buttonStyle: ViewStyle = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    borderWidth: borderWidth,
    width: width || 'auto'
  };

  const textStyle: TextStyle = {
    color: textColor || '#fff',
    fontSize: fontSize || 15,
  };

  return (
    <TouchableOpacity
      style={[styles.circle, buttonStyle]}
      onPressIn={() => setIsPressed(true)} // Set pressed state to true on press in
      onPressOut={() => {
        setIsPressed(false);
        if (onPress) onPress(); // Call onPress when released
      }}
      activeOpacity={0.7}
    >
      <Text style={[textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    circle: {
        width: 100, // Diameter of the circle
        height: 50,
        borderRadius: 20, // Half of the width/height to make it a circle
        justifyContent: 'center', // Center the text vertically
        alignItems: 'center', // Center the text horizontally
        marginRight: 10,
        marginLeft: 10,
        marginTop: 5,
        marginBottom: 5,
    },
   
});

export default AddFoodButton 