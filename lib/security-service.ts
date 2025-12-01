import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface BiometricAuthConfig {
  reason?: string;
  fallbackLabel?: string;
  disableDeviceFallback?: boolean;
  requireConfirmation?: boolean;
}

interface SecureStorageOptions {
  requireAuthentication?: boolean;
  authenticationPrompt?: string;
  keychainService?: string;
  accessGroup?: string;
}

interface SecurityValidation {
  isValid: boolean;
  issues: string[];
  score: number; // 0-100 security score
}

class SecurityService {
  private readonly KEYCHAIN_SERVICE = 'com.towntap.app';
  private readonly ENCRYPTION_KEY_ALIAS = 'towntap_encryption_key';
  
  private isInitialized = false;
  private encryptionKey: string | null = null;
  private biometricCapabilities: LocalAuthentication.AuthenticationType[] = [];

  /**
   * Initialize security service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check device security capabilities
      await this.checkSecurityCapabilities();
      
      // Initialize encryption key
      await this.initializeEncryption();
      
      this.isInitialized = true;
      console.log('Security service initialized');
    } catch (error) {
      console.error('Failed to initialize security service:', error);
      throw error;
    }
  }

  /**
   * Check if biometric authentication is available
   */
  async isBiometricAvailable(): Promise<{
    available: boolean;
    types: LocalAuthentication.AuthenticationType[];
    reason?: string;
  }> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return {
          available: false,
          types: [],
          reason: 'No biometric hardware available',
        };
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return {
          available: false,
          types: [],
          reason: 'No biometric data enrolled',
        };
      }

      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      this.biometricCapabilities = supportedTypes;

      return {
        available: true,
        types: supportedTypes,
      };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return {
        available: false,
        types: [],
        reason: 'Error checking biometric capabilities',
      };
    }
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticateWithBiometrics(config: BiometricAuthConfig = {}): Promise<{
    success: boolean;
    error?: string;
    warning?: string;
  }> {
    const defaultConfig = {
      reason: 'Please authenticate to continue',
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
      requireConfirmation: true,
    };

    const finalConfig = { ...defaultConfig, ...config };

    try {
      const biometricCheck = await this.isBiometricAvailable();
      if (!biometricCheck.available) {
        return {
          success: false,
          error: biometricCheck.reason || 'Biometric authentication not available',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: finalConfig.reason,
        fallbackLabel: finalConfig.fallbackLabel,
        disableDeviceFallback: finalConfig.disableDeviceFallback,
        requireConfirmation: finalConfig.requireConfirmation,
      });

      if (result.success) {
        return { success: true };
      } else {
        let error = 'Authentication failed';
        if (result.error === 'user_cancel') {
          error = 'Authentication cancelled by user';
        } else if (result.error === 'user_fallback') {
          error = 'User chose to use fallback';
        } else if (result.error === 'system_cancel') {
          error = 'Authentication cancelled by system';
        } else if (result.error === 'not_available') {
          error = 'Biometric authentication not available';
        } else if (result.error === 'not_enrolled') {
          error = 'No biometric data enrolled';
        }

        return { success: false, error };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'Authentication system error',
      };
    }
  }

  /**
   * Securely store sensitive data
   */
  async storeSecurely(
    key: string,
    value: string,
    options: SecureStorageOptions = {}
  ): Promise<boolean> {
    try {
      const storeOptions: SecureStore.SecureStoreOptions = {
        keychainService: options.keychainService || this.KEYCHAIN_SERVICE,
        requireAuthentication: options.requireAuthentication || false,
      };

      if (Platform.OS === 'ios' && options.accessGroup) {
        storeOptions.accessGroup = options.accessGroup;
      }

      if (options.requireAuthentication && options.authenticationPrompt) {
        storeOptions.authenticationPrompt = options.authenticationPrompt;
      }

      // Encrypt the value before storing
      const encryptedValue = await this.encrypt(value);
      await SecureStore.setItemAsync(key, encryptedValue, storeOptions);

      return true;
    } catch (error) {
      console.error('Error storing secure data:', error);
      return false;
    }
  }

  /**
   * Retrieve securely stored data
   */
  async retrieveSecurely(
    key: string,
    options: SecureStorageOptions = {}
  ): Promise<string | null> {
    try {
      const storeOptions: SecureStore.SecureStoreOptions = {
        keychainService: options.keychainService || this.KEYCHAIN_SERVICE,
        requireAuthentication: options.requireAuthentication || false,
      };

      if (Platform.OS === 'ios' && options.accessGroup) {
        storeOptions.accessGroup = options.accessGroup;
      }

      if (options.requireAuthentication && options.authenticationPrompt) {
        storeOptions.authenticationPrompt = options.authenticationPrompt;
      }

      const encryptedValue = await SecureStore.getItemAsync(key, storeOptions);
      if (!encryptedValue) return null;

      // Decrypt the value
      return await this.decrypt(encryptedValue);
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  }

  /**
   * Delete securely stored data
   */
  async deleteSecurely(
    key: string,
    options: SecureStorageOptions = {}
  ): Promise<boolean> {
    try {
      const storeOptions: SecureStore.SecureStoreOptions = {
        keychainService: options.keychainService || this.KEYCHAIN_SERVICE,
      };

      if (Platform.OS === 'ios' && options.accessGroup) {
        storeOptions.accessGroup = options.accessGroup;
      }

      await SecureStore.deleteItemAsync(key, storeOptions);
      return true;
    } catch (error) {
      console.error('Error deleting secure data:', error);
      return false;
    }
  }

  /**
   * Generate secure hash
   */
  async generateHash(
    data: string,
    algorithm: Crypto.CryptoDigestAlgorithm = Crypto.CryptoDigestAlgorithm.SHA256
  ): Promise<string> {
    return await Crypto.digestStringAsync(algorithm, data);
  }

  /**
   * Generate secure random string
   */
  async generateSecureRandom(length: number = 32): Promise<string> {
    const array = new Uint8Array(length);
    await Crypto.getRandomBytesAsync(length).then(bytes => {
      array.set(bytes);
    });
    
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): SecurityValidation {
    const issues: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 12) {
      score += 25;
    } else if (password.length >= 8) {
      score += 15;
    } else {
      issues.push('Password should be at least 8 characters long');
    }

    // Uppercase letters
    if (/[A-Z]/.test(password)) {
      score += 15;
    } else {
      issues.push('Password should contain uppercase letters');
    }

    // Lowercase letters
    if (/[a-z]/.test(password)) {
      score += 15;
    } else {
      issues.push('Password should contain lowercase letters');
    }

    // Numbers
    if (/\d/.test(password)) {
      score += 15;
    } else {
      issues.push('Password should contain numbers');
    }

    // Special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 15;
    } else {
      issues.push('Password should contain special characters');
    }

    // No repeated characters
    if (!/(.)\1{2,}/.test(password)) {
      score += 10;
    } else {
      issues.push('Password should not contain repeated characters');
    }

    // Common patterns check
    const commonPatterns = [
      'password', '123456', 'qwerty', 'abc123', 'admin', 'welcome',
      'letmein', 'monkey', 'dragon', 'master'
    ];
    
    const lowerPassword = password.toLowerCase();
    if (!commonPatterns.some(pattern => lowerPassword.includes(pattern))) {
      score += 5;
    } else {
      issues.push('Password should not contain common patterns');
    }

    return {
      isValid: score >= 60 && issues.length === 0,
      issues,
      score: Math.min(100, score),
    };
  }

  /**
   * Validate app security state
   */
  async validateAppSecurity(): Promise<SecurityValidation> {
    const issues: string[] = [];
    let score = 100;

    try {
      // Check if device has screen lock
      const hasDeviceLock = await LocalAuthentication.isEnrolledAsync();
      if (!hasDeviceLock) {
        issues.push('Device should have screen lock enabled');
        score -= 30;
      }

      // Check if app is running in debug mode
      if (__DEV__) {
        issues.push('App is running in development mode');
        score -= 20;
      }

      // Check if biometric authentication is available
      const biometricCheck = await this.isBiometricAvailable();
      if (!biometricCheck.available) {
        issues.push('Biometric authentication not available');
        score -= 15;
      }

      // Check if secure storage is working
      const testKey = 'security_test';
      const testValue = 'test_value';
      const storeResult = await this.storeSecurely(testKey, testValue);
      if (!storeResult) {
        issues.push('Secure storage not working properly');
        score -= 25;
      } else {
        // Cleanup test data
        await this.deleteSecurely(testKey);
      }

      return {
        isValid: score >= 70 && issues.length === 0,
        issues,
        score: Math.max(0, score),
      };
    } catch (error) {
      console.error('Security validation error:', error);
      return {
        isValid: false,
        issues: ['Security validation failed'],
        score: 0,
      };
    }
  }

  /**
   * Clear all secure data (for logout/reset)
   */
  async clearAllSecureData(): Promise<boolean> {
    try {
      // Get all stored keys (this is a simplified version)
      // In a real app, you'd maintain a list of keys or use a prefix
      const commonKeys = [
        'user_token',
        'user_credentials',
        'auth_state',
        'user_preferences_secure',
        'biometric_data',
      ];

      const deletePromises = commonKeys.map(key => this.deleteSecurely(key));
      await Promise.all(deletePromises);

      console.log('All secure data cleared');
      return true;
    } catch (error) {
      console.error('Error clearing secure data:', error);
      return false;
    }
  }

  // Private methods

  private async checkSecurityCapabilities(): Promise<void> {
    const biometricCheck = await this.isBiometricAvailable();
    console.log('Biometric capabilities:', biometricCheck);
  }

  private async initializeEncryption(): Promise<void> {
    try {
      // Check if encryption key exists
      let key = await SecureStore.getItemAsync(this.ENCRYPTION_KEY_ALIAS);
      
      if (!key) {
        // Generate new encryption key
        key = await this.generateSecureRandom(64);
        await SecureStore.setItemAsync(this.ENCRYPTION_KEY_ALIAS, key);
      }
      
      this.encryptionKey = key;
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      throw error;
    }
  }

  private async encrypt(data: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    try {
      // Simple XOR encryption with base64 encoding
      // In a production app, use proper AES encryption
      const key = this.encryptionKey;
      let encrypted = '';
      
      for (let i = 0; i < data.length; i++) {
        const keyChar = key.charCodeAt(i % key.length);
        const dataChar = data.charCodeAt(i);
        encrypted += String.fromCharCode(dataChar ^ keyChar);
      }
      
      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }

  private async decrypt(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    try {
      const key = this.encryptionKey;
      const encrypted = atob(encryptedData);
      let decrypted = '';
      
      for (let i = 0; i < encrypted.length; i++) {
        const keyChar = key.charCodeAt(i % key.length);
        const encryptedChar = encrypted.charCodeAt(i);
        decrypted += String.fromCharCode(encryptedChar ^ keyChar);
      }
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const securityService = new SecurityService();

/**
 * React hook for biometric authentication
 */
export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authTypes, setAuthTypes] = useState<LocalAuthentication.AuthenticationType[]>([]);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const result = await securityService.isBiometricAvailable();
    setIsAvailable(result.available);
    setAuthTypes(result.types);
  };

  const authenticate = useCallback(
    async (config?: BiometricAuthConfig) => {
      setIsLoading(true);
      try {
        const result = await securityService.authenticateWithBiometrics(config);
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isAvailable,
    authTypes,
    isLoading,
    authenticate,
    refresh: checkAvailability,
  };
}

/**
 * React hook for secure storage
 */
export function useSecureStorage() {
  const store = useCallback(
    async (key: string, value: string, options?: SecureStorageOptions) => {
      return await securityService.storeSecurely(key, value, options);
    },
    []
  );

  const retrieve = useCallback(
    async (key: string, options?: SecureStorageOptions) => {
      return await securityService.retrieveSecurely(key, options);
    },
    []
  );

  const remove = useCallback(
    async (key: string, options?: SecureStorageOptions) => {
      return await securityService.deleteSecurely(key, options);
    },
    []
  );

  return { store, retrieve, remove };
}

export default securityService;