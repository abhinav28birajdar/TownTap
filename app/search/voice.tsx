import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const voiceCommands = [
  '"Find a plumber near me"',
  '"AC repair service"',
  '"House cleaning today"',
  '"Best electrician"',
];

export default function VoiceSearchScreen() {
  const colors = useColors();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Animation values
  const pulseAnim = new Animated.Value(1);
  const waveAnim1 = new Animated.Value(0);
  const waveAnim2 = new Animated.Value(0);
  const waveAnim3 = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isListening) {
      startPulseAnimation();
      startWaveAnimation();
    }
  }, [isListening]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startWaveAnimation = () => {
    const createWave = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createWave(waveAnim1, 0),
      createWave(waveAnim2, 150),
      createWave(waveAnim3, 300),
    ]).start();
  };

  const handleStartListening = async () => {
    setIsListening(true);
    setTranscript('');
    setError(null);

    // Request audio permissions
    try {
      // Note: For actual voice recognition, you would integrate with
      // expo-speech-recognition or @react-native-voice/voice
      // This is a simulation for demo purposes
      
      // Simulate voice recognition
      setTimeout(() => {
        const mockTranscript = 'Find plumber near me';
        setTranscript(mockTranscript);
        
        setTimeout(() => {
          setIsListening(false);
          router.push(`/search/results?q=${encodeURIComponent(mockTranscript)}` as any);
        }, 1000);
      }, 2000);

    } catch (err) {
      console.error('Voice search error:', err);
      setError('Voice search is not available. Please type your search.');
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
    pulseAnim.stopAnimation();
    waveAnim1.stopAnimation();
    waveAnim2.stopAnimation();
    waveAnim3.stopAnimation();
  };

  const handleSuggestionPress = (suggestion: string) => {
    const cleanQuery = suggestion.replace(/"/g, '');
    router.push(`/search/results?q=${encodeURIComponent(cleanQuery)}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Voice Search</ThemedText>
        <View style={{ width: 28 }} />
      </Animated.View>

      <View style={styles.content}>
        {/* Microphone Button with Waves */}
        <View style={styles.micContainer}>
          {isListening && (
            <>
              <Animated.View
                style={[
                  styles.wave,
                  {
                    borderColor: colors.primary,
                    transform: [{ scale: pulseAnim }],
                    opacity: waveAnim1,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.wave,
                  styles.wave2,
                  {
                    borderColor: colors.primary,
                    transform: [{ scale: Animated.add(pulseAnim, 0.2) }],
                    opacity: waveAnim2,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.wave,
                  styles.wave3,
                  {
                    borderColor: colors.primary,
                    transform: [{ scale: Animated.add(pulseAnim, 0.4) }],
                    opacity: waveAnim3,
                  },
                ]}
              />
            </>
          )}
          
          <TouchableOpacity
            style={[
              styles.micButton,
              { backgroundColor: isListening ? colors.error : colors.primary },
            ]}
            onPress={isListening ? handleStopListening : handleStartListening}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons
                name={isListening ? 'stop' : 'mic'}
                size={48}
                color="#FFF"
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Status Text */}
        <View style={styles.statusContainer}>
          {isListening ? (
            <View style={styles.listeningContainer}>
              <View style={styles.waveformContainer}>
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.waveformBar,
                      {
                        backgroundColor: colors.primary,
                        height: index % 2 === 0 ? 24 : 16,
                        transform: [
                          {
                            scaleY: isListening
                              ? Animated.add(
                                  waveAnim1,
                                  new Animated.Value(0.5 + Math.random() * 0.5)
                                )
                              : 1,
                          },
                        ],
                      },
                    ]}
                  />
                ))}
              </View>
              <ThemedText style={[styles.statusText, { color: colors.primary }]}>
                Listening...
              </ThemedText>
            </View>
          ) : (
            <ThemedText style={[styles.statusText, { color: colors.textSecondary }]}>
              Tap the microphone to start
            </ThemedText>
          )}

          {/* Transcript */}
          {transcript && (
            <View style={[styles.transcriptContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
              <ThemedText style={styles.transcriptText}>"{transcript}"</ThemedText>
            </View>
          )}

          {/* Error */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="warning-outline" size={20} color={colors.error} />
              <ThemedText style={[styles.errorText, { color: colors.error }]}>
                {error}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Voice Command Suggestions */}
        {!isListening && (
          <Animated.View style={[styles.suggestionsContainer, { opacity: fadeAnim }]}>
            <ThemedText style={[styles.suggestionsTitle, { color: colors.textSecondary }]}>
              Try saying
            </ThemedText>
            {voiceCommands.map((command, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.suggestionChip, { backgroundColor: colors.card }]}
                onPress={() => handleSuggestionPress(command)}
              >
                <Ionicons name="mic-outline" size={18} color={colors.primary} />
                <ThemedText style={[styles.suggestionText, { color: colors.text }]}>
                  {command}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </View>

      {/* Bottom Text Input Alternative */}
      <TouchableOpacity
        style={[styles.textSearchButton, { backgroundColor: colors.card }]}
        onPress={() => router.push('/search/index' as any)}
      >
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <ThemedText style={[styles.textSearchText, { color: colors.textSecondary }]}>
          Or type to search
        </ThemedText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  micContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
  },
  wave2: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  wave3: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 32,
    minHeight: 100,
  },
  listeningContainer: {
    alignItems: 'center',
    gap: 16,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    gap: 4,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  transcriptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
    maxWidth: '100%',
  },
  transcriptText: {
    fontSize: 16,
    fontStyle: 'italic',
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  suggestionsContainer: {
    marginTop: 48,
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  suggestionsTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  suggestionText: {
    fontSize: 15,
  },
  textSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  textSearchText: {
    fontSize: 15,
  },
});
