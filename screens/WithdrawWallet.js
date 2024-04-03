import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE } from '../FirebaseConfig';

export default function WithdrawWallet() {

    const navigation = useNavigation();

    const [topUpAmount, setTopUpAmount] = useState('');

    const [balance, setBalance] = useState(0);
    const [userData, setUserData] = useState(null);
    const auth = FIREBASE_AUTH;
    const firestore = FIRESTORE;

    useEffect(() => {
        // Function to fetch balance from Firestore
        const fetchBalance = async () => {
            try {
                const userId = auth.currentUser.uid;
                const userDocRef = doc(collection(firestore, 'driverdb'), userId);
                const userDocSnapshot = await getDoc(userDocRef);

                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();
                    setBalance(userData.wallet); // Assuming 'wallet' is the field in Firestore
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching balance: ', error);
            }
        };

        fetchBalance(); // Fetch balance when component mounts
    }, []);

    const handleTopUpPress = async () => {
        try {
            const amount = parseFloat(topUpAmount);
            if (!isNaN(amount)) {
                // Check if the top-up amount is greater than the current balance
                if (amount > balance) {
                    // Display an error alert
                    Alert.alert('Error', 'Top-up amount cannot be greater than the current balance.');
                    return; // Exit the function if there's an error
                }

                // Update the balance with the entered top-up amount
                const updatedBalance = balance - amount;
                setBalance(updatedBalance);

                const currentUser = FIREBASE_AUTH.currentUser;
                if (currentUser) {
                    const userId = currentUser.uid;
                    const userDocRef = doc(collection(firestore, 'driverdb'), userId);

                    await setDoc(userDocRef, { wallet: updatedBalance }, { merge: true });

                    console.log('Wallet updated successfully!');

                    const driverWalletCollectionRef = collection(firestore, 'driverwallet');
                    const timestamp = serverTimestamp();

                    const transactionRef = await addDoc(driverWalletCollectionRef, {
                        userId: userId,
                        withdrawAmount: parseFloat(topUpAmount), // Assuming topUpAmount is a string, parse it to a float
                        updatedBalance: updatedBalance,
                        timestamp: timestamp,
                        status: 'withdrawal',
                    });

                    const transactionId = transactionRef.id;

                    await updateDoc(doc(driverWalletCollectionRef, transactionId), {
                        transactionId: transactionId,
                    });

                    console.log('Transaction details uploaded successfully!', transactionId);

                    // Clear the topUpAmount field after successful update
                    setTopUpAmount('');
                } else {
                    console.log('No user logged in.');
                }
            } else {
                console.log('Invalid amount.');
            }
        } catch (error) {
            console.error('Error updating wallet:', error);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container}>
            <StatusBar backgroundColor="black" style='light' />
            <Image style={styles.backgroundImage} source={require('../assets/images/background.png')} />

            {/* logo */}
            <View style={styles.headerContainer}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/images/justgoHeader.png')} // Update the path to your image
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
            </View>

            <View style={styles.formContainer}>
                {/* container */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    alwaysBounceVertical={false}
                    contentContainerStyle={styles.scrollViewContainer}>

                    <View>
                        <Text style={styles.balText}>Available Balance : RM {balance}</Text>
                    </View>

                    <View>
                        <Text style={styles.amountText}>Withdraw Amount</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput style={styles.input} placeholderTextColor={'maroon'} keyboardType='numeric' value={topUpAmount} onChangeText={setTopUpAmount} />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.TopUpButton}
                            onPress={handleTopUpPress}>
                            <Text style={styles.TopUpButtonText}>Withdraw Now</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.BackButton}>
                            <Text style={styles.BackButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: 'maroon', // Set the background color of the header
        padding: 5,
        justifyContent: 'space-between',
        flexDirection: 'row', // Arrange children in a row
        marginTop: 40,
        borderBottomLeftRadius: 20, // Bottom left corner radius
        borderBottomRightRadius: 20, // Bottom right corner radius
    },
    logo: {
        width: 150, // Set the width of your logo
        height: 50, // Set the height of your logo
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginRight: 10,
    },
    logoImage: {
        width: 300,
        height: 300,
    },
    formContainer: {
        flex: 1,
        //justifyContent: 'top',
        marginTop: 20,
    },
    inputContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        marginLeft: 20,
        marginTop: 10,
        padding: 10,
        elevation: 3,
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
    },
    input: {
        color: 'maroon',
        fontSize: 18,
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
    balText: {
        color: 'white',
        fontSize: 24,
        marginLeft: 25,
        marginTop: 10,
        marginBottom: 30,
        fontWeight: 'bold',
    },
    amountText: {
        color: 'white',
        fontSize: 18,
        marginLeft: 25,
        marginVertical: 0,
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20, // Adjust this value as needed for spacing
    },
    TopUpButton: {
        backgroundColor: 'maroon',
        padding: 0,
        borderRadius: 20,
        marginTop: 5,
        width: '80%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    TopUpButtonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        marginLeft: 10,
    },
    BackButton: {
        backgroundColor: 'maroon',
        padding: 5,
        borderRadius: 20,
        marginTop: 10,
        width: '80%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    BackButtonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',

    },
});