import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#7B8794',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E9ECEF',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'wallet' : 'wallet-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'list' : 'list-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Hide these screens from tab bar - these are accessed via navigation */}
      <Tabs.Screen
        name="add-bank-account"
        options={{
          href: null,
          title: 'Add Bank Account',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="bank-accounts"
        options={{
          href: null,
          title: 'Bank Accounts',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="deposit"
        options={{
          href: null,
          title: 'Deposit',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="withdraw"
        options={{
          href: null,
          title: 'Withdraw',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="exchange"
        options={{
          href: null,
          title: 'Currency Exchange',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="transfer"
        options={{
          href: null,
          title: 'Transfer',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="transaction-details"
        options={{
          href: null,
          title: 'Transaction Details',
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
