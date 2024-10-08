import CustomButton from '@/components/custom/CustomButton';
import CustomTextInput from '@/components/custom/CustomTextInput';
import LogoImage from '@/components/custom/LogoImage';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Dimensions } from 'react-native'

// Navigation imports
import { RootStackParamList } from '../../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { httpRequests } from '@/api/httpRequests';


type SignupScreenProps = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { width } = Dimensions.get('window');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Handle the text input change for password
  const handleEmailPOST = (text: string) => {
    setEmail(text);
  };
  // Handle the text input change for Username
  const handleUsernamePOST = (text: string) => {
    setUsername(text);
  };
  // Handle the text input change for password
  const handlePasswordPOST = (text: string) => {
    setPassword(text);
  };

  // Signup handling
  const handleSignup = async () => { 
    const credentials = {
      email,
      username,
      password,
    };
  
    try {
      // Calls POST 
      const response = await httpRequests.post("/accounts/createNewAccount", credentials);
  
      // Success case
      if (response.status === 201) {
        navigateToMainApp(); // Navigate to the main app on successful signup
      } else {
        // Failure case
        const text = await response.text();
        console.error("Signup failed:", text);

        let errorMessage = 'Signup failed. Please check your inputs.';
        if (text.includes('Message:')) {
          const startIndex = text.indexOf('Message:') + 'Message:'.length;
          errorMessage = text.substring(startIndex).trim();
        }        
        setErrorMessage(errorMessage);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage('An error occurred. Please try again later.');
    }
  };

  // After logging in, the user cannot go back to the previous screens
  const navigateToMainApp = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],  // Only 'Home' will be in the stack
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View>
              <LogoImage style={styles.logo}/>
          </View>          
          <View style={styles.buttonContainer}>
            <Text style={styles.welcomeText}>Register</Text>
            <Text style={styles.descText}>Create your Account</Text>
            <CustomTextInput
              placeholder='Email'
              textContentType='emailAddress'
              width={width * 0.65}
              onChangeText={handleEmailPOST}
              value={email}
            />
            <CustomTextInput
              placeholder='Username'
              // textContentType='username'
              width={width * 0.65}
              onChangeText={handleUsernamePOST}
              value={username}
            />
            <View style={styles.inputIconContainer}>
              <CustomTextInput
                placeholder='Password'
                secureTextEntry={!showPassword}
                width={width * 0.65}
                onChangeText={handlePasswordPOST}
                value={password}
              />
              <TouchableOpacity onPress={toggleShowPassword} style={styles.iconContainer}>
                <Ionicons 
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                  color={'#A69B8F'}
                  size={24}
                />
              </TouchableOpacity>
            </View>
            <CustomButton 
              title="Sign up" 
              fontSize={16}
              width={width * 0.4} 
              // onPress={()  => navigation.navigate('Home')}
              onPress={handleSignup}
            />
            <View style={styles.textButtonContainer}>
              <Text style={{ fontSize: 12}}>Don't have an account?</Text>
              <CustomButton
                title='Log in'
                backgroundColor='transparent'
                textColor='#03A696'
                fontSize={12}
                underlineOnPress={true}
                onPress={() => navigation.navigate('Login')}
              />
            </View>
            {/* Display error message */}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          </View>       
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContainer: {
    flexGrow: 1, 
    alignItems: 'center'
  },
  logo: {
    margin: 25
  },
  welcomeText: {
    fontSize: 24,
    textAlign: 'center'
  },
  descText: {
    fontSize: 15,
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center'
  },
  inputIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // position: 'relative',
    justifyContent: 'flex-end'
  },
  iconContainer: {
    position: 'absolute',
    paddingRight: 7
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: 20
  },
  textButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10
  },
  errorText: {
    marginTop: 10,
    color: 'red', 
    textAlign: 'center', 
  },
});

export default SignupScreen; 