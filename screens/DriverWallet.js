import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE } from '../FirebaseConfig';

export default function DriverWallet() {

    const navigation = useNavigation();
    const [balance, setBalance] = useState(0);
    const [userData, setUserData] = useState(null);
    const auth = FIREBASE_AUTH;
    const firestore = FIRESTORE;
    const [sortedData, setSortedData] = useState([]);

    const [isRefreshing, setIsRefreshing] = useState(false);

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

        const refreshBalance = () => {
            fetchBalance(); // Fetch balance initially
            refreshTransactions();

            const intervalId = setInterval(fetchBalance, 5000);

            return () => clearInterval(intervalId); // Clean up interval on unmount
        };

        refreshBalance(); // Call the refresh function when component mounts

        return () => { }; // No cleanup required for this effect
    }, []);

    const fetchTransactions = async () => {
        try {
            const userId = auth.currentUser.uid; // Assuming you have access to the current user's ID

            const driverWalletCollectionRef = collection(firestore, 'driverwallet');
            const querySnapshot = await getDocs(query(driverWalletCollectionRef, where('userId', '==', userId)));

            const transactions = [];
            querySnapshot.forEach((doc) => {
                const transactionData = doc.data();

                transactionData.id = doc.id;
                transactions.push(transactionData);
            });

            const sortedTransactions = transactions.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());

            setUserData(sortedTransactions);
            setSortedData(sortedTransactions);
        } catch (error) {
            console.error('Error fetching transactions:', error.message);
        }
    };

    const handleTopUpPress = () => {
        navigation.navigate('WithdrawWallet');
    };

    const handleEarningPress = () => {
        navigation.navigate('DriverAnalytics');
    };

    const renderItem = ({ item }) => (
        <View style={styles.flatlistItem}>
            <View style={styles.transactionDetailContainer}>
                <Text style={styles.transactionDetailText}>Date: </Text>
                <Text style={styles.transactionDetailText}>{item.timestamp.toDate().toLocaleDateString()}</Text>
            </View>
            <View style={styles.transactionDetailContainer}>
                <Text style={styles.transactionDetailText}>Time: </Text>
                <Text style={styles.transactionDetailText}>{item.timestamp.toDate().toLocaleTimeString()}</Text>
            </View>
            <View style={styles.transactionDetailContainer}>
                <Text style={styles.transactionDetailText}>Amount: </Text>
                {item.status === 'earning' ? (
                    <>
                        <Text style={styles.transactionDetailText}>RM {item.earningAmount}</Text>
                    </>
                ) : (
                    <Text style={styles.transactionDetailText}>RM {item.withdrawAmount}</Text>
                )}
            </View>
            <View style={styles.transactionDetailContainer}>
                <Text style={styles.transactionDetailText}>Transaction: </Text>
                <Text style={styles.transactionDetailText}>{item?.status?.toUpperCase()}</Text>
            </View>

        </View>
    );

    const refreshTransactions = async () => {
        setIsRefreshing(true);
        await fetchTransactions();
        setIsRefreshing(false);
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

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
                <View >
                    <Text style={styles.title}>JustGo Wallet</Text>
                </View>

                <View style={styles.walletContainer}>
                    <View style={styles.walletLogoContainer}>
                        <Image
                            source={require('../assets/images/wallet.png')} // Update the path to your image
                            style={styles.Walletlogo}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.balanceContainer}>
                        <Text style={styles.balanceText}>Current Balance:</Text>
                        <Text style={styles.balanceAmount}>RM {balance}</Text>
                        <TouchableOpacity
                            style={styles.EarningsButton}
                            onPress={handleEarningPress}
                        >
                            <Text style={styles.EarningsButtonText}>View Earnings</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
            <View>
                <Text style={{ marginLeft: 20, ...styles.balanceText }}>Transaction History:</Text>
                <FlatList
                    style={styles.flatListContainer}
                    data={sortedData}
                    keyExtractor={(transaction) => transaction.id}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={refreshTransactions}
                            colors={['red', 'maroon']}
                            progressBackgroundColor="white"
                            tintColor="maroon"
                            size="large"
                            title="Refreshing"
                            titleColor="black"
                        />
                    }
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.TopUpButton}
                    onPress={handleTopUpPress}
                >
                    <Text style={styles.TopUpButtonText}>Withdraw Wallet</Text>
                </TouchableOpacity>
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
        borderBottomLeftRadius: 0, // Bottom left corner radius
        borderBottomRightRadius: 0, // Bottom right corner radius
    },
    logo: {
        width: 150, // Set the width of your logo
        height: 50, // Set the height of your logo
    },
    Walletlogo: {
        width: 100, // Set the width of your logo
        height: 100, // Set the height of your logo
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
    walletLogoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'left',
        marginLeft: 30,
    },
    logoImage: {
        width: 300,
        height: 300,
    },
    formContainer: {
        height: 170,
        alignItems: 'left',
        backgroundColor: 'maroon',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 10,
    },
    walletContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 0,
        justifyContent: 'space-between',
    },
    balanceContainer: {
        marginRight: 30,
        marginTop: -20,
    },
    balanceText: {
        fontWeight: 'bold',
        marginBottom: 0,
        marginTop: -5,
        color: 'white',
        fontSize: 18,
    },
    balanceAmount: {
        color: 'white',
        fontSize: 40,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    title: {
        color: 'white',
        fontSize: 24,
        marginLeft: 30,
        marginVertical: 10,
        fontWeight: 'bold',
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 0, // Adjust this value as needed for spacing
    },
    TopUpButton: {
        backgroundColor: 'maroon',
        padding: 5,
        borderRadius: 20,
        marginTop: 0,
        width: '80%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    TopUpButtonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    flatListContainer: {
        width: '90%',
        height: '46%',
        marginLeft: 20,
        marginBottom: 10,
    },
    flatlistItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: 'white',
        marginBottom: 10,
        borderRadius: 12,
    },
    transactionDetailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    transactionDetailText: {
        color: 'black',
        fontSize: 18,
        textAlign: 'center',
    },
    EarningsButton: {
        width: 120,
        height: 30,
        marginLeft: 10,
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'white',
    },
    EarningsButtonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
});