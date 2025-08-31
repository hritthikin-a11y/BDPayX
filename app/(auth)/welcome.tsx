import React from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import CustomButton from '../../components/CustomButton';

const { height } = Dimensions.get('window');

// TODO: Replace this with a real image from your assets
const backgroundImage = { uri: 'https://images.unsplash.com/photo-1604594849809-dfedbc827105?q=80&w=2940&auto=format&fit=crop' };

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>BDP</Text>
              </View>
              <Text style={styles.appName}>BDPayX</Text>
              <Text style={styles.tagline}>Seamlessly Exchange BDT & INR</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsSection}>
              <Link href="/(auth)/register" asChild>
                <CustomButton
                  title="Join Now"
                  onPress={() => {}}
                  style={styles.primaryButton}
                  textStyle={styles.primaryButtonText}
                />
              </Link>
              
              <Link href="/(auth)/login" asChild>
                <CustomButton
                  title="Sign In"
                  onPress={() => {}}
                  variant="outline"
                  style={styles.secondaryButton}
                  textStyle={styles.secondaryButtonText}
                />
              </Link>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: height * 0.15,
    paddingBottom: height * 0.1,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 48,
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
  actionsSection: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    borderColor: '#4A90E2',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 18,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
