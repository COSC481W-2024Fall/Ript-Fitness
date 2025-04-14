import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type BarcodeScannerProps = {
  title: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  width?: number;
  height?: number;
  textColor?: string;
  fontSize?: number;
  onPress?: () => void;
  underlineOnPress?: boolean;
  style?: ViewStyle;
};

const BarcodeScannerButton: React.FC<BarcodeScannerProps> = ({
  title,
  backgroundColor = "#21BFBF",
  borderColor = "#21BFBF",
  borderWidth = 2,
  width = 200,  // Default width
  height = 60,  // Default height
  textColor = "#fff",
  fontSize = 15,
  onPress,
  underlineOnPress = false,
  style
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const buttonStyle: ViewStyle = {
    backgroundColor,
    borderColor,
    borderWidth,
    width,
    height,  // Ensure height is passed
    borderRadius: 10,  // ✅ Make it more rectangular, not oval
    justifyContent: 'center',
    alignItems: 'center',
  };

  const textStyle: TextStyle = {
    color: textColor,
    fontSize,
    fontWeight: 'bold',
    textDecorationLine: underlineOnPress ? 'underline' : 'none',
  };

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}  
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => {
        setIsPressed(false);
        if (onPress) onPress();
      }}
      activeOpacity={0.7}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default BarcodeScannerButton;
