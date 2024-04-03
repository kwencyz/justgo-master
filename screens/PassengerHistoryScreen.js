import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { default as React, useEffect, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FIREBASE_AUTH } from '../FirebaseConfig';

export default function PassengerHistoryScreen() {

  const [orderHistory, setOrderHistory] = useState([]);
  const navigation = useNavigation();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [inProgressOrders, setInProgressOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const auth = FIREBASE_AUTH;
  const firestore = getFirestore();

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        // Assuming you have stored the user ID in auth.currentUser.uid
        const userId = auth.currentUser.uid;

        // Fetch order history data from Firestore
        const orderHistoryRef = collection(firestore, 'orderdetailsdb');
        const orderHistorySnapshots = await getDocs(orderHistoryRef);
        const orderHistoryData = orderHistorySnapshots.docs.map((doc) => doc.data());

        // Filter orders based on passengerId
        const filteredPending = orderHistoryData.filter((order) => order.status === 'pending' && order.passengerId === userId);
        const filteredInProgress = orderHistoryData.filter((order) =>
          (order.status === 'accepted' && order.passengerId === userId) ||
          (order.status === 'in-progress' && order.passengerId === userId)
        );
        const filteredCompleted = orderHistoryData.filter((order) => order.status === 'completed' && order.passengerId === userId);
        
        filteredPending.sort((a, b) => {
          const timestampA = a.timestamp.toMillis();
          const timestampB = b.timestamp.toMillis();

          // Concatenate date and time as a numeric value for comparison
          return timestampB - timestampA;
        });

        filteredInProgress.sort((a, b) => {
          const timestampA = a.timestamp.toMillis();
          const timestampB = b.timestamp.toMillis();

          // Concatenate date and time as a numeric value for comparison
          return timestampB - timestampA;
        });

        filteredCompleted.sort((a, b) => {
          const timestampA = a.timestamp.toMillis();
          const timestampB = b.timestamp.toMillis();

          // Concatenate date and time as a numeric value for comparison
          return timestampB - timestampA;
        });

        // Set the order history and orders in state
        setOrderHistory(orderHistoryData);
        setPendingOrders(filteredPending);
        setInProgressOrders(filteredInProgress);
        setCompletedOrders(filteredCompleted);
      } catch (error) {
        console.error('Error fetching order history:', error);
      }
    };

    fetchOrderHistory();

    // Set interval to fetch every 2 seconds
    const intervalId = setInterval(fetchOrderHistory, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);

  }, [auth.currentUser.uid, firestore, setOrderHistory, setPendingOrders, setInProgressOrders, setCompletedOrders]);

  const renderOrderItem = ({ item }) => {
    // Assuming 'timestamp' is the field containing the Firestore Timestamp
    const orderTimestamp = item.timestamp.toDate();

    return (
      <TouchableOpacity style={styles.FlatViewButton} onPress={() => navigateToPassengerStatusScreen(item)}>
        <View style={styles.orderItem} key={item.id}>
          <Text style={styles.orderText}>Pickup Address: {item.origin.name}</Text>
          <Text style={styles.orderText}>Delivery Address: {item.destination.name}</Text>
          <Text style={styles.orderText}>Total Price: RM{item.price}</Text>

          <Text style={styles.orderText}>Date: {orderTimestamp.toLocaleDateString()}</Text>
          <Text style={styles.orderText}>Time: {orderTimestamp.toLocaleTimeString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleRefresh = async () => {
    try {
      // Set refreshing state to true to indicate the start of refresh
      setIsRefreshing(true);

      // Simulate a delay (optional)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch updated data from Firestore
      const userId = auth.currentUser.uid;
      const orderHistoryRef = collection(firestore, 'orderdetailsdb');
      const orderHistorySnapshots = await getDocs(orderHistoryRef);
      const orderHistoryData = orderHistorySnapshots.docs.map((doc) => doc.data());

      orderHistoryData.sort((a, b) => {
        const timestampA = a.timestamp.toMillis();
        const timestampB = b.timestamp.toMillis();

        // Concatenate date and time as a numeric value for comparison
        return timestampB - timestampA;
      });

      // Filter orders based on passengerId
      const filteredPending = orderHistoryData.filter((order) => order.status === 'pending' && order.passengerId === userId);
      const filteredInProgress = orderHistoryData.filter((order) =>
        (order.status === 'accepted' && order.passengerId === userId) ||
        (order.status === 'in-progress' && order.passengerId === userId)
      );
      const filteredCompleted = orderHistoryData.filter((order) => order.status === 'completed' && order.passengerId === userId);

      // Set the updated data in state
      setOrderHistory(orderHistoryData);
      setPendingOrders(filteredPending);
      setInProgressOrders(filteredInProgress);
      setCompletedOrders(filteredCompleted);

    } catch (error) {
      console.error('Error fetching updated order history:', error);
    } finally {
      // Set refreshing state to false to indicate the end of refresh
      setIsRefreshing(false);
    }
  };

  const navigateToPassengerStatusScreen = (orderId) => {
    navigation.navigate('PassengerStatusScreen', { orderId });
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

      <FlatList
        style={styles.flatListContainer}
        data={[
          { title: 'Pending Orders', data: pendingOrders },
          { title: 'Orders In-Progress', data: inProgressOrders },
          { title: 'Completed Orders', data: completedOrders },
        ]}
        renderItem={({ item }) => (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>{item.title}</Text>
            </View>
            <FlatList
              style={styles.flatListContainer}
              data={item.data}
              renderItem={renderOrderItem}
              keyExtractor={(order) => order.id}
            />
          </>
        )}
        keyExtractor={(item) => item.title}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['red', 'maroon']}
            progressBackgroundColor="white"
            tintColor="maroon"
            size="large"
            title="Refreshing"
            titleColor="black"
          />
        }
      />
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