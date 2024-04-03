import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE } from '../FirebaseConfig';

export default function TopUpWallet() {

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
                const userDocRef = doc(collection(firestore, 'passengerdb'), userId);
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
                // Update the balance with the entered top-up amount
                const updatedBalance = balance + amount;
                setBalance(updatedBalance);

                const currentUser = FIREBASE_AUTH.currentUser;
                if (currentUser) {
                    const userId = currentUser.uid;
                    const userDocRef = doc(collection(firestore, 'passengerdb'), userId);

                    await setDoc(userDocRef, { wallet: updatedBalance }, { merge: true });

                    const passengerWalletCollectionRef = collection(firestore, 'passengerwallet');
                    const timestamp = serverTimestamp();

                    const transactionRef = await addDoc(passengerWalletCollectionRef, {
                        userId: userId,
                        topupAmount: amount, // Assuming topUpAmount is a string, parse it to a float
                        updatedBalance: updatedBalance,
                        timestamp: timestamp,
                        status: 'topup',
                    });

                    const transactionId = transactionRef.id;

                    await updateDoc(doc(passengerWalletCollectionRef, transactionId), {
                        transactionId: transactionId,
                    });

                    console.log('Transaction details uploaded successfully!', transactionId);

                    console.log('Wallet updated successfully!');
                    Linking.openURL('https://www.maybank2u.com.my/home/m2u/common/login.do'); // Replace 'touchngo://' with the correct scheme if available

                } else {
                    console.log('No user logged in.');
                    Alert.alert('Error updating wallet:', error);
                }
            } else {
                console.log('Invalid amount.');
                Alert.alert('Please insert a valid amount.');
            }
        } catch (error) {
            console.error('Error updating wallet:', error);
            Alert.alert('Error updating wallet:', error);
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
                        <Text style={styles.amountText}>Top Up Amount RM</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput style={styles.input} placeholderTextColor={'maroon'} keyboardType='numeric' value={topUpAmount} onChangeText={setTopUpAmount} />
                    </View>

                    <View style={styles.topupContainer}>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={styles.TopUpButton}
                                onPress={() => setTopUpAmount('5')}>
                                <Text style={styles.TopUpButtonText}>RM 5</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.TopUpButton}
                                onPress={() => setTopUpAmount('10')}>
                                <Text style={styles.TopUpButtonText}>RM 10</Text>
                            </TouchableOpacity>

                        </View>

                        <View style={styles.row}>
                            <TouchableOpacity
                                style={styles.TopUpButton}
                                onPress={() => setTopUpAmount('15')}>
                                <Text style={styles.TopUpButtonText}>RM 15</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.TopUpButton}
                                onPress={() => setTopUpAmount('20')}>
                                <Text style={styles.TopUpButtonText}>RM 20</Text>
                            </TouchableOpacity>


                        </View>

                        <View style={styles.row}>
                            <TouchableOpacity
                                style={styles.TopUpButton}
                                onPress={() => setTopUpAmount('25')}>
                                <Text style={styles.TopUpButtonText}>RM 25</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.TopUpButton}
                                onPress={() => setTopUpAmount('30')}>
                                <Text style={styles.TopUpButtonText}>RM 30</Text>
                            </TouchableOpacity>

                        </View>
                    </View>

                    <View style={styles.buttonContainer}>

                        <TouchableOpacity
                            style={styles.functionButton}
                            onPress={handleTopUpPress}>
                            <Text style={styles.BackButtonText}>Top Up Now</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.functionButton}>
                            <Text style={styles.BackButtonText}>Return</Text>
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
        marginLeft: 10,
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
        fontSize: 20,
        marginLeft: 25,
        marginVertical: 0,
        fontWeight: 'bold',
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20, // Adjust this value as needed for spacing
    },
    topupContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10, // Adjust this value as needed for spacing
    },
    topupContainer: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
        marginBottom: 200,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    TopUpButton: {
        flex: 1,
        backgroundColor: 'maroon',
        padding: 0,
        borderRadius: 10,
        marginTop: 5,
        marginRight: 10,
        width: 120,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    TopUpButtonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    BackButton: {
        flex: 1,
        backgroundColor: 'maroon',
        padding: 0,
        borderRadius: 10,
        marginTop: 5,
        marginRight: 10,
        width: 120,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    functionButton: {
        flex: 1,
        backgroundColor: 'white',
        padding: 0,
        borderRadius: 10,
        marginTop: 5,
        marginRight: 10,
        width: '80%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    BackButtonText: {
        color: 'maroon',
        fontSize: 18,
        textAlign: 'center',
    },
});