import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useBanking } from '../context/BankingContext';
import ConnectionTest from '../components/ConnectionTest';

const HomeScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const { balance } = useBanking();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ConnectionTest />
      
      <Text style={styles.title}>Welcome, {user?.email}</Text>
      
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceTitle}>Your Balance</Text>
        <Text style={styles.balance}>BDT: {balance.bdt.toFixed(2)}</Text>
        <Text style={styles.balance}>INR: {balance.inr.toFixed(2)}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Deposit')}
      >
        <Text style={styles.buttonText}>Deposit</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Withdraw')}
      >
        <Text style={styles.buttonText}>Withdraw</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Exchange')}
      >
        <Text style={styles.buttonText}>Exchange</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.buttonText}>Profile</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]} 
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  balanceContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  balance: {
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;