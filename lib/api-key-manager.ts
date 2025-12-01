import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface APIKey {
  id: string;
  name: string;
  key: string;
  provider: string;
  description?: string;
  environment: 'development' | 'staging' | 'production';
  permissions: string[];
  expiresAt?: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

export interface APIKeyMetadata {
  id: string;
  name: string;
  provider: string;
  description?: string;
  environment: string;
  permissions: string[];
  expiresAt?: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

interface SecureAPIKeyStorage {
  keys: Record<string, string>; // Encrypted key data
  metadata: Record<string, APIKeyMetadata>;
  salt: string;
  checksum: string;
}

class APIKeyManager {
  private readonly STORAGE_KEY = 'api_keys_storage';
  private readonly SALT_KEY = 'api_keys_salt';
  private readonly VERSION_KEY = 'api_keys_version';
  private readonly CURRENT_VERSION = '1.0.0';
  
  private masterKey: string | null = null;
  private cache: Map<string, APIKey> = new Map();
  private isInitialized = false;

  /**
   * Initialize the API key manager
   * This should be called once when the app starts
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      // Check if SecureStore is available
      if (!SecureStore.isAvailableAsync()) {
        console.warn('SecureStore is not available on this platform');
        return false;
      }

      // Generate or retrieve master key
      await this.initializeMasterKey();
      
      // Load existing API keys
      await this.loadKeys();

      this.isInitialized = true;
      console.log('✅ API Key Manager initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize API Key Manager:', error);
      return false;
    }
  }

  /**
   * Generate or retrieve the master encryption key
   */
  private async initializeMasterKey(): Promise<void> {
    try {
      // Try to get existing master key
      const existingKey = await SecureStore.getItemAsync('master_encryption_key');
      
      if (existingKey) {
        this.masterKey = existingKey;
        return;
      }

      // Generate new master key if none exists
      const deviceId = Constants.sessionId || 'default-device';
      const timestamp = Date.now().toString();
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      
      // Create master key from device info and random data
      const keyMaterial = `${deviceId}-${timestamp}-${Buffer.from(randomBytes).toString('base64')}`;
      this.masterKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        keyMaterial
      );

      // Store master key securely
      await SecureStore.setItemAsync('master_encryption_key', this.masterKey, {
        requireAuthentication: Platform.OS === 'ios',
        keychainService: 'towntap-api-keys',
      });

    } catch (error) {
      console.error('Failed to initialize master key:', error);
      throw new Error('Could not initialize encryption');
    }
  }

  /**
   * Encrypt sensitive data
   */
  private async encryptData(data: string, salt: string): Promise<string> {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    try {
      // Create encryption key from master key and salt
      const encryptionKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${this.masterKey}-${salt}`
      );

      // Simple XOR encryption (in production, use proper AES encryption)
      const encrypted = Buffer.from(data)
        .map((byte, index) => byte ^ encryptionKey.charCodeAt(index % encryptionKey.length))
        .toString('base64');

      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  private async decryptData(encryptedData: string, salt: string): Promise<string> {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    try {
      // Create decryption key from master key and salt
      const decryptionKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${this.masterKey}-${salt}`
      );

      // Decrypt using XOR
      const decrypted = Buffer.from(encryptedData, 'base64')
        .map((byte, index) => byte ^ decryptionKey.charCodeAt(index % decryptionKey.length))
        .toString();

      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Generate a secure salt
   */
  private async generateSalt(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return Buffer.from(randomBytes).toString('base64');
  }

  /**
   * Calculate checksum for data integrity
   */
  private async calculateChecksum(data: string): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );
  }

  /**
   * Load API keys from secure storage
   */
  private async loadKeys(): Promise<void> {
    try {
      const storageData = await SecureStore.getItemAsync(this.STORAGE_KEY);
      
      if (!storageData) {
        console.log('No existing API keys found');
        return;
      }

      const parsedData: SecureAPIKeyStorage = JSON.parse(storageData);
      
      // Verify data integrity
      const dataForChecksum = JSON.stringify({
        keys: parsedData.keys,
        metadata: parsedData.metadata,
        salt: parsedData.salt,
      });
      
      const currentChecksum = await this.calculateChecksum(dataForChecksum);
      
      if (currentChecksum !== parsedData.checksum) {
        console.warn('API key data integrity check failed');
        return;
      }

      // Decrypt and load keys into cache
      for (const [id, encryptedKey] of Object.entries(parsedData.keys)) {
        const metadata = parsedData.metadata[id];
        if (metadata && metadata.isActive) {
          try {
            const decryptedKey = await this.decryptData(encryptedKey, parsedData.salt);
            
            this.cache.set(id, {
              ...metadata,
              key: decryptedKey,
            });
          } catch (error) {
            console.error(`Failed to decrypt key ${id}:`, error);
          }
        }
      }

      console.log(`✅ Loaded ${this.cache.size} API keys from secure storage`);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  }

  /**
   * Save API keys to secure storage
   */
  private async saveKeys(): Promise<void> {
    try {
      const salt = await this.generateSalt();
      const keys: Record<string, string> = {};
      const metadata: Record<string, APIKeyMetadata> = {};

      // Encrypt all keys
      for (const [id, apiKey] of this.cache.entries()) {
        const encryptedKey = await this.encryptData(apiKey.key, salt);
        keys[id] = encryptedKey;
        
        // Store metadata without the actual key
        metadata[id] = {
          id: apiKey.id,
          name: apiKey.name,
          provider: apiKey.provider,
          description: apiKey.description,
          environment: apiKey.environment,
          permissions: apiKey.permissions,
          expiresAt: apiKey.expiresAt,
          createdAt: apiKey.createdAt,
          lastUsed: apiKey.lastUsed,
          isActive: apiKey.isActive,
        };
      }

      // Create storage data with checksum
      const dataForChecksum = JSON.stringify({ keys, metadata, salt });
      const checksum = await this.calculateChecksum(dataForChecksum);

      const storageData: SecureAPIKeyStorage = {
        keys,
        metadata,
        salt,
        checksum,
      };

      // Save to secure storage
      await SecureStore.setItemAsync(
        this.STORAGE_KEY,
        JSON.stringify(storageData),
        {
          requireAuthentication: Platform.OS === 'ios',
          keychainService: 'towntap-api-keys',
        }
      );

      // Store version info
      await SecureStore.setItemAsync(this.VERSION_KEY, this.CURRENT_VERSION);

      console.log('✅ API keys saved to secure storage');
    } catch (error) {
      console.error('Failed to save API keys:', error);
      throw new Error('Could not save API keys securely');
    }
  }

  /**
   * Add a new API key
   */
  async addKey(
    name: string,
    key: string,
    provider: string,
    options: {
      description?: string;
      environment?: 'development' | 'staging' | 'production';
      permissions?: string[];
      expiresAt?: Date;
    } = {}
  ): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('API Key Manager not initialized');
    }

    try {
      const id = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${name}-${provider}-${Date.now()}`
      );

      const apiKey: APIKey = {
        id,
        name,
        key,
        provider,
        description: options.description,
        environment: options.environment || 'development',
        permissions: options.permissions || [],
        expiresAt: options.expiresAt?.toISOString(),
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      this.cache.set(id, apiKey);
      await this.saveKeys();

      console.log(`✅ Added API key: ${name} (${provider})`);
      return id;
    } catch (error) {
      console.error('Failed to add API key:', error);
      throw new Error('Could not add API key');
    }
  }

  /**
   * Get an API key by ID
   */
  async getKey(id: string): Promise<APIKey | null> {
    if (!this.isInitialized) {
      throw new Error('API Key Manager not initialized');
    }

    const apiKey = this.cache.get(id);
    
    if (apiKey) {
      // Update last used timestamp
      apiKey.lastUsed = new Date().toISOString();
      this.cache.set(id, apiKey);
      
      // Save updated timestamp (async, don't wait)
      this.saveKeys().catch(console.error);
      
      return apiKey;
    }

    return null;
  }

  /**
   * Get an API key by name and provider
   */
  async getKeyByName(name: string, provider?: string): Promise<APIKey | null> {
    if (!this.isInitialized) {
      throw new Error('API Key Manager not initialized');
    }

    for (const apiKey of this.cache.values()) {
      if (apiKey.name === name && (!provider || apiKey.provider === provider)) {
        if (this.isKeyValid(apiKey)) {
          // Update last used timestamp
          apiKey.lastUsed = new Date().toISOString();
          this.cache.set(apiKey.id, apiKey);
          
          // Save updated timestamp (async, don't wait)
          this.saveKeys().catch(console.error);
          
          return apiKey;
        }
      }
    }

    return null;
  }

  /**
   * Get all API keys (metadata only, no actual keys)
   */
  async getAllKeys(): Promise<APIKeyMetadata[]> {
    if (!this.isInitialized) {
      throw new Error('API Key Manager not initialized');
    }

    return Array.from(this.cache.values()).map(key => ({
      id: key.id,
      name: key.name,
      provider: key.provider,
      description: key.description,
      environment: key.environment,
      permissions: key.permissions,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      isActive: key.isActive,
    }));
  }

  /**
   * Update an existing API key
   */
  async updateKey(
    id: string,
    updates: Partial<Pick<APIKey, 'name' | 'description' | 'permissions' | 'isActive' | 'expiresAt'>>
  ): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('API Key Manager not initialized');
    }

    const existingKey = this.cache.get(id);
    if (!existingKey) {
      return false;
    }

    const updatedKey = {
      ...existingKey,
      ...updates,
    };

    this.cache.set(id, updatedKey);
    await this.saveKeys();

    console.log(`✅ Updated API key: ${updatedKey.name}`);
    return true;
  }

  /**
   * Delete an API key
   */
  async deleteKey(id: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('API Key Manager not initialized');
    }

    const key = this.cache.get(id);
    if (!key) {
      return false;
    }

    this.cache.delete(id);
    await this.saveKeys();

    console.log(`🗑️ Deleted API key: ${key.name}`);
    return true;
  }

  /**
   * Check if an API key is valid (not expired and active)
   */
  private isKeyValid(apiKey: APIKey): boolean {
    if (!apiKey.isActive) {
      return false;
    }

    if (apiKey.expiresAt) {
      const expirationDate = new Date(apiKey.expiresAt);
      if (expirationDate < new Date()) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get statistics about stored keys
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    byProvider: Record<string, number>;
    byEnvironment: Record<string, number>;
  }> {
    if (!this.isInitialized) {
      throw new Error('API Key Manager not initialized');
    }

    const keys = Array.from(this.cache.values());
    const now = new Date();

    const stats = {
      total: keys.length,
      active: 0,
      expired: 0,
      byProvider: {} as Record<string, number>,
      byEnvironment: {} as Record<string, number>,
    };

    for (const key of keys) {
      if (key.isActive) {
        stats.active++;
      }

      if (key.expiresAt && new Date(key.expiresAt) < now) {
        stats.expired++;
      }

      stats.byProvider[key.provider] = (stats.byProvider[key.provider] || 0) + 1;
      stats.byEnvironment[key.environment] = (stats.byEnvironment[key.environment] || 0) + 1;
    }

    return stats;
  }

  /**
   * Clear all API keys (use with caution)
   */
  async clearAllKeys(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('API Key Manager not initialized');
    }

    this.cache.clear();
    await SecureStore.deleteItemAsync(this.STORAGE_KEY);
    
    console.log('🧹 All API keys cleared');
  }

  /**
   * Export API keys (metadata only, for backup)
   */
  async exportMetadata(): Promise<APIKeyMetadata[]> {
    return await this.getAllKeys();
  }

  /**
   * Check if manager is initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }
}

// Create and export singleton instance
export const apiKeyManager = new APIKeyManager();

// Convenience functions for common API keys
export const apiKeyHelpers = {
  /**
   * Get Supabase API key
   */
  getSupabaseKey: async (): Promise<string | null> => {
    const key = await apiKeyManager.getKeyByName('supabase', 'supabase');
    return key?.key || null;
  },

  /**
   * Get Google Maps API key
   */
  getGoogleMapsKey: async (): Promise<string | null> => {
    const key = await apiKeyManager.getKeyByName('google-maps', 'google');
    return key?.key || null;
  },

  /**
   * Get Stripe API key
   */
  getStripeKey: async (): Promise<string | null> => {
    const key = await apiKeyManager.getKeyByName('stripe', 'stripe');
    return key?.key || null;
  },

  /**
   * Get OpenAI API key
   */
  getOpenAIKey: async (): Promise<string | null> => {
    const key = await apiKeyManager.getKeyByName('openai', 'openai');
    return key?.key || null;
  },

  /**
   * Initialize with common API keys
   */
  initializeCommonKeys: async (): Promise<void> => {
    try {
      // Add common API keys if they don't exist
      const existingKeys = await apiKeyManager.getAllKeys();
      const keyNames = new Set(existingKeys.map(k => `${k.name}-${k.provider}`));

      // Supabase keys
      if (process.env.EXPO_PUBLIC_SUPABASE_URL && !keyNames.has('supabase-supabase')) {
        await apiKeyManager.addKey(
          'supabase',
          process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
          'supabase',
          {
            description: 'Supabase anonymous key',
            environment: 'development',
            permissions: ['read', 'write'],
          }
        );
      }

      // Google Maps key
      if (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY && !keyNames.has('google-maps-google')) {
        await apiKeyManager.addKey(
          'google-maps',
          process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          'google',
          {
            description: 'Google Maps API key',
            environment: 'development',
            permissions: ['maps', 'geocoding'],
          }
        );
      }

      // Stripe key
      if (process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY && !keyNames.has('stripe-stripe')) {
        await apiKeyManager.addKey(
          'stripe',
          process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
          'stripe',
          {
            description: 'Stripe publishable key',
            environment: 'development',
            permissions: ['payments'],
          }
        );
      }

      console.log('✅ Common API keys initialized');
    } catch (error) {
      console.error('Failed to initialize common keys:', error);
    }
  },
};

export default apiKeyManager;