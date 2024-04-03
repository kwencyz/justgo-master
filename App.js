// In App.js in a new project

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//import * as React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { default as React, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Geocoder from 'react-native-geocoding';
import AdminMenu from './screens/AdminMenu';
import ConfirmationScreen from './screens/ConfirmationScreen';
import DriverAnalytics from './screens/DriverAnalytics';
import DriverHistoryScreen from './screens/DriverHistoryScreen';
import DriverMenu from './screens/DriverMenu';
import DriverWallet from './screens/DriverWallet';
import ForgetPassword from './screens/ForgetPassword';
import LoginScreen from './screens/LoginScreen';
import PassengerAnalytics from './screens/PassengerAnalytics';
import PassengerHistoryScreen from './screens/PassengerHistoryScreen';
import PassengerMenu from './screens/PassengerMenu';
import PassengerStatusScreen from './screens/PassengerStatusScreen';
import PassengerWallet from './screens/PassengerWallet';
import ScreenTemplate from './screens/ScreenTemplate';
import SignupScreen from './screens/SignupScreen';
import TopUpWallet from './screens/TopupWallet';
import WithdrawWallet from './screens/WithdrawWallet';

Geocoder.init('AIzaSyCeZnCGy1kggLJnYpVBjrms39JD9SBjlQ0');

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PassengerTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{
      tabBarShowLabel: false, tabBarActiveTintColor: 'white', tabBarInactiveTintColor: 'white',
      tabBarStyle: {
        position: 'absolute',
        bottom: 25,
        left: 10,
        right: 10,
        elevation: 0,
        backgroundColor: 'maroon',
        borderRadius: 15,
        height: 60,
        ...styles.shadow
      }
    }}>
      <Tab.Screen name="Home" component={PassengerMenu} options={{
        tabBarIcon: ({ focused }) => (
          <View style={{ alignItems: 'center', justifyContent: 'center', }}>
            <Image
              source={require('./assets/icon/home.png')}
              resizeMode='contain'
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? 'white' : '#808080'
              }}
            />
            <Text style={{ color: focused ? 'white' : '#808080', fontSize: 12, top: 5, }}>HOME</Text>
          </View>
        ),
        headerShown: false,
      }}
      />

      <Tab.Screen name="Wallet" component={PassengerWallet} options={{
        tabBarIcon: ({ focused }) => (
          <View style={{ alignItems: 'center', justifyContent: 'center', }}>
            <Image
              source={require('./assets/icon/wallet.png')}
              resizeMode='contain'
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? 'white' : '#808080'
              }}
            />
            <Text style={{ color: focused ? 'white' : '#808080', top: 5, fontSize: 12 }}>WALLET</Text>
          </View>
        ),
        headerShown: false,
      }} />

      <Tab.Screen name="History" component={PassengerHistoryScreen} options={{
        tabBarIcon: ({ focused }) => (
          <View style={{ alignItems: 'center', justifyContent: 'center', }}>
            <Image
              source={require('./assets/icon/history.png')}
              resizeMode='contain'
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? 'white' : '#808080'
              }}
            />
            <Text style={{ color: focused ? 'white' : '#808080', top: 5, fontSize: 12 }}>HISTORY</Text>
          </View>
        ),
        headerShown: false,
      }} />
    </Tab.Navigator>
  );
}

function DriverTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{
      tabBarShowLabel: false, tabBarActiveTintColor: 'white', tabBarInactiveTintColor: 'white',
      tabBarStyle: {
        position: 'absolute',
        bottom: 25,
        left: 10,
        right: 10,
        elevation: 0,
        backgroundColor: 'maroon',
        borderRadius: 15,
        height: 60,
        ...styles.shadow
      }
    }}>
      <Tab.Screen name="Home" component={DriverMenu} options={{
        tabBarIcon: ({ focused }) => (
          <View style={{ alignItems: 'center', justifyContent: 'center', }}>
            <Image
              source={require('./assets/icon/home.png')}
              resizeMode='contain'
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? 'white' : '#808080'
              }}
            />
            <Text style={{ color: focused ? 'white' : '#808080', fontSize: 12, top: 5, }}>HOME</Text>
          </View>
        ),
        headerShown: false,
      }}
      />

      <Tab.Screen name="Wallet" component={DriverWallet} options={{
        tabBarIcon: ({ focused }) => (
          <View style={{ alignItems: 'center', justifyContent: 'center', }}>
            <Image
              source={require('./assets/icon/wallet.png')}
              resizeMode='contain'
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? 'white' : '#808080'
              }}
            />
            <Text style={{ color: focused ? 'white' : '#808080', top: 5, fontSize: 12 }}>WALLET</Text>
          </View>
        ),
        headerShown: false,
      }} />

      <Tab.Screen name="History" component={DriverHistoryScreen} options={{
        tabBarIcon: ({ focused }) => (
          <View style={{ alignItems: 'center', justifyContent: 'center', }}>
            <Image
              source={require('./assets/icon/history.png')}
              resizeMode='contain'
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? 'white' : '#808080'
              }}
            />
            <Text style={{ color: focused ? 'white' : '#808080', top: 5, fontSize: 12 }}>HISTORY</Text>
          </View>
        ),
        headerShown: false,
      }} />
    </Tab.Navigator>
  );
}

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <StripeProvider publishableKey="pk_test_51OW1VFKMX5xqDUk5VgWWt745KxrNKhtgROxk1Tjvt67BVM1ltbYVreaUobesgLVA0RN2BpqeKzhYQat8nI5ZSwEt00vwWgqSlC">
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          {isLoggedIn ? (
            <Stack.Screen name="PassengerDashboard" component={PassengerTabNavigator} options={{ headerShown: false }} />
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ForgetPass" component={ForgetPassword} options={{ headerShown: false }} />
              <Stack.Screen name="ScreenTemplate" component={ScreenTemplate} options={{ headerShown: false }} />
              <Stack.Screen name="DriverMenu" component={DriverMenu} options={{ headerShown: false }} />
              <Stack.Screen name="AdminMenu" component={AdminMenu} options={{ headerShown: false }} />
              <Stack.Screen name="PassengerDashboard" component={PassengerTabNavigator} options={{ headerShown: false }} />
              <Stack.Screen name="DriverDashboard" component={DriverTabNavigator} options={{ headerShown: false }} />
              <Stack.Screen name="PassengerWallet" component={PassengerWallet} options={{ headerShown: false }} />
              <Stack.Screen name="DriverWallet" component={DriverWallet} options={{ headerShown: false }} />
              <Stack.Screen name="TopUpWallet" component={TopUpWallet} options={{ headerShown: false }} />
              <Stack.Screen name="WithdrawWallet" component={WithdrawWallet} options={{ headerShown: false }} />
              <Stack.Screen name="PassengerHistoryScreen" component={PassengerHistoryScreen} options={{ headerShown: false }} />
              <Stack.Screen name="PassengerStatusScreen" component={PassengerStatusScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ConfirmationScreen" component={ConfirmationScreen} options={{ headerShown: false }} />
              <Stack.Screen name="DriverAnalytics" component={DriverAnalytics} options={{ headerShown: false }} />
              <Stack.Screen name="PassengerAnalytics" component={PassengerAnalytics} options={{ headerShown: false }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#7F5DF0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  }
})