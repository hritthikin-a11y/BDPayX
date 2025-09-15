import React from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#EF4444',
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
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'analytics' : 'analytics-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'list-circle' : 'list-circle-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="management"
        options={{
          title: 'Management',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
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

      {/* Hidden screens - accessed via navigation */}
      <Tabs.Screen
        name="deposits"
        options={{
          href: null,
          title: 'Deposit Management',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="withdrawals"
        options={{
          href: null,
          title: 'Withdrawal Management',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="exchanges"
        options={{
          href: null,
          title: 'Exchange Management',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="admin-banks"
        options={{
          href: null,
          title: 'Admin Bank Accounts',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="exchange-rates"
        options={{
          href: null,
          title: 'Exchange Rates',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="add-admin-bank"
        options={{
          href: null,
          title: 'Add Admin Bank',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="edit-admin-bank"
        options={{
          href: null,
          title: 'Edit Admin Bank',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="add-exchange-rate"
        options={{
          href: null,
          title: 'Add Exchange Rate',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="edit-exchange-rate"
        options={{
          href: null,
          title: 'Edit Exchange Rate',
          headerShown: true,
        }}
      />
    </Tabs>
  );
}