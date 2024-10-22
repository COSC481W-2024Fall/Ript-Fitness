import CustomTextInput from "@/components/custom/CustomTextInput";
import { View, StyleSheet, Dimensions, FlatList, Text, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Note from "@/components/MyNotes/Note";

export default function MyNotesScreen() {
  const { width } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={24} color="grey" style={styles.iconContainer} />
        <CustomTextInput
          placeholder="Search"
          placeholderTextColor="#999"
          width={width * 0.80}
          style={{
            borderColor: '#B9B6B6',
            borderWidth: 2,
            fontSize: 16,
            paddingLeft: 27,
            borderRadius: 20,
          }}
        />
      </View>
      <ScrollView
          showsVerticalScrollIndicator={false}>
          <Note/>
        </ScrollView>
      <View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: 'center'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingTop: 15,
  },
  iconContainer: {
    position: 'absolute',
    paddingLeft: 5,
  },

});