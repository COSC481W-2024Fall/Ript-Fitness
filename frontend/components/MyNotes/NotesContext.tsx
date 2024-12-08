import { httpRequests } from '@/api/httpRequests';
import TimeZone from '@/api/timeZone';
import { GlobalContext } from '@/context/GlobalContext';
import React, { createContext, useContext, useState } from 'react';

//Defines Note object
export interface Note {
  noteId: number;
  title: string;
  description: string;
  updatedAt: string;
}

interface NotesContextType {
  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (updatedNote: Note) => void;
  deleteNote: (noteId: number) => void;
  fetchNotes: () => Promise<void>;
  loading: boolean;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = useContext(GlobalContext);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const userTimeZone = TimeZone.get(); // Get the user's timezone
  
  // Fetch notes for user
  const fetchNotes = async () => {
    setLoading(true);
    try {
      // console.log('Fetching notes...');
      const response = await fetch(`${httpRequests.getBaseURL()}/note/getAllNotesFromLoggedInUser`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context?.data.token}`,
        },
      });
      const data = await response.json();
      console.log('Fetched notes:', data); 
      if (response.ok) {
        // Map the response 
        const mappedNotes = data.map((note: any) => {
          const createdDate = note.updatedAt;
          // console.log('date created: ', createdDate);
          const formattedDateTime = TimeZone.convertToTimeZone(createdDate, userTimeZone);
          return {
            noteId: note.noteId.toString(), 
            title: note.title,
            updatedAt: formattedDateTime, 
            description: note.description,
          };
        });
  
        setNotes(mappedNotes);
      } else {
        console.error('Failed to fetch notes:', data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
    finally {
      setLoading(false);
    }
  };

  // Add a new note
  const addNote = async (note: Note) => {
    try {
      const response = await fetch(`${httpRequests.getBaseURL()}/note/addNote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context?.data.token}`,
        },
        body: JSON.stringify({
          title: note.title,
          description: note.description,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        const newNote = {...data, updatedAt: TimeZone.convertToTimeZone(data.updatedAt, TimeZone.get()) }
        setNotes(prevNotes => [newNote, ...prevNotes]);
      } else {
        console.error('Failed to add note:', data);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  // Edit an existing note
  const updateNote = async (updatedNote: Note) => {
    try {
      const response = await fetch(`${httpRequests.getBaseURL()}/note/editNote/${updatedNote.noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context?.data.token}`,
        },
        body: JSON.stringify({
          title: updatedNote.title,
          description: updatedNote.description,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        const newNote = {...data, updatedAt: TimeZone.convertToTimeZone(data.updatedAt, TimeZone.get()) }
        console.log(newNote)
        setNotes(prevNotes => {
          // Filter out the old note with the same noteId, if it exists
          const filteredNotes = prevNotes.filter(note => note.noteId != newNote.noteId);
          
          // Add the new note at the beginning of the filtered list
          return [newNote, ...filteredNotes];
        });
      } else {
        console.error('Failed to update note:', await response.text());
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  // Delete a note
  const deleteNote = async (noteId: number) => {
    try {
      const response = await fetch(`${httpRequests.getBaseURL()}/note/deleteNote/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context?.data.token}`,
        },
      });
      if (response.ok) {
        setNotes(prevNotes => prevNotes.filter(note => note.noteId !== noteId));
      } else {
        console.error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote, fetchNotes, loading }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};