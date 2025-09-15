import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminManagement() {
  const router = useRouter();

  const managementOptions = [
    {
      title: 'Admin Bank Accounts',
      subtitle: 'Manage admin bank accounts for deposits',
      icon: 'business',
      color: '#3B82F6',
      route: '/(admin)/admin-banks',
    },
    {
      title: 'Exchange Rates',
      subtitle: 'Set and update currency exchange rates',
      icon: 'trending-up',
      color: '#10B981',
      route: '/(admin)/exchange-rates',
    },
    {
      title: 'User Management',
      subtitle: 'Manage user accounts and permissions',
      icon: 'people',
      color: '#8B5CF6',
      route: '/(admin)/users',
    },
    {
      title: 'Transaction Limits',
      subtitle: 'Configure daily and monthly limits',
      icon: 'shield-checkmark',
      color: '#F59E0B',
      route: '/(admin)/limits',
    },
    {
      title: 'System Settings',
      subtitle: 'Configure application settings',
      icon: 'settings',
      color: '#6B7280',
      route: '/(admin)/settings',
    },
    {
      title: 'Reports & Analytics',
      subtitle: 'View transaction reports and analytics',
      icon: 'analytics',
      color: '#EF4444',
      route: '/(admin)/reports',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>System Management</Text>
        <Text style={styles.subtitle}>Configure and manage system settings</Text>
      </View>

      {/* Management Options */}
      <View style={styles.optionsContainer}>
        {managementOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionCard}
            onPress={() => router.push(option.route as any)}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                <Ionicons name={option.icon as any} size={28} color="#FFFFFF" />
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="business" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Admin Banks</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#10B981" />
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Exchange Rates</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="shield-checkmark" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>System Status</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionsContainer: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
});