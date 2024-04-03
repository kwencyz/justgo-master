import { useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { default as React, useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FIREBASE_AUTH } from '../FirebaseConfig';

export default function PassengerStatusScreen() {

    const auth = FIREBASE_AUTH;
    const firestore = getFirestore();

    // Get the route object using useRoute()
    const route = useRoute();

    // Retrieve orderId from route.params
    const order = route.params?.orderId;

    const [refreshing, setRefreshing] = useState(false);
    const [orderData, setOrderData] = useState({});
    const [orderStatus, setOrderStatus] = useState(order?.status.toUpperCase());

    const [driverData, setDriverData] = useState({});

    useEffect(() => {
        onRefresh();
    }, []);

    const onRefresh = async () => {

        try {
            setRefreshing(true);

            const userId = auth.currentUser.uid;
            const orderRef = collection(firestore, 'orderdetailsdb');

            // Use a query to filter documents based on orderId and passengerId
            const orderQuery = query(orderRef, where('orderId', '==', order?.orderId));
            const orderSnapshots = await getDocs(orderQuery);

            const orderData = orderSnapshots.docs.map((doc) => doc.data());

            // Assuming there is only one order with the given orderId and passengerId
            if (orderData.length > 0) {
                // Update the order data state
                setOrderData(orderData[0]);
                // Update the order status based on the fetched order
                setOrderStatus(orderData[0]?.status?.toUpperCase());

                if (orderStatus !== 'PENDING') {
                    fetchDriverData(orderData[0]?.driverId);
                }

            } else {
                console.warn('Document does not exist.');
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const fetchDriverData = async (driverId) => {
        try {
            const driverDocRef = doc(firestore, 'driverdb', driverId);
            const driverDoc = await getDoc(driverDocRef);

            if (driverDoc.exists()) {
                const driverData = driverDoc.data();
                console.log('Driver Details:', driverData);

                setDriverData(driverData);

            } else {
                console.warn('Driver document does not exist.');
            }
        } catch (error) {
            console.error('Error fetching driver data:', error.message);
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
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['red', 'maroon']}
                        progressBackgroundColor="white"
                        tintColor="maroon"
                        size="large"
                        title="Refreshing"
                        titleColor="black"
                    />
                }
            >
                <View style={styles.formContainer}>
                    <Text style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 20,
                        marginLeft: 15,
                    }}>
                        {orderStatus}
                    </Text>
                    <Text style={{
                        color: 'white',
                        fontSize: 15,
                        marginLeft: 15,
                        marginBottom: 10,
                    }}>
                        Order ID: {order?.orderId}
                    </Text>
                    <View style={styles.orderDetailContainer}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 10 }}>Order Details</Text>
                        <View style={styles.line} />
                        <Text style={styles.orderDetailText}>Origin: {order?.origin.name}</Text>
                        <Text style={styles.orderDetailText}>Destination: {order?.destination.name}</Text>
                        <Text style={styles.orderDetailText}>Distance: {order?.distance}</Text>
                    </View>

                    <View style={styles.priceDetailContainer}>
                        <Text style={styles.priceText}>Price:</Text>
                        <Text style={styles.priceText}>RM {order?.price}</Text>
                    </View>

                    <View style={styles.orderDetailContainer}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 10 }}>Driver Details</Text>
                        <View style={styles.line} />
                        {orderStatus !== 'PENDING' && (
                            <>
                                <View style={styles.driverDetailContainer}>
                                    <Text style={styles.driverText}>Name:</Text>
                                    <Text style={styles.driverText}>{driverData.username}</Text>
                                </View>
                                <View style={styles.driverDetailContainer}>
                                    <Text style={styles.driverText}>Phone Number:</Text>
                                    <Text style={styles.driverText}>{driverData.phoneNumber}</Text>
                                </View>
                                <View style={styles.driverDetailContainer}>
                                    <Text style={styles.driverText}>Vehicle Number:</Text>
                                    <Text style={styles.driverText}>{driverData.regNo}</Text>
                                </View>
                            </>
                        )}
                    </View>

                </View>
            </ScrollView>
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
    orderDetailContainer: {
        margin: 5,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 20,
        marginBottom: 20,
    },
    orderDetailText: {
        fontSize: 18,
        marginLeft: 10,
        marginBottom: 10,
    },
    line: {
        borderBottomColor: 'maroon',
        borderBottomWidth: 2,
        marginVertical: 10,
        marginHorizontal: 10,
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
    driverDetailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 5,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
        backgroundColor: 'white',
        borderRadius: 15,
    },
    priceText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    driverText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 5,
    },
});