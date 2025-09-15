import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../providers/AuthProvider';
import CustomButton from '../../components/CustomButton';

export default function AdminProfile() {
  const { user, userProfile, userRole, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
          <Text style={styles.adminBadgeText}>ADMIN PANEL</Text>
        </View>
        <Text style={styles.title}>Admin Profile</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.section}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={48} color="#6B7280" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.nameText}>
              {userProfile?.full_name || 'Admin User'}
            </Text>
            <Text style={styles.emailText}>{user?.email}</Text>
            <Text style={styles.roleText}>Role: {userRole}</Text>
          </View>
        </View>
      </View>

      {/* Admin Tools */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Tools</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(admin)/admin-banks')}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="business" size={24} color="#3B82F6" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Manage Admin Banks</Text>
            <Text style={styles.menuSubtitle}>Add, edit, remove bank accounts</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(admin)/exchange-rates')}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="trending-up" size={24} color="#10B981" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Exchange Rates</Text>
            <Text style={styles.menuSubtitle}>Manage currency exchange rates</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(admin)/deposits')}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="arrow-down-circle" size={24} color="#8B5CF6" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Deposit Requests</Text>
            <Text style={styles.menuSubtitle}>Approve or reject deposits</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(admin)/withdrawals')}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="arrow-up-circle" size={24} color="#F59E0B" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Withdrawal Requests</Text>
            <Text style={styles.menuSubtitle}>Process withdrawal requests</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(admin)/exchanges')}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="refresh-circle" size={24} color="#EF4444" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Exchange Requests</Text>
            <Text style={styles.menuSubtitle}>Manage currency exchanges</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* System Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID:</Text>
            <Text style={styles.infoValue}>{user?.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>
              {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[styles.infoValue, { color: '#10B981' }]}>Active</Text>
          </View>
        </View>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <CustomButton
          title="Sign Out"
          onPress={handleSignOut}
          style={styles.signOutButton}
          textStyle={styles.signOutText}
          leftIcon={<Ionicons name="log-out-outline" size={20} color="#EF4444" />}
          variant="outline"
        />
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
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  adminBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  signOutButton: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  signOutText: {
    color: '#EF4444',
    fontWeight: '600',
  },
});