import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { httpRequests } from '@/api/httpRequests';
import { GlobalContext } from '@/context/GlobalContext';
import { useNavigation } from '@react-navigation/native';
import { ProfileScreenNavigationProp } from '@/app/(tabs)/ProfileStack';

const ChangePasswordScreen = ({ navigation } : any) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
const context = useContext(GlobalContext)

    const setNewPasswordWithWarning = (value : string) => {
        setNewPassword(value)
        console.log(value + " " + confirmPassword)
        if (value != confirmPassword) {
            setErrorMessage("Passwords do not match.")
        } else {
            if (passwordRegex.test(value)) {
                setErrorMessage("")
            } else {
                setErrorMessage(`Password must have:
• At least 8 characters
• At least 1 uppercase letter
• At least 1 lowercase letter
• At least 1 special character (!@#$%^&*)
• At least 1 number`
                  );
        }
    }
}

    const setNewConfirmPasswordWithWarning = (value : string) => {
        setConfirmPassword(value)
        console.log(newPassword + " " + value)
        if (value != newPassword) {
            setErrorMessage("Passwords do not match.")
        } else {
            if (passwordRegex.test(value)) {
                setErrorMessage("")
            } else {
                setErrorMessage(`Password must have:
• At least 8 characters
• At least 1 uppercase letter
• At least 1 lowercase letter
• At least 1 special character (!@#$%^&*)
• At least 1 number`
                  );
        }
        }
    }
    const savePassword = async () => {
        console.log("saving")
        if (currentPassword != "" && newPassword == confirmPassword && passwordRegex.test(newPassword)) {
            console.log("saving2 " + currentPassword + " " + newPassword)
            const response = await fetch(`${httpRequests.getBaseURL()}/accounts/changePassword/${currentPassword}/${newPassword}`, {
                method: 'PUT', // Set method to POST
                headers: {
                  'Content-Type': 'application/json', // Set content type to JSON
                  "Authorization": `Bearer ${context?.data.token}`,
                },
                body: "", // Convert the data to a JSON string
              });
              if (!response.ok) {
                const text = await response.text(); // Extract the text from the response
                if (text.includes('Message:')) {
                    const startIndex = text.indexOf('Message:') + 'Message:'.length;
                    setErrorMessage(text.substring(startIndex).trim());
                  }
                return;
              } else {
                navigation.goBack()
              }
        } else {
            console.log("not saved")
        }
    }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
        <TouchableOpacity style={styles.saveButton} onPress={ savePassword}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.center}>
      <Text style={styles.instructions}>
        Password must be at least 8 characters and should include numbers, letters and special characters.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Current password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="New password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPasswordWithWarning}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setNewConfirmPasswordWithWarning}
      />
      <View style={styles.errorContainer}><View style={styles.errorView}><Text style={{color:'red'}}>{errorMessage}</Text></View></View>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
    errorContainer: {
      width: '90%',
      alignItems: 'flex-start', // Align children horizontally in the center
      justifyContent: 'center', // Align children vertically in the center
      marginVertical: 5, // Add some space around the error container
      marginLeft: '5%'
    },
    errorView: {
      width: '100%', // Adjust the width for better centering
      // padding: 10, // Add some padding for better appearance
      borderRadius: 8, // Add rounded corners
      alignItems: 'flex-start', // Center the text horizontally
    },
    container: { flex: 1, backgroundColor: '#fff', },
    center: {
      alignContent: 'center',
      marginLeft: "5%",
      marginRight: "5%",
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      marginTop: Platform.OS === "ios" ? '10%' : 0
    },
    title: { fontSize: 18, fontWeight: 'bold' },
    saveButton: {
      backgroundColor: '#21BFBF',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
    },
    saveButtonText: { color: '#fff', fontWeight: 'bold' },
    instructions: {
      margin: 16,
      color: '#666',
      fontSize: 14,
    },
    input: {
      backgroundColor: '#f2f2f2',
      padding: 12,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 8,
    },
    navbar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#ddd',
    },
  });
  

export default ChangePasswordScreen;
