import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Add this import
import { doc, setDoc } from 'firebase/firestore';
import { default as React, useState } from 'react';
import { Alert, Dimensions, Image, KeyboardAvoidingView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { FIREBASE_AUTH, FIRESTORE } from '../FirebaseConfig';

const { width } = Dimensions.get('window');

export default function SignupScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const role = ["Passenger", "Driver"];
  const [userType, setUserType] = useState('');
  const [regNo, setRegNo] = useState('');
  const [wallet, setWallet] = useState(0);
  const auth = FIREBASE_AUTH;
  const firestore = FIRESTORE;

  const signUp = async () => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User Type:', userType);
      // Define the collection name based on userType
      const collectionName = userType === "Passenger" ? "passengerdb" : "driverdb";

      // Access Firestore instance using firestore variable
      const userData = {
        uid: auth.currentUser.uid,
        username,
        phoneNumber,
        userType,
        email,
        wallet,
      };

      if (userType === "Driver") {
        userData.regNo = regNo;
      }

      // Access Firestore instance using firestore variable
      await setDoc(doc(firestore, collectionName, auth.currentUser.uid), userData);

      if (userType === "Passenger") {
        navigation.push('PassengerDashboard');
      } else if (userType === "Driver") {
        navigation.push('DriverDashboard');
      }

      console.log('User sign up successfully: ' + auth.currentUser.uid);

    } catch (error) {
      console.log(error);
      alert('Sign Up Failed: ' + error.message);
    }
  }

  const [selectedUserType, setSelectedUserType] = useState('');
  const [textInputVisible, setTextInputVisible] = useState(false);

  const handleDropdownChange = (selectedItem, index) => {
    setSelectedUserType(selectedItem);
    setTextInputVisible(selectedItem === 'Driver');
    setUserType(selectedItem);
  };

  const handleRegister = () => {

    // Validate email format and domain
    const emailRegex = /^[^\s@]+@[siswa.ukm.edu.my]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address with @siswa.ukm.edu.my domain.');
      return;
    } else {

      console.log(phoneNumber);

      if (/^01\d{8,9}$/.test(phoneNumber)) {
        // Update the phoneNumber state if it's a valid number
        setPhoneNumber(phoneNumber);
        signUp();

      } else {
        Alert.alert('Error', 'Please enter a valid phone number.');
        return;
      }

    }

  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <StatusBar style='light' />
      <Image style={styles.backgroundImage} source={require('../assets/images/background.png')} />
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/justgo.png')} style={styles.logoImage} />
      </View>

      <View style={styles.formContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}
          contentContainerStyle={styles.scrollViewContainer}>

          <SelectDropdown
            data={role}
            onSelect={handleDropdownChange}
            defaultButtonText={'Select User Type'}
            buttonTextAfterSelection={(selectedItem, index) => selectedItem}
            rowTextForSelection={(item, index) => item}
            buttonStyle={styles.dropdown2BtnStyle}
            buttonTextStyle={styles.dropdown2BtnTxtStyle}
            renderDropdownIcon={isOpened => (
              <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#FFF'} size={18} />
            )}
            dropdownIconPosition={'right'}
            dropdownStyle={styles.dropdown2DropdownStyle}
            rowStyle={styles.dropdown2RowStyle}
            rowTextStyle={styles.dropdown2RowTxtStyle}
          />
          <View style={styles.inputContainer}>
            <TextInput value={email} style={styles.input} placeholder='Email' placeholderTextColor={'maroon'} onChangeText={(text) => setEmail(text)} />
          </View>
          <View style={styles.inputContainer}>
            <TextInput value={username} style={styles.input} placeholder='Username' placeholderTextColor={'maroon'} onChangeText={(text) => setUsername(text)} />
          </View>
          <View style={styles.inputContainer}>
            <TextInput value={phoneNumber} keyboardType='numeric' style={styles.input} placeholder='Phone Number' placeholderTextColor={'maroon'} onChangeText={(text) => setPhoneNumber(text)} />
          </View>
          <View style={styles.inputContainer}>
            <TextInput value={password} style={styles.input} placeholder='Password' placeholderTextColor={'maroon'} onChangeText={(text) => setPassword(text)} secureTextEntry />
          </View>
          {textInputVisible && (
            <View style={styles.inputContainer}>
              <TextInput
                value={regNo}
                style={[styles.input, { textTransform: 'uppercase' }]}
                placeholder='Registration Number'
                placeholderTextColor={'maroon'}
                onChangeText={(text) => setRegNo(text)}
              />
            </View>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => handleRegister()}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.linkContainer}>
            <Text>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.push('Login')}>
              <Text style={styles.linkText}> Login  </Text>
            </TouchableOpacity>
            <Text>now!</Text>
          </View>

        </ScrollView>


      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({

  inputContainer: {
    width: 300,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 10,
    padding: 10,
    elevation: 3,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  input: {
    color: 'maroon',
    textAlign: 'center',
    fontSize: 18,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -90,
  },
  logoImage: {
    width: 300,
    height: 300,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -100,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '0%',
    paddingBottom: '40%',
  },

  dropdown2BtnStyle: {
    width: 300,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 10,
  },
  dropdown2BtnTxtStyle: {
    color: 'maroon',
    textAlign: 'center',
  },
  dropdown2DropdownStyle: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  dropdown2RowStyle: {
    backgroundColor: 'white',
    borderBottomColor: '#C5C5C5'
  },
  dropdown2RowTxtStyle: {
    color: 'maroon',
    textAlign: 'center',
  },
  buttonContainer: {
    width: 300,
    marginBottom: 20,
    marginTop: 20,
  },
  button: {
    width: '100%',
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 20,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: 'white',
    textDecorationLine: 'underline',
    marginLeft: 5,
  },
});