import { useState } from "react";
import { TouchableOpacity, View, StyleSheet, Text } from "react-native";

interface ChipProps {
  label: string;
  value: number;
  selected: boolean;
  onPress: (value: number) => void;
}

const Chip: React.FC<ChipProps> = ({ label, value, selected, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.chip, selected && styles.selectedChip]} 
      onPress={() => onPress(value)}
    >
      <Text style={[styles.chipText, selected && styles.selectedChipText]}>{label}</Text>
    </TouchableOpacity>
  );
};

interface CustomChipProps {
  onTypeSelect: (type: number) => void;
  selectedType?: number | null; 
}

const CustomChip: React.FC<CustomChipProps> = ({ selectedType, onTypeSelect }) => {
  
  return (
    <View style={styles.container}>
      <Chip label="Upper" value={1} selected={selectedType === 1} onPress={onTypeSelect} />
      <Chip label="Lower" value={2} selected={selectedType === 2} onPress={onTypeSelect} />
      <Chip label="Other" value={3} selected={selectedType === 3} onPress={onTypeSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#D9D9D9',
    borderRadius: 20,
    padding: 10,
    margin: 5,
    width: '25%',
    // height: 65,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 15,
    // fontWeight: 'bold',
    color: '#1D2526',
  },
  selectedChip: {
    backgroundColor: '#2493BF',
  },
  selectedChipText: {
    color: '#fff',
  }
});

export default CustomChip;
