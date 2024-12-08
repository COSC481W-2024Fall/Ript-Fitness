import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, TouchableOpacity, Keyboard } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useNotes } from '@/components/MyNotes/NotesContext';
import { Note as NoteType } from '@/components/MyNotes/NotesContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { WorkoutStackParamList } from '@/app/(tabs)/WorkoutStack';
import { RouteProp } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';

type EditNoteRouteProp = RouteProp<WorkoutStackParamList, 'EditNoteScreen'>;

type EditNoteScreenNavigationProp = StackNavigationProp<WorkoutStackParamList, 'EditNoteScreen'>;

const EditNoteScreen = () => {
  const { params } = useRoute<EditNoteRouteProp>(); // Use the correctly typed params
  const navigation = useNavigation<EditNoteScreenNavigationProp>();
  const { addNote, updateNote, deleteNote } = useNotes();

  
  // Default note structure
  const [note, setNote] = useState<NoteType>({
    noteId: -1,  // Empty ID for a new note
    title: '',
    description: '',
    updatedAt: '', 
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (params?.note) {
      // If editing, load the existing note into state
      const { note } = params;
      setNote(note);
      setIsEditing(true); // Set state to indicate that the user is editing a note
    }
  }, [params]);

  const handleSave = async () => {
    if (note.title.trim() === '' || note.description.trim() === '') {
      Alert.alert('Error', 'Note cannot be empty');
      return;
    }

    try {
      if (isEditing) {
        // If editing an existing note, update it
        await updateNote(note); 
        Alert.alert('Success', 'Note updated successfully');
      } else {
        // If adding a new note, create it
        await addNote(note); // Add a new note
        Alert.alert('Success', 'New note added successfully');
      }
      navigation.goBack(); 
    } catch (error) {
      Alert.alert('Error', 'An error occurred while saving the note.');
      console.error(error);
    }
  };

  const handleChangeTitle = (text: string) => {
    setNote((prevNote) => ({
      ...prevNote,
      title: text,
    }));
  };

  const handleChangeDescription = (text: string) => {
    setNote((prevNote) => ({
      ...prevNote,
      description: text, 
    }));
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            await deleteNote(note.noteId);  
            navigation.goBack(); 
          },
        },
      ]
    );
  };

  return (
    <ScrollView  keyboardDismissMode='on-drag' contentContainerStyle={styles.scrollContainer}>
      <TextInput
          style={[styles.input, {width: '100%'}]}
          placeholder="Title"
          placeholderTextColor={'#DAD19D'}
          value={note.title}
          onChangeText={handleChangeTitle}
          maxLength={25}
          autoCapitalize='words'
        />
      <TextInput
        style={[styles.input, styles.textArea, {fontSize: 18 }]}
        placeholder="Note"
        placeholderTextColor={'#DAD19D'}
        value={note.description}
        onChangeText={handleChangeDescription}
        multiline
      />
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
        <TouchableOpacity 
          style={styles.button}  
          onPress={handleSave} 
        >
          <Text style={styles.buttonText}>
            {isEditing ? "Save" : "Add Note"}
          </Text>
        </TouchableOpacity>
        {isEditing && (
        <TouchableOpacity 
          style={[styles.button, {marginLeft: 10}]}  
          onPress={handleDelete} 
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFF3AD',
  },
  button: {
    backgroundColor: '#2C2C2C',
    width: '50%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 15,
    color: '#fff',
  },
  input: {
    height: 50,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 5,
    width: '100%',
    fontSize: 20,
  },
  textArea: {
    height: '75%',
    textAlignVertical: 'top',
  },
});

export default EditNoteScreen;
