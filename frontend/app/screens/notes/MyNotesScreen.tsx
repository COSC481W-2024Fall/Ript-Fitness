import CustomTextInput from "@/components/custom/CustomTextInput";
import { View, StyleSheet, Dimensions, Text, ScrollView, TouchableOpacity, Button, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Note from "@/components/MyNotes/Note";
import { useNotes } from "@/components/MyNotes/NotesContext";
import { useNavigation } from "@react-navigation/native";
import { Note as NoteType } from '@/components/MyNotes/NotesContext';
import { StackNavigationProp } from "@react-navigation/stack";
import { WorkoutStackParamList } from "@/app/(tabs)/WorkoutStack"
import CustomSearchBar from "@/components/custom/CustomSearchBar";
import { useEffect, useState } from "react";
import TimeZone from "@/api/timeZone";

type MyNotesScreenNavigationProp = StackNavigationProp<WorkoutStackParamList, 'MyNotesScreen'>;

export default function MyNotesScreen() {
  const { notes, fetchNotes, loading } = useNotes();
  const [searchText, setSearchText] = useState("");
  const { width } = Dimensions.get("window");
  const navigation = useNavigation<MyNotesScreenNavigationProp>();

  useEffect(() => {
    fetchNotes(); // Fetch notes on screen load
  }, []);


  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchText.toLowerCase())
  );


  return (
    <View style={styles.container}>      
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#747474"
          style={styles.iconContainer}
        />
        <CustomTextInput
          placeholder="Search"
          placeholderTextColor="#999"
          width={width * 0.85}
          value={searchText}
          onChangeText={setSearchText}
          style={{
            borderWidth: 0,
            fontSize: 16,
            paddingLeft: 30,
            borderRadius: 25,
            backgroundColor: "#EDEDED",
          }}
        />
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading notes...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ alignItems: "center", width: "100%" }}
          style={styles.scroll}
        >
          {filteredNotes.length === 0 ? (
            <Text style={{ color: '#555', textAlign: 'center', }}>Notes will be displayed here</Text>
          ) : (
            <View style={styles.notesContainer}>
              {filteredNotes.map((note) => (
                <Note
                  key={note.noteId}
                  title={note.title}
                  date={note.updatedAt}
                  text={note.description}
                  onPress={() => navigation.navigate("EditNoteScreen", { note })}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    width:"100%",
  },
  notesContainer:{
    flex:1,
    flexDirection:"row",
    flexWrap:"wrap",
    justifyContent: "space-evenly",
  },
  container: {
    width:"100%",
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 15,
  },
  iconContainer: {
    position: "absolute",
    paddingTop: 15,
    paddingLeft: 7,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#555",
  },
});