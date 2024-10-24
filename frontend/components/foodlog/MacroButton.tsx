import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native'

type MacroButtonProps = {
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

const MacroButton: React.FC<MacroButtonProps> = ({ title, backgroundColor, borderColor, borderWidth, width, textColor, fontSize, onPress, underlineOnPress = false }) => {

  const buttonStyle: ViewStyle = {
    backgroundColor: 'white',
    borderColor: borderColor,
    borderWidth: borderWidth,
    width: width || 'auto'
  };

  const textStyle: TextStyle = {
    color: textColor || '#fff',
    fontSize: fontSize || 15,
  };

  return (
    <View style={[styles.circle, buttonStyle]}>
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 100, // Diameter of the circle
    height: 100,
    borderRadius: 50, // Half of the width/height to make it a circle
    justifyContent: 'center', // Center the text vertically
    alignItems: 'center', // Center the text horizontally
    marginRight: 10,
    marginLeft: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default MacroButton 