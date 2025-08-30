import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../utils/supabase';

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState('');

  const testConnection = async () => {
    setConnectionStatus('testing');
    setErrorMessage('');

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('wallets')
        .select('count')
        .limit(1);

      if (error) {
        setConnectionStatus('error');
        setErrorMessage(error.message);
      } else {
        setConnectionStatus('connected');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#28a745';
      case 'error': return '#dc3545';
      default: return '#ffc107';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected ✓';
      case 'error': return 'Connection Error ✗';
      default: return 'Testing Connection...';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusContainer, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      
      {connectionStatus === 'error' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={testConnection}>
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {connectionStatus === 'connected' && (
        <Text style={styles.successText}>
          Supabase is properly connected and database schema is ready!
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  statusContainer: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 15,
    borderRadius: 10,
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  successText: {
    color: '#155724',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: '#d4edda',
    padding: 10,
    borderRadius: 5,
  },
});

export default ConnectionTest;