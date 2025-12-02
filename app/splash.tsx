import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Import services for initialization
import { imageCacheService } from '@/lib/image-cache-service';
import { performanceMonitor } from '@/lib/performance-monitor';
import { securityService } from '@/lib/security-service';

export default function SplashScreen() {
  const [initializationStatus, setInitializationStatus] = React.useState('Initializing...');

  React.useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      setInitializationStatus('Initializing security...');
      await securityService.initialize();
      
      setInitializationStatus('Starting performance monitoring...');
      await performanceMonitor.initialize();
      
      setInitializationStatus('Preparing image cache...');
      await imageCacheService.initialize();
      
      setInitializationStatus('Ready!');
      
      // Auto-navigate to welcome after initialization
      setTimeout(() => {
        router.replace('/welcome');
      }, 1500);
    } catch (error) {
      console.error('Service initialization error:', error);
      setInitializationStatus('Ready!');
      
      // Still navigate even if some services fail
      setTimeout(() => {
        router.replace('/welcome');
      }, 2000);
    }
  };

  return (
    <LinearGradient
      colors={['#6366F1', '#EC4899', '#10B981']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      <View style={styles.content}>
        {/* Animated App Logo */}
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 800 }}
          style={styles.logoContainer}
        >
          <View style={styles.logoCircle}>
            <Ionicons name="business-outline" size={64} color="#FFFFFF" />
          </View>
          <MotiView
            from={{ translateY: 20, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: 'timing', duration: 600, delay: 400 }}
          >
            <Text style={styles.appName}>TownTap</Text>
            <Text style={styles.tagline}>Your Complete Service Ecosystem</Text>
          </MotiView>
        </MotiView>

        {/* Enhanced Loading Animation */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 800, duration: 400 }}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingDots}>
            <MotiView
              from={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1, 0.5] }}
              transition={{ 
                type: 'timing',
                duration: 1200,
                loop: true,
                repeatReverse: false,
                delay: 0
              }}
              style={[styles.dot, styles.dot1]}
            />
            <MotiView
              from={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1, 0.5] }}
              transition={{ 
                type: 'timing',
                duration: 1200,
                loop: true,
                repeatReverse: false,
                delay: 200
              }}
              style={[styles.dot, styles.dot2]}
            />
            <MotiView
              from={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1, 0.5] }}
              transition={{ 
                type: 'timing',
                duration: 1200,
                loop: true,
                repeatReverse: false,
                delay: 400
              }}
              style={[styles.dot, styles.dot3]}
            />
          </View>
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={initializationStatus} // Re-animate when status changes
            transition={{ duration: 300 }}
          >
            <Text style={styles.loadingText}>{initializationStatus}</Text>
          </MotiView>
        </MotiView>
      </View>

      {/* Version */}
      <Text style={styles.version}>Version 1.0.0</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 4,
  },
  dot1: {
    // Animation would be added via Animated API
  },
  dot2: {
    // Animation would be added via Animated API
  },
  dot3: {
    // Animation would be added via Animated API
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  version: {
    position: 'absolute',
    bottom: 30,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
});