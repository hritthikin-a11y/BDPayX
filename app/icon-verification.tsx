import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function IconVerificationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Icon Verification</Text>
      <Text style={styles.subtitle}>If you can see the icons below, they're working correctly</Text>
      
      <View style={styles.iconRow}>
        <Ionicons name="home" size={32} color="#4A90E2" />
        <Text style={styles.label}>Home</Text>
      </View>
      
      <View style={styles.iconRow}>
        <Ionicons name="wallet" size={32} color="#4A90E2" />
        <Text style={styles.label}>Wallet</Text>
      </View>
      
      <View style={styles.iconRow}>
        <Ionicons name="list" size={32} color="#4A90E2" />
        <Text style={styles.label}>List</Text>
      </View>
      
      <View style={styles.iconRow}>
        <Ionicons name="person" size={32} color="#4A90E2" />
        <Text style={styles.label}>Person</Text>
      </View>
      
      <View style={styles.successMessage}>
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        <Text style={styles.successText}>Icons are working correctly!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E3A59',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7B8794',
    textAlign: 'center',
    marginBottom: 32,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 18,
    color: '#2E3A59',
    marginLeft: 16,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginLeft: 8,
  },
});