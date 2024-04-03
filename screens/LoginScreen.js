/* eslint-disable no-undef */
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore'; // Import necessary Firestore functions
import { default as React, useState } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE } from '../FirebaseConfig';
const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const userType = ["Passenger", "Driver"];
    const auth = FIREBASE_AUTH;
    const firestore = FIRESTORE;

    const signIn = async () => {
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            const userUID = response.user.uid;

            // Query to retrieve user data from 'passengerdb'
            const passengerQuery = query(collection(firestore, 'passengerdb'), where('uid', '==', userUID));
            const passengerQuerySnapshot = await getDocs(passengerQuery);

            // Query to retrieve user data from 'driverdb'
            const driverQuery = query(collection(firestore, 'driverdb'), where('uid', '==', userUID));
            const driverQuerySnapshot = await getDocs(driverQuery);

            // Query to check if the user is an admin
            const adminQuery = query(collection(firestore, 'admindb'), where('uid', '==', userUID));
            const adminQuerySnapshot = await getDocs(adminQuery);

            if (passengerQuerySnapshot.size > 0) {
                passengerQuerySnapshot.forEach((doc) => {
                    const passengerUserData = doc.data();
                    console.log('Passenger User Data:', passengerUserData);
                    // Navigate to Passenger Dashboard
                    navigation.navigate('PassengerDashboard');
                });
            } else if (driverQuerySnapshot.size > 0) {
                driverQuerySnapshot.forEach((doc) => {
                    const driverUserData = doc.data();
                    console.log('Driver User Data:', driverUserData);
                    // Navigate to Driver Dashboard
                    navigation.navigate('DriverDashboard');
                });
            } else if (adminQuerySnapshot.size > 0) {
                adminQuerySnapshot.forEach((doc) => {
                    const adminUserData = doc.data();
                    console.log('Admin User Data:', adminUserData);
                    // Navigate to Admin Dashboard
                    navigation.navigate('AdminMenu');
                });
            } else {
                console.log('User document does not exist.');
                alert('Login Failed ' + error.message);
            }

            //navigation.push('Dashboard')
        } catch (error) {
            console.log(error);
            alert('Login Failed ' + error.message);
        }
    }

    const changePassword = async () => {
        const response = await sendPasswordResetEmail(auth, email)
            .then(() => alert("Check your email to reset password"))
            .catch((error) => {
                alert(error)
            })
    }

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

                    <View style={styles.inputContainer}>
                        <TextInput value={email} style={styles.input} placeholder='Email' placeholderTextColor={'maroon'} onChangeText={(text) => setEmail(text)} />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput value={password} style={styles.input} placeholder='Password' placeholderTextColor={'maroon'} onChangeText={(text) => setPassword(text)} secureTextEntry />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={() => signIn()}>
                            <Text style={styles.buttonText}>Login</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.linkContainer}>
                        <Text>Forget Password?</Text>
                        <TouchableOpacity onPress={() => navigation.push('ForgetPass')}>
                            <Text style={styles.linkText}> Click Here </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.linkContainer}>
                        <Text>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.push('Signup')}>
                            <Text style={styles.linkText}> Signup </Text>
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
        marginBottom: 20,
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
        marginTop: 90,
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
    },
    scrollViewContainer: {
        flexGrow: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: '5%',
        paddingBottom: '40%',
    },

    dropdown2BtnStyle: {
        width: 300,
        height: 50,
        backgroundColor: 'white',
        borderRadius: 20,
        marginBottom: 20,
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
        marginTop: 0,
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