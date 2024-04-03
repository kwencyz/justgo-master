import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { default as React, useEffect, useRef, useState } from 'react';
import { Animated, Image, KeyboardAvoidingView, Modal, PermissionsAndroid, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Callout, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { ToastProvider, useToast } from 'react-native-toast-notifications';
import { FIREBASE_AUTH, FIRESTORE } from '../FirebaseConfig';

PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

export default function PassengerMenu() {

    const translateY = new Animated.Value(500);
    const animateOrderContainer = () => {
        Animated.timing(translateY, {
            to: 500, // Animate to the top (0)
            duration: 30, // Animation duration
            useNativeDriver: true, // Smoother animations
        }).start();
    };

    const navigation = useNavigation();
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const [origin, setOrigin] = useState();
    const [destination, setDestination] = useState();

    const [distance, setDistance] = useState(null);
    const [price, setPrice] = useState(null);
    const mapRef = useRef(null);
    const [paymentError, setPaymentError] = useState(null);

    const toast = useToast();

    const [pin, setPin] = React.useState({
        latitude: 2.9290,
        longitude: 101.7801
    })
    const [region, setRegion] = React.useState({
        latitude: 2.9290,
        longitude: 101.7801,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
    })

    const [userData, setUserData] = useState(null);
    const auth = FIREBASE_AUTH;
    const firestore = FIRESTORE;

    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Assuming you have stored the user ID in auth.currentUser.uid
                const userId = auth.currentUser.uid;

                // Fetch user data from Firestore
                const userDocRef = doc(collection(firestore, 'passengerdb'), userId);
                const userDocSnapshot = await getDoc(userDocRef);

                if (userDocSnapshot.exists()) {
                    // Set user data in state
                    setUserData(userDocSnapshot.data());
                } else {
                    console.warn('User document does not exist.');
                }
            } catch (error) {
                console.error('Error fetching user data:', error.message);
            }
        };

        fetchUserData();
    }, [auth.currentUser.uid, firestore]);

    const YOUR_GOOGLE_MAPS_API_KEY = 'AIzaSyBSNMpvpwWBkSOtPYygO7v-ejtlUnpAeGc';

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
        })();
    }, []);

    const handleSelectPickupLocation = async (details) => {
        // Handle the selected pickup location
        console.log('Selected Pickup Location:', details);

        // Set pickup location coordinates
        const pickupCoordinates = {
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
        };
        setOrigin({
            name: details.name,
            address: details.formatted_address,
            coordinates: pickupCoordinates,
        });

        // Move to the selected pickup location
        setRegion({
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        });
    };

    const handleSelectLocation = async (details) => {
        animateOrderContainer();
        // Handle the selected location
        console.log('Selected Location:', details);

        // Set destination coordinates
        const destinationCoordinates = {
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
        };
        //setDestination(destinationCoordinates);
        setDestination({
            name: details.name,
            address: details.formatted_address,
            coordinates: destinationCoordinates,
        });
        // Move to the selected location
        setRegion({
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        });
    };

    useEffect(() => {
        const calculateDistance = async () => {
            // Only calculate if both origin and destination are available
            if (origin && destination) {
                try {
                    const response = await axios.get(
                        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.coordinates.latitude},${origin.coordinates.longitude}&destinations=${destination.coordinates.latitude},${destination.coordinates.longitude}&key=${YOUR_GOOGLE_MAPS_API_KEY}`
                    );
                    const distance = response.data.rows[0].elements[0].distance.text;
                    setDistance(distance);

                    const formattedPrice = Math.round(parseFloat(distance.split(' ')[0]) * 1.5);
                    const price = formattedPrice.toFixed(2);
                    setPrice(price);

                    console.log(`Distance: ${distance}, Price: ${price}`);
                } catch (error) {
                    console.error('Error calculating distance:', error.message);
                }
            }
        };

        calculateDistance();
    }, [origin, destination]);

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

                    console.log('Order placed successfully:', orderId);

                    // Clear input fields
                    setOrigin('');
                    setDestination('');
                    setDistance('');
                    setPrice('');

                    // Show a notification or navigate to a confirmation screen
                    console.log('Order Now pressed');
                    const showToast = () => {
                        ToastAndroid.show('Payment is completed.We will notify you once a driver accepts your order', ToastAndroid.SHORT);
                    };
                    showToast();

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

    const navigateScreen = () => {
        if (!distance) {
            alert('Please select pickup location and destination.');
        } else {
            navigation.navigate('ConfirmationScreen', {
                origin,
                destination,
                distance,
                price,
            });
            setOrigin('')
            setDestination('')
            setDistance('')
            setPrice('')
        }
    }

    return (
        <KeyboardAvoidingView style={styles.container}>
            <ToastProvider>
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
                    {/* search bar for pickup location */}
                    <GooglePlacesAutocomplete
                        placeholder="Search Pickup Location"
                        fetchDetails={true}
                        onPress={(data, details = null) => {
                            console.log(data, details);
                            handleSelectPickupLocation(details);
                        }}
                        query={{
                            key: "AIzaSyBSNMpvpwWBkSOtPYygO7v-ejtlUnpAeGc",
                            language: 'en',
                            components: 'country:my',
                            types: 'establishment',
                            radius: 1000,
                            location: `${region.latitude}, ${region.longitude}`,
                        }}
                        styles={{
                            container: { width: '44%', flex: 0, position: 'absolute', zIndex: 1, top: -10, left: 20 },
                            listView: { backgroundColor: 'white', width: '200%' },
                        }}
                    />
                    {/* search bar */}
                    <GooglePlacesAutocomplete
                        placeholder="Search Destination"
                        fetchDetails={true}
                        GooglePlacesSearchQuery={{
                            rankby: "distance"
                        }}
                        onPress={(data, details = null) => {
                            // 'details' is provided when fetchDetails = true
                            console.log(data, details)
                            handleSelectLocation(details)
                        }}
                        query={{
                            key: "AIzaSyBSNMpvpwWBkSOtPYygO7v-ejtlUnpAeGc",
                            language: "en",
                            components: "country:my",
                            types: "establishment",
                            radius: 1000,
                            location: '${region.latitude}, ${region.longitude}'
                        }}
                        styles={{
                            container: { width: '44%', flex: 0, position: "absolute", zIndex: 1, top: -10, right: 20 },
                            listView: { backgroundColor: "white", width: '210%', right: 210 }
                        }}
                    />

                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            region={region}
                            provider="google"
                            showsUserLocation={true}
                        >
                            {destination && (
                                <Marker coordinate={destination.coordinates} pinColor="red">
                                    <Callout>
                                        <Text>Your Destination</Text>
                                    </Callout>
                                </Marker>
                            )}

                            {origin && destination && (
                                <MapViewDirections
                                    origin={origin.coordinates}
                                    destination={destination.coordinates}
                                    apikey={'AIzaSyBSNMpvpwWBkSOtPYygO7v-ejtlUnpAeGc'}
                                    strokeWidth={3}
                                    strokeColor="red"
                                />
                            )}
                        </MapView>
                        <Animated.View style={{ ...styles.orderContainer, transform: [{ translateY }], }}>
                            <View style={styles.orderDetailContainer}>
                                <Text style={{ fontSize: 18, marginLeft: 20, marginTop: 5 }}>Total Distance: {distance}</Text>
                                <Text style={{ fontSize: 18, marginLeft: 20 }}>Total Price: {price}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.orderNowButton}
                                onPress={navigateScreen}
                            >
                                <Text style={styles.orderNowButtonText}>Confirm Payment</Text>
                            </TouchableOpacity>
                        </Animated.View>
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

                    </View>
                </View>
            </ToastProvider>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: 'maroon', // Set the background color of the header
        padding: 10,
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
        marginRight: 20,
    },
    logoImage: {
        width: 300,
        height: 300,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'top',
        alignItems: 'center',
        marginTop: 20,
    },
    inputContainer: {
        width: '80%',
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
    },
    buttonContainer: {
        position: 'relative',
        flex: 1 / 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 25, // Adjust this value as needed for spacing
    },
    button: {
        flex: 1,
        backgroundColor: 'red',
        padding: 5,
        borderRadius: 20,
        width: 120,
        justifyContent: 'center',
        alignItems: 'center',
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
    searchContainer: {
        width: '80%',
        backgroundColor: 'transparent',
        borderBottomWidth: 0,
        borderTopWidth: 0,
        marginBottom: 20,
    },
    searchInputContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        borderBottomWidth: 0, // Remove the default border
    },
    searchInput: {
        color: 'maroon',
    },
    searchResultsContainer: {
        marginTop: 10,
        width: '80%',
    },
    searchResultItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray',
    },
    searchResultText: {
        color: 'white',
        fontSize: 16,
    },
    map: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
    },
    mapContainer: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,

    },
    text: {
        color: 'black',
        fontSize: 18,
    },
    orderContainer: {
        backgroundColor: 'rgb(210, 43, 43)',
        marginTop: 100,
        padding: 5,
        paddingBottom: 200,
        borderRadius: 30,
    },
    orderDetailContainer: {
        margin: 5,
        backgroundColor: 'white',
        padding: 10,
        paddingBottom: 20,
        borderRadius: 25,
    },
    orderNowButton: {
        backgroundColor: 'maroon',
        borderRadius: 15,
        marginTop: 5,
        marginLeft: 20,
        width: '90%',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderNowButtonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalText: {
        fontSize: 24,
        marginBottom: 10,

    },
    modalTextPart: {
        fontSize: 18,
        marginBottom: 10,
        marginTop: 10,
    },
    ModalButton: {
        marginTop: 20,
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 20,
        flexDirection: 'row',

    },
    acceptModalButtonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',

    },
    rejectModalButtonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',

    },
});