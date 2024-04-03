import { StatusBar } from 'expo-status-bar';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FIREBASE_AUTH, FIRESTORE } from '../FirebaseConfig';

export default function DriverAnalyticsScreen() {

    const auth = FIREBASE_AUTH;
    const firestore = FIRESTORE;

    const [totalEarningsByDay, setTotalEarningsByDay] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('daily');


    const { width: screenWidth } = useWindowDimensions();

    const getDayKey = (date) => {
        const currentDate = new Date(date);
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based
        return `${day}/${month}`;
    };
    const getMonthKey = (date) => {
        const currentDate = new Date(date);
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based
        return `${year}-${month}`;
    };

    const calculateTotalEarningsByDay = async (userId, days = 5) => {
        try {
            // Fetch earnings data from Firestore
            const orderRef = collection(firestore, 'driverwallet');
            const q = query(
                orderRef,
                where('userId', '==', userId),
                where('status', '==', 'earning'),
                orderBy('timestamp', 'desc'),
                limit(days)
            );
            const querySnapshot = await getDocs(q);
            const orderData = querySnapshot.docs.map((doc) => doc.data());

            // Organize data by day
            const earningsByDay = orderData.reduce((acc, data) => {
                const timestamp = data.timestamp.toDate(); // Assuming 'timestamp' is a Firestore timestamp
                const dayKey = getDayKey(timestamp);
                acc[dayKey] = (acc[dayKey] || 0) + data.earningAmount;
                return acc;
            }, {});

            return earningsByDay;
        } catch (error) {
            console.error('Error calculating total earnings by day:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchTotalEarningsByDay = async () => {
            try {
                const userId = auth.currentUser.uid;
                const totalEarnings = await calculateTotalEarningsByDay(userId, 5); // Fetch data for the last 5 days

                // Ensure that totalEarningsByDay starts from zero
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 4); // Assuming you want data for the last 5 days
                const labels = Array.from({ length: 5 }, (_, index) => getDayKey(new Date(startDate.setDate(startDate.getDate() + 1))));

                const paddedEarnings = labels.map((label) => totalEarnings[label] || 0);

                setTotalEarningsByDay({
                    labels,
                    data: paddedEarnings,
                });
            } catch (error) {
                console.error('Error fetching total earnings by day:', error);
            }
        };

        fetchTotalEarningsByDay();

    }, [auth.currentUser.uid, firestore]);

    const [totalEarningPerDay, setTotalEarningPerDay] = useState(null);
    const [totalOrderPerDay, setTotalOrderPerDay] = useState(null);

    const calculateDailyOrders = async (userId, days = 1) => {
        try {
            // Fetch data from Firestore
            const orderRef = collection(firestore, 'orderdetailsdb');
            const q = query(
                orderRef,
                where('driverId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(days)
            );
            const querySnapshot = await getDocs(q);
            const orderData = querySnapshot.docs.map((doc) => doc.data());

            // Organize data by day
            const completedOrdersByDay = orderData.reduce((acc, data) => {
                const timestamp = data.timestamp.toDate();
                const dayKey = getDayKey(timestamp);
                if (data.status === 'completed') {
                    acc[dayKey] = (acc[dayKey] || 0) + 1;
                }
                return acc;
            }, {});

            return completedOrdersByDay;
        } catch (error) {
            console.error('Error calculating daily completed orders:', error);
            return null;
        }
    };

    const calculateDailyEarnings = async (userId, days = 1) => {
        try {
            // Fetch data from Firestore
            const walletRef = collection(firestore, 'driverwallet');
            const q = query(
                walletRef,
                where('userId', '==', userId),
                where('status', '==', 'earning'),
                orderBy('timestamp', 'desc'),
                limit(days)
            );
            const querySnapshot = await getDocs(q);
            const walletData = querySnapshot.docs.map((doc) => doc.data());

            // Organize data by day and calculate total earnings
            const totalsByDay = walletData.reduce((acc, data) => {
                const timestamp = data.timestamp.toDate();
                const dayKey = getDayKey(timestamp);
                const earningAmount = data.earningAmount || 0;

                acc[dayKey] = (acc[dayKey] || 0) + earningAmount;
                return acc;
            }, {});

            return totalsByDay;
        } catch (error) {
            console.error('Error calculating daily earnings:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchDailyData = async () => {
            try {
                const userId = auth.currentUser.uid;

                // Calculate daily earnings
                const dailyEarnings = await calculateDailyEarnings(userId, 1);
                setTotalEarningPerDay(dailyEarnings);

                // Calculate daily orders
                const dailyOrders = await calculateDailyOrders(userId, 1);
                setTotalOrderPerDay(dailyOrders);
            } catch (error) {
                console.error('Error fetching daily data:', error);
            }
        };

        fetchDailyData();
    }, [auth.currentUser.uid, firestore]);

    const [totalEarningPerWeek, setTotalEarningPerWeek] = useState(null);
    const [totalOrderPerWeek, setTotalOrderPerWeek] = useState(null);

    const calculateWeeklyOrders = async (userId, days = 7) => {
        try {
            // Fetch data from Firestore
            const orderRef = collection(firestore, 'orderdetailsdb');
            const q = query(
                orderRef,
                where('driverId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(days)
            );
            const querySnapshot = await getDocs(q);
            const orderData = querySnapshot.docs.map((doc) => doc.data());

            // Organize data by day
            const completedOrdersByDay = orderData.reduce((acc, data) => {
                const timestamp = data.timestamp.toDate();
                const dayKey = getDayKey(timestamp);
                if (data.status === 'completed') {
                    acc[dayKey] = (acc[dayKey] || 0) + 1;
                }
                return acc;
            }, {});

            return completedOrdersByDay;
        } catch (error) {
            console.error('Error calculating weekly completed orders:', error);
            return null;
        }
    };

    const calculateWeeklyEarnings = async (userId, days = 7) => {
        try {
            // Fetch data from Firestore
            const walletRef = collection(firestore, 'driverwallet');
            const q = query(
                walletRef,
                where('userId', '==', userId),
                where('status', '==', 'earning'),
                orderBy('timestamp', 'desc'),
                limit(days)
            );
            const querySnapshot = await getDocs(q);
            const walletData = querySnapshot.docs.map((doc) => doc.data());

            // Organize data by day and calculate total earnings
            const totalsByDay = walletData.reduce((acc, data) => {
                const timestamp = data.timestamp.toDate();
                const dayKey = getDayKey(timestamp);
                const earningAmount = data.earningAmount || 0;

                acc[dayKey] = (acc[dayKey] || 0) + earningAmount;
                return acc;
            }, {});

            return totalsByDay;
        } catch (error) {
            console.error('Error calculating weekly earnings:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchWeeklyData = async () => {
            try {
                const userId = auth.currentUser.uid;

                // Calculate weekly earnings
                const weeklyEarnings = await calculateWeeklyEarnings(userId, 7);
                setTotalEarningPerWeek(weeklyEarnings);

                // Calculate total orders (you can replace this with your own function)
                const weeklyOrders = await calculateWeeklyOrders(userId, 7);
                setTotalOrderPerWeek(weeklyOrders);
            } catch (error) {
                console.error('Error fetching weekly data:', error);
            }
        };

        fetchWeeklyData();
    }, [auth.currentUser.uid, firestore]);

    const [totalEarningPerMonth, setTotalEarningPerMonth] = useState(null);
    const [totalOrderPerMonth, setTotalOrderPerMonth] = useState(null);

    const calculateMonthlyOrders = async (userId, days = 30) => {
        try {
            // Fetch data from Firestore
            const orderRef = collection(firestore, 'orderdetailsdb');
            const q = query(
                orderRef,
                where('driverId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(days)
            );
            const querySnapshot = await getDocs(q);
            const orderData = querySnapshot.docs.map((doc) => doc.data());

            // Organize data by day
            const completedOrdersByDay = orderData.reduce((acc, data) => {
                const timestamp = data.timestamp.toDate();
                const monthKey = getMonthKey(timestamp);
                if (data.status === 'completed') {
                    acc[monthKey] = (acc[monthKey] || 0) + 1;
                }
                return acc;
            }, {});

            return completedOrdersByDay;
        } catch (error) {
            console.error('Error calculating monthly completed orders:', error);
            return null;
        }
    };

    const calculateMonthlyEarnings = async (userId, days = 30) => {
        try {
            // Fetch data from Firestore
            const walletRef = collection(firestore, 'driverwallet');
            const q = query(
                walletRef,
                where('userId', '==', userId),
                where('status', '==', 'earning'),
                orderBy('timestamp', 'desc'),
                limit(days)
            );
            const querySnapshot = await getDocs(q);
            const walletData = querySnapshot.docs.map((doc) => doc.data());

            // Organize data by month and calculate total earnings
            const totalsByMonth = walletData.reduce((acc, data) => {
                const timestamp = data.timestamp.toDate();
                const monthKey = getMonthKey(timestamp);
                const earningAmount = data.earningAmount || 0;

                acc[monthKey] = (acc[monthKey] || 0) + earningAmount;
                return acc;
            }, {});

            return totalsByMonth;
        } catch (error) {
            console.error('Error calculating monthly earnings:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchMonthlyData = async () => {
            try {
                const userId = auth.currentUser.uid;

                // Calculate monthly earnings
                const monthlyEarnings = await calculateMonthlyEarnings(userId, 30);
                setTotalEarningPerMonth(monthlyEarnings);

                // Calculate total orders (you can replace this with your own function)
                const monthlyOrders = await calculateMonthlyOrders(userId, 30);
                setTotalOrderPerMonth(monthlyOrders);
            } catch (error) {
                console.error('Error fetching monthly data:', error);
            }
        };

        fetchMonthlyData();
    }, [auth.currentUser.uid, firestore]);

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
                <View style={styles.graphContainer}>
                    <Text style={{ marginTop: 10, marginBottom: 10, ...styles.sectionHeader }}>Daily Earnings Graph</Text>
                    {totalEarningsByDay ? (
                        <LineChart
                            data={{
                                labels: totalEarningsByDay.labels,
                                datasets: [
                                    {
                                        data: totalEarningsByDay.data,
                                    },
                                ],
                            }}
                            width={screenWidth - 50} // Adjust width as needed
                            height={220}
                            chartConfig={{
                                backgroundColor: 'rgba(255, 255, 255, 0)',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 2,
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: {
                                    borderRadius: 16,
                                },
                                yAxisInterval: 10,
                            }}
                        />
                    ) : (
                        <Text>Loading...</Text>
                    )}
                </View>
                <View style={styles.filterButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.filterButton, selectedStatus === 'daily' && styles.selectedFilterButton]}
                        onPress={() => setSelectedStatus('daily')}
                    >
                        <Text style={styles.filterButtonsText}>Daily</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterButton, selectedStatus === 'weekly' && styles.selectedFilterButton]}
                        onPress={() => setSelectedStatus('weekly')}
                    >
                        <Text style={styles.filterButtonsText}>Weekly</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterButton, selectedStatus === 'monthly' && styles.selectedFilterButton]}
                        onPress={() => setSelectedStatus('monthly')}
                    >
                        <Text style={styles.filterButtonsText}>Monthly</Text>
                    </TouchableOpacity>
                </View>
                <Text style={{ marginTop: 10, marginBottom: 10, ...styles.sectionHeader }}>Your
                    {selectedStatus === 'daily' && ' Daily'}
                    {selectedStatus === 'weekly' && ' Weekly'}
                    {selectedStatus === 'monthly' && ' Monthly'} Activity
                </Text>
                <View style={styles.detailsContainer}>
                    <View style={styles.dataContainer}>
                        <Text style={styles.dataText}>Total Earnings: </Text>
                        <Text style={styles.dataText}>
                            RM {selectedStatus === 'daily' ? (totalEarningPerDay ? Object.values(totalEarningPerDay).reduce((sum, value) => sum + value, 0) : 0) :
                                selectedStatus === 'weekly' ? (totalEarningPerWeek ? Object.values(totalEarningPerWeek).reduce((sum, value) => sum + value, 0) : 0) :
                                    (totalEarningPerMonth ? Object.values(totalEarningPerMonth).reduce((sum, value) => sum + value, 0) : 0)
                            }
                        </Text>
                    </View>
                    <View style={styles.dataContainer}>
                        <Text style={styles.dataText}>Total Order Completed: </Text>
                        <Text style={styles.dataText}>
                            {selectedStatus === 'daily' ? (totalOrderPerDay ? Object.values(totalOrderPerDay).reduce((sum, value) => sum + value, 0) : 0) :
                                selectedStatus === 'weekly' ? (totalOrderPerWeek ? Object.values(totalOrderPerWeek).reduce((sum, value) => sum + value, 0) : 0) :
                                    (totalOrderPerMonth ? Object.values(totalOrderPerMonth).reduce((sum, value) => sum + value, 0) : 0)
                            }
                        </Text>
                    </View>
                </View>
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
        alignItems: 'center',
        marginTop: 20,
    },
    graphContainer: {
        backgroundColor: 'maroon',
        width: '100%',
        height: '40%',
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 20,
    },
    dataContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 5,
    },
    detailsContainer: {
        width: '80%',
        backgroundColor: 'white',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: 'white',
        marginTop: 20,
        borderRadius: 12,
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
        width: '80%',
        marginBottom: 20,
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
        width: 350,
        height: 500,
    },
    mapContainer: {
        flex: 1,
        paddingTop: 70,
    },
    errorContainer: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    errorText: {
        color: 'white',
        textAlign: 'center',
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    dataText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    filterButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30,
        marginBottom: 10,
    },
    filterButtonsText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    filterButton: {
        padding: 10,
        borderBottomWidth: 5,
        borderBottomColor: 'rgba(120, 0, 0, 0.3)',
    },
    selectedFilterButton: {
        //backgroundColor: 'rgba(120, 0, 0, 0.7)',
        borderBottomColor: 'maroon',
    },
});