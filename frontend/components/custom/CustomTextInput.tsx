import React from 'react';
import { TextInput, TextInputProps, StyleSheet, ViewStyle, View, TouchableWithoutFeedback, Keyboard  } from 'react-native';

type CustomTextInputProps = {
  placeholder: string;
  placeholderTextColor?: string;
  width?: number;
  style?: ViewStyle;
} & TextInputProps; 


const CustomTextInput: React.FC<CustomTextInputProps> = ({ placeholder, placeholderTextColor, width, style, ...props }) => {
  const containerStyle: ViewStyle = {
    width:  width || '100%',
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <TextInput
        style={[styles.input, containerStyle, style]} 
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        {...props} 
      />
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
});

export default CustomTextInput;
