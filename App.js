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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BankingProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </BankingProvider>
    </AuthProvider>
  );
}
