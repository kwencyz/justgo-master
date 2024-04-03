import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { default as React, useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE } from '../FirebaseConfig';

export default function ConfirmationScreen() {

    const navigation = useNavigation();

    // Get the route object using useRoute()
    const route = useRoute();

    // Retrieve orderId from route.params
    const { origin, destination, distance, price } = route.params;

    const handleOrderNow = async () => {
        try {

            // Implement password verification
            const isPasswordCorrect = await verifyPassword(auth.currentUser.email, passwordInput);

            if (isPasswordCorrect) {
                setIsPasswordModalVisible(false);
                setPasswordInput('');

                // Fetch user's wallet balance from Firestore
                const userDocRef = doc(firestore, 'passengerdb', auth.currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                const walletBalance = userDoc.data().wallet;

                // Check if wallet balance is sufficient
                if (walletBalance >= price) {

                    //update wallet balance
                    const newWalletBalance = walletBalance - price
                    await updateDoc(userDocRef, { wallet: newWalletBalance });

                    // Customize your order data
                    const orderData = {
                        origin: origin,
                        destination: destination,
                        passengerId: auth.currentUser.uid,
                        distance: distance,
                        price: parseFloat(price),
                        status: 'pending',
                        timestamp: serverTimestamp(), // Firestore server timestamp
                    };

                    // Add data to a new "orders" collection
                    const orderDocRef = await addDoc(collection(firestore, 'orderdetailsdb'), {
                        ...orderData,
                    });

                    const orderId = orderDocRef.id;

                    await setDoc(orderDocRef, {
                        ...orderData,
                        orderId: orderId, // Set order ID with the auto-generated ID
                    });

                    const userId = auth.currentUser.uid;

                    const passengerWalletCollectionRef = collection(firestore, 'passengerwallet');
                    const timestamp = serverTimestamp();

                    const transactionRef = await addDoc(passengerWalletCollectionRef, {
                        userId: userId,
                        spendingAmount: parseFloat(price),
                        updatedBalance: newWalletBalance,
                        timestamp: timestamp,
                        status: 'spending',
                    });

                    const transactionId = transactionRef.id;

                    await updateDoc(doc(passengerWalletCollectionRef, transactionId), {
                        transactionId: transactionId,
                    });

                    console.log('Transaction details uploaded successfully!', transactionId);

                    console.log('Order placed successfully:', orderId);

                    // Show a notification or navigate to a confirmation screen
                    console.log('Order Now pressed');
                    const showToast = () => {
                        ToastAndroid.show('Payment is completed.We will notify you once a passenger accepts your order', ToastAndroid.SHORT);
                    };
                    showToast();
                    navigateToPassengerHistoryScreen();

                } else {
                    // Wallet balance is insufficient, display a toast message
                    const showToast = () => {
                        ToastAndroid.show('Insufficient funds in your wallet. Please top up your wallet.', ToastAndroid.SHORT);
                    };
                    showToast();
                }
            } else {
                // Incorrect password, display a toast message or handle it accordingly
                const showToast = () => {
                    ToastAndroid.show('Incorrect password. Please try again.', ToastAndroid.SHORT);
                };
                showToast();
            }
        } catch (error) {
            console.error('Error placing order:', error.message);
        }
    };

    const navigateToPassengerHistoryScreen = () => {
        navigation.navigate('PassengerHistoryScreen');
    };

    const [walletBalance, setWalletBalance] = useState(0);
    const auth = FIREBASE_AUTH;
    const firestore = FIRESTORE;

    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');

    useEffect(() => {
        const fetchWalletBalance = async () => {
            try {
                // Assuming you have stored the user ID in auth.currentUser.uid
                const userId = auth.currentUser.uid;

                // Construct the reference to the document in 'passengerdb' collection
                const userDocRef = doc(firestore, 'passengerdb', userId);

                // Fetch the document data
                const userDoc = await getDoc(userDocRef);

                // Check if the document exists
                if (userDoc.exists()) {
                    // Set the wallet balance in state
                    setWalletBalance(userDoc.data().wallet);
                } else {
                    console.warn('User document does not exist.');
                }
            } catch (error) {
                console.error('Error fetching wallet balance:', error.message);
            }
        };


        const refreshBalance = () => {
            fetchWalletBalance();

            const intervalId = setInterval(fetchWalletBalance, 2000);

            return () => clearInterval(intervalId); // Clean up interval on unmount
        };

        refreshBalance();
    }, [auth.currentUser.uid, firestore]);

    const navigateScreen = () => {
        navigation.navigate('TopUpWallet')
    }

    const passwordVerify = async () => {
        if (!distance) {
            alert('Please select pickup location and destination.');
        } else {
            try {
                // Display the password modal
                setIsPasswordModalVisible(true);
            } catch (error) {
                console.error('Error displaying password modal:', error.message);
            }
        }
    };

    const verifyPassword = async (email, enteredPassword) => {
        try {

            // Sign in the user with email and password
            await signInWithEmailAndPassword(auth, email, enteredPassword);

            // If sign-in is successful, the password is correct
            return true;

        } catch (error) {
            // If there's an error, the password is incorrect or the user does not exist
            console.error('Error verifying password:', error.message);
            return false;
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container}>
            <StatusBar backgroundColor="black" style='light' />
            <Image style={styles.backgroundImage} source={require('../assets/images/background.png')} />

            {/* logo and back button */}
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
                <View style={styles.orderDetailContainer}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 5 }}>Order Details</Text>
                    <View style={styles.line} />
                    <Text style={styles.orderDetailText}>Origin: {origin.name}</Text>
                    <Text style={styles.orderDetailText}>Destination: {destination.name}</Text>
                    <Text style={styles.orderDetailText}>Distance: {distance}</Text>
                </View>

                <View style={styles.priceDetailContainer}>
                    <Text style={{ marginRight: 200, ...styles.priceText }}>Price:</Text>
                    <Text style={styles.priceText}>RM {price}</Text>
                </View>

                <View style={styles.paymentDetailContainer}>
                    <Text style={{ padding: 10, marginBottom: -15, ...styles.paymentText }}>Payment Methods:</Text>
                    <Text style={{ padding: 10, ...styles.paymentText }}>JustGo Wallet</Text>

                    <View style={styles.walletDetailContainer}>
                        <Text style={styles.priceText}>{walletBalance > 0 ? `RM ${walletBalance}` : 'No balance'}</Text>
                        <TouchableOpacity
                            style={styles.topupButton}
                            onPress={navigateScreen}
                        >
                            <Text style={styles.topupButtonText}>Top Up!</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.orderContainer}>
                    <TouchableOpacity
                        style={styles.orderNowButton}
                        onPress={passwordVerify}
                    >
                        <Text style={styles.orderNowButtonText}>Order Now</Text>
                    </TouchableOpacity>
                </View>

            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isPasswordModalVisible}
                onRequestClose={() => {
                    setIsPasswordModalVisible(false);
                }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: 300 }}>
                        <Text style={{ fontSize: 18, marginBottom: 10 }}>Enter Your Password</Text>
                        <TextInput
                            secureTextEntry
                            style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 10 }}
                            value={passwordInput}
                            onChangeText={(text) => setPasswordInput(text)}
                            placeholder="Password"
                        />
                        <TouchableOpacity
                            style={{ backgroundColor: 'red', padding: 10, borderRadius: 5, alignItems: 'center' }}
                            onPress={handleOrderNow}>
                            <Text style={{ color: 'white' }}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: 'maroon',
        padding: 5,
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: 40,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    logo: {
        width: 150,
        height: 50,
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        marginBottom: 90,
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
    formContainer: {
        flex: 1,
        marginTop: 20,
        marginHorizontal: 10,
    },
    orderContainer: {
        width: '105%',
        backgroundColor: 'white',
        marginTop: 180,
        marginLeft: -10,
        padding: 15,
        paddingBottom: 50,
        //borderRadius: 20,
    },
    orderDetailContainer: {
        margin: 5,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 20,
        marginBottom: 20,
    },
    priceDetailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: 5,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
    },
    orderNowButton: {
        backgroundColor: 'maroon',
        borderRadius: 20,
        marginLeft: 0,
        width: '100%',
        padding: 10,
    },
    orderNowButtonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    topupButton: {
        backgroundColor: 'maroon',
        borderRadius: 20,
        marginLeft: 0,
        width: 120,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topupButtonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    paymentDetailContainer: {
        margin: 0,
        padding: 0,
        borderRadius: 15,
        marginBottom: 20,
    },
    walletDetailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: 5,
        marginLeft: 5,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 15,
        marginBottom: 5,
    },
    orderDetailText: {
        fontSize: 18,
        marginLeft: 10,
        marginBottom: 10,
    },
    priceText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    paymentText: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 0,
    },
    line: {
        borderBottomColor: 'black',
        borderBottomWidth: 2,
        marginVertical: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 24,
        fontWeight: '300',
        marginBottom: 10,
        color: 'white',
    },
    orderItem: {
        padding: 10,
        backgroundColor: 'white',
        marginBottom: 10,
        borderRadius: 10,
    },
    destination: {
        // Styles for destination text
        fontSize: 16,
    },
    price: {
        // Styles for price text
        fontSize: 16,
    },
    orderText: {
        fontSize: 16,
        // /fontWeight: 'bold',
    },
    flatListContainer: {
        width: '95%',
        marginLeft: 10,
        marginBottom: 10,
    },
});