import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native'

type MacroButtonProps = {
  title: string;
  label: string;
  total: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  width?: number,
  textColor?: string;
  fontSize?: number;
  onPress?: () => void;
  underlineOnPress?: boolean;
  containerStyle?: ViewStyle;  // ✅ 新增 `containerStyle` 允许外部覆盖样式
};

const MacroButton: React.FC<MacroButtonProps> = ({ title, backgroundColor, borderColor, borderWidth, width, textColor, fontSize, total, label}) => {

  const buttonStyle: ViewStyle = {
    // backgroundColor: 'red',
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
      <Text style={[styles.buttonText, textStyle]}>{total}{label}</Text>
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
    marginLeft: 0,//adjust value from 10 to 0
    marginTop: 3,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default MacroButton 