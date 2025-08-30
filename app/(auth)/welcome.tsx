import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import CustomButton from '../../components/CustomButton';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#4A90E2', '#357ABD', '#2E5A99']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>💰</Text>
            </View>
            <Text style={styles.appName}>BDPayX</Text>
            <Text style={styles.tagline}>Fast & Secure Money Exchange</Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Exchange Money Instantly</Text>
            <View style={styles.featuresList}>
              <FeatureItem 
                icon="🔄" 
                text="BDT ↔ INR Exchange" 
              />
              <FeatureItem 
                icon="⚡" 
                text="Instant Transfers" 
              />
              <FeatureItem 
                icon="🔒" 
                text="Bank-Level Security" 
              />
              <FeatureItem 
                icon="📱" 
                text="bKash, Nagad & Bank Support" 
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <Link href="/(auth)/register" asChild>
              <CustomButton
                title="Get Started"
                onPress={() => {}}
                style={styles.primaryButton}
                textStyle={styles.primaryButtonText}
              />
            </Link>
            
            <Link href="/(auth)/login" asChild>
              <CustomButton
                title="I Already Have an Account"
                onPress={() => {}}
                variant="outline"
                style={styles.secondaryButton}
                textStyle={styles.secondaryButtonText}
              />
            </Link>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 60,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresList: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  actionsSection: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: '#4A90E2',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});