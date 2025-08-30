import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';
import { BankingProvider } from './src/context/BankingContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuth } from './src/context/AuthContext';

const Stack = createStackNavigator();

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    &lt;Stack.Navigator screenOptions={{ headerShown: false }}&gt;
      {user ? (
        &lt;Stack.Screen name="App" component={AppNavigator} /&gt;
      ) : (
        &lt;Stack.Screen name="Auth" component={AuthNavigator} /&gt;
      )}
    &lt;/Stack.Navigator&gt;
  );
};

export default function App() {
  return (
    &lt;AuthProvider&gt;
      &lt;BankingProvider&gt;
        &lt;NavigationContainer&gt;
          &lt;AppContent /&gt;
        &lt;/NavigationContainer&gt;
      &lt;/BankingProvider&gt;
    &lt;/AuthProvider&gt;
  );
}
