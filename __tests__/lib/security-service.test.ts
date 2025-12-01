import { securityService } from '@/lib/security-service';
import { jest } from '@jest/globals';

// Mock Expo modules
const mockLocalAuthentication = {
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
};

const mockSecureStore = {
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
};

const mockCrypto = {
  digestStringAsync: jest.fn(),
  getRandomBytesAsync: jest.fn(),
  CryptoDigestAlgorithm: {
    SHA256: 'sha256',
    SHA512: 'sha512',
  },
};

jest.mock('expo-local-authentication', () => mockLocalAuthentication);
jest.mock('expo-secure-store', () => mockSecureStore);
jest.mock('expo-crypto', () => mockCrypto);

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
}));

describe('Security Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockLocalAuthentication.hasHardwareAsync.mockResolvedValue(true);
    mockLocalAuthentication.isEnrolledAsync.mockResolvedValue(true);
    mockLocalAuthentication.supportedAuthenticationTypesAsync.mockResolvedValue([
      mockLocalAuthentication.AuthenticationType.FINGERPRINT,
    ]);
    mockSecureStore.getItemAsync.mockResolvedValue(null);
    mockSecureStore.setItemAsync.mockResolvedValue(undefined);
    mockCrypto.getRandomBytesAsync.mockResolvedValue(new Uint8Array(32));
    mockCrypto.digestStringAsync.mockResolvedValue('hashed_value');
  });

  describe('Initialization', () => {
    it('initializes successfully', async () => {
      await securityService.initialize();
      
      // Should check security capabilities and set up encryption
      expect(mockLocalAuthentication.hasHardwareAsync).toHaveBeenCalled();
      expect(mockLocalAuthentication.isEnrolledAsync).toHaveBeenCalled();
    });

    it('generates encryption key if not exists', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);
      
      await securityService.initialize();
      
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'towntap_encryption_key',
        expect.any(String)
      );
    });

    it('uses existing encryption key', async () => {
      const existingKey = 'existing_key_12345';
      mockSecureStore.getItemAsync.mockResolvedValue(existingKey);
      
      await securityService.initialize();
      
      // Should not generate new key
      expect(mockSecureStore.setItemAsync).not.toHaveBeenCalledWith(
        'towntap_encryption_key',
        expect.any(String)
      );
    });
  });

  describe('Biometric Authentication', () => {
    it('checks biometric availability correctly', async () => {
      const result = await securityService.isBiometricAvailable();
      
      expect(result).toEqual({
        available: true,
        types: [mockLocalAuthentication.AuthenticationType.FINGERPRINT],
      });
    });

    it('detects no hardware available', async () => {
      mockLocalAuthentication.hasHardwareAsync.mockResolvedValue(false);
      
      const result = await securityService.isBiometricAvailable();
      
      expect(result).toEqual({
        available: false,
        types: [],
        reason: 'No biometric hardware available',
      });
    });

    it('detects no biometric data enrolled', async () => {
      mockLocalAuthentication.isEnrolledAsync.mockResolvedValue(false);
      
      const result = await securityService.isBiometricAvailable();
      
      expect(result).toEqual({
        available: false,
        types: [],
        reason: 'No biometric data enrolled',
      });
    });

    it('authenticates successfully', async () => {
      mockLocalAuthentication.authenticateAsync.mockResolvedValue({
        success: true,
      });
      
      const result = await securityService.authenticateWithBiometrics();
      
      expect(result.success).toBe(true);
      expect(mockLocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Please authenticate to continue',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
        requireConfirmation: true,
      });
    });

    it('handles authentication failure', async () => {
      mockLocalAuthentication.authenticateAsync.mockResolvedValue({
        success: false,
        error: 'user_cancel',
      });
      
      const result = await securityService.authenticateWithBiometrics();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication cancelled by user');
    });

    it('uses custom authentication config', async () => {
      const customConfig = {
        reason: 'Custom auth message',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: true,
        requireConfirmation: false,
      };
      
      mockLocalAuthentication.authenticateAsync.mockResolvedValue({
        success: true,
      });
      
      await securityService.authenticateWithBiometrics(customConfig);
      
      expect(mockLocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Custom auth message',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: true,
        requireConfirmation: false,
      });
    });
  });

  describe('Secure Storage', () => {
    beforeEach(async () => {
      // Initialize the service first
      await securityService.initialize();
    });

    it('stores data securely', async () => {
      const result = await securityService.storeSecurely('test_key', 'test_value');
      
      expect(result).toBe(true);
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'test_key',
        expect.any(String), // Should be encrypted
        expect.objectContaining({
          keychainService: 'com.towntap.app',
          requireAuthentication: false,
        })
      );
    });

    it('retrieves data securely', async () => {
      const encryptedValue = 'encrypted_test_value';
      mockSecureStore.getItemAsync.mockResolvedValue(encryptedValue);
      
      const result = await securityService.retrieveSecurely('test_key');
      
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith(
        'test_key',
        expect.objectContaining({
          keychainService: 'com.towntap.app',
          requireAuthentication: false,
        })
      );
      expect(result).toBeDefined(); // Should decrypt the value
    });

    it('deletes data securely', async () => {
      const result = await securityService.deleteSecurely('test_key');
      
      expect(result).toBe(true);
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'test_key',
        expect.objectContaining({
          keychainService: 'com.towntap.app',
        })
      );
    });

    it('uses authentication when required', async () => {
      const options = {
        requireAuthentication: true,
        authenticationPrompt: 'Please authenticate to access secure data',
      };
      
      await securityService.storeSecurely('secure_key', 'secure_value', options);
      
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'secure_key',
        expect.any(String),
        expect.objectContaining({
          requireAuthentication: true,
          authenticationPrompt: 'Please authenticate to access secure data',
        })
      );
    });

    it('handles storage errors gracefully', async () => {
      mockSecureStore.setItemAsync.mockRejectedValue(new Error('Storage error'));
      
      const result = await securityService.storeSecurely('test_key', 'test_value');
      
      expect(result).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('validates strong password', () => {
      const strongPassword = 'MySecure123!Password';
      const validation = securityService.validatePasswordStrength(strongPassword);
      
      expect(validation.isValid).toBe(true);
      expect(validation.score).toBeGreaterThan(60);
      expect(validation.issues).toEqual([]);
    });

    it('detects weak password', () => {
      const weakPassword = '123';
      const validation = securityService.validatePasswordStrength(weakPassword);
      
      expect(validation.isValid).toBe(false);
      expect(validation.score).toBeLessThan(60);
      expect(validation.issues.length).toBeGreaterThan(0);
    });

    it('detects common patterns', () => {
      const commonPassword = 'password123';
      const validation = securityService.validatePasswordStrength(commonPassword);
      
      expect(validation.issues).toContain('Password should not contain common patterns');
    });

    it('detects repeated characters', () => {
      const repeatedPassword = 'Aaaa1111!';
      const validation = securityService.validatePasswordStrength(repeatedPassword);
      
      expect(validation.issues).toContain('Password should not contain repeated characters');
    });

    it('validates password length', () => {
      const shortPassword = 'Ab1!';
      const validation = securityService.validatePasswordStrength(shortPassword);
      
      expect(validation.issues).toContain('Password should be at least 8 characters long');
    });

    it('validates character types', () => {
      const validation = securityService.validatePasswordStrength('alllowercase');
      
      expect(validation.issues).toContain('Password should contain uppercase letters');
      expect(validation.issues).toContain('Password should contain numbers');
      expect(validation.issues).toContain('Password should contain special characters');
    });
  });

  describe('Cryptographic Functions', () => {
    it('generates secure hash', async () => {
      const data = 'test_data';
      const hash = await securityService.generateHash(data);
      
      expect(hash).toBe('hashed_value');
      expect(mockCrypto.digestStringAsync).toHaveBeenCalledWith('sha256', data);
    });

    it('generates secure random string', async () => {
      const randomBytes = new Uint8Array([1, 2, 3, 4]);
      mockCrypto.getRandomBytesAsync.mockResolvedValue(randomBytes);
      
      const randomString = await securityService.generateSecureRandom(4);
      
      expect(randomString).toBe('01020304');
      expect(mockCrypto.getRandomBytesAsync).toHaveBeenCalledWith(4);
    });
  });

  describe('App Security Validation', () => {
    it('validates app security in production', async () => {
      // Mock production environment
      const originalDev = (global as any).__DEV__;
      (global as any).__DEV__ = false;
      
      try {
        const validation = await securityService.validateAppSecurity();
        
        expect(validation.score).toBeGreaterThan(70);
        expect(validation.issues).not.toContain('App is running in development mode');
      } finally {
        (global as any).__DEV__ = originalDev;
      }
    });

    it('detects development mode', async () => {
      const validation = await securityService.validateAppSecurity();
      
      expect(validation.issues).toContain('App is running in development mode');
    });

    it('validates secure storage functionality', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);
      
      const validation = await securityService.validateAppSecurity();
      
      // Should test secure storage during validation
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'security_test',
        expect.any(String)
      );
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'security_test',
        expect.any(Object)
      );
    });
  });

  describe('Data Management', () => {
    it('clears all secure data', async () => {
      const result = await securityService.clearAllSecureData();
      
      expect(result).toBe(true);
      
      // Should delete common secure keys
      const expectedKeys = [
        'user_token',
        'user_credentials',
        'auth_state',
        'user_preferences_secure',
        'biometric_data',
      ];
      
      expectedKeys.forEach(key => {
        expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
          key,
          expect.any(Object)
        );
      });
    });
  });
});