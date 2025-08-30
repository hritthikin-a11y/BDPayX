import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import DepositScreen from '../screens/DepositScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import ExchangeScreen from '../screens/ExchangeScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4A90E2',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ title: 'BDPayX', headerShown: false }}
      />
      <Stack.Screen 
        name="DepositFlow" 
        component={DepositScreen}
        options={{ title: 'Deposit Money' }}
      />
      <Stack.Screen 
        name="WithdrawFlow" 
        component={WithdrawScreen}
        options={{ title: 'Withdraw Funds' }}
      />
      <Stack.Screen 
        name="ExchangeFlow" 
        component={ExchangeScreen}
        options={{ title: 'Currency Exchange' }}
      />
      <Stack.Screen 
        name="ProfileFlow" 
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'DepositTab') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'WithdrawTab') {
            iconName = focused ? 'remove-circle' : 'remove-circle-outline';
          } else if (route.name === 'ExchangeTab') {
            iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#7B8794',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8EBF0',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="DepositTab" 
        component={DepositScreen}
        options={{ title: 'Deposit' }}
      />
      <Tab.Screen 
        name="WithdrawTab" 
        component={WithdrawScreen}
        options={{ title: 'Withdraw' }}
      />
      <Tab.Screen 
        name="ExchangeTab" 
        component={ExchangeScreen}
        options={{ title: 'Exchange' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;