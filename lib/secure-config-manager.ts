import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Secure Configuration Manager
 * Handles storage and retrieval of sensitive configuration data using Expo SecureStore
 */

export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  // Add other sensitive configs as needed
  googleMapsApiKey?: string;
  stripePublishableKey?: string;
}

const CONFIG_KEYS = {
  SUPABASE_URL: 'secure_supabase_url',
  SUPABASE_ANON_KEY: 'secure_supabase_anon_key',
  GOOGLE_MAPS_API_KEY: 'secure_google_maps_api_key',
  STRIPE_PUBLISHABLE_KEY: 'secure_stripe_publishable_key',
  CONFIG_INITIALIZED: 'config_initialized',
} as const;

class SecureConfigManager {
  private configCache: Partial<AppConfig> | null = null;

  /**
   * Check if configuration has been initialized
   */
  async isConfigured(): Promise<boolean> {
    try {
      // Check SecureStore first
      const initialized = await AsyncStorage.getItem(CONFIG_KEYS.CONFIG_INITIALIZED);
      if (initialized === 'true') {
        return true;
      }
      
      // Fallback: Check if .env has valid credentials
      const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      if (envUrl && envKey && 
          envUrl.startsWith('https://') && 
          envUrl.includes('.supabase.co') &&
          envKey.length > 100) {
        console.log('✅ Using credentials from .env file');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking config status:', error);
      return false;
    }
  }

  /**
   * Save configuration securely
   */
  async saveConfig(config: AppConfig): Promise<void> {
    try {
      // Validate required fields
      if (!config.supabaseUrl || !config.supabaseAnonKey) {
        throw new Error('Supabase URL and Anon Key are required');
      }

      // Save to SecureStore
      await SecureStore.setItemAsync(CONFIG_KEYS.SUPABASE_URL, config.supabaseUrl);
      await SecureStore.setItemAsync(CONFIG_KEYS.SUPABASE_ANON_KEY, config.supabaseAnonKey);

      // Save optional configs
      if (config.googleMapsApiKey) {
        await SecureStore.setItemAsync(CONFIG_KEYS.GOOGLE_MAPS_API_KEY, config.googleMapsApiKey);
      }
      if (config.stripePublishableKey) {
        await SecureStore.setItemAsync(CONFIG_KEYS.STRIPE_PUBLISHABLE_KEY, config.stripePublishableKey);
      }

      // Mark as initialized
      await AsyncStorage.setItem(CONFIG_KEYS.CONFIG_INITIALIZED, 'true');

      // Update cache
      this.configCache = config;
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  }

  /**
   * Load configuration from secure storage
   */
  async loadConfig(): Promise<AppConfig | null> {
    try {
      // Return cached config if available
      if (this.configCache && this.configCache.supabaseUrl && this.configCache.supabaseAnonKey) {
        return this.configCache as AppConfig;
      }

      const isConfigured = await this.isConfigured();
      if (!isConfigured) {
        return null;
      }

      // Try to load from SecureStore first
      const supabaseUrl = await SecureStore.getItemAsync(CONFIG_KEYS.SUPABASE_URL);
      const supabaseAnonKey = await SecureStore.getItemAsync(CONFIG_KEYS.SUPABASE_ANON_KEY);

      // If SecureStore has values, use them
      if (supabaseUrl && supabaseAnonKey) {
        const config: AppConfig = {
          supabaseUrl,
          supabaseAnonKey,
          googleMapsApiKey: (await SecureStore.getItemAsync(CONFIG_KEYS.GOOGLE_MAPS_API_KEY)) || undefined,
          stripePublishableKey: (await SecureStore.getItemAsync(CONFIG_KEYS.STRIPE_PUBLISHABLE_KEY)) || undefined,
        };

        // Cache the config
        this.configCache = { ...config };
        return config;
      }

      // Fallback to .env file
      const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      if (envUrl && envKey) {
        console.log('📄 Loading configuration from .env file');
        const config: AppConfig = {
          supabaseUrl: envUrl,
          supabaseAnonKey: envKey,
          googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        };

        // Cache the config
        this.configCache = { ...config };
        return config;
      }

      return null;
    } catch (error) {
      console.error('Error loading config:', error);
      return null;
    }
  }

  /**
   * Get a specific config value
   */
  async getConfigValue(key: keyof typeof CONFIG_KEYS): Promise<string | null> {
    try {
      const configKey = CONFIG_KEYS[key];
      return await SecureStore.getItemAsync(configKey);
    } catch (error) {
      console.error(`Error getting config value for ${key}:`, error);
      return null;
    }
  }

  /**
   * Update a specific config value
   */
  async updateConfigValue(key: keyof typeof CONFIG_KEYS, value: string): Promise<void> {
    try {
      const configKey = CONFIG_KEYS[key];
      await SecureStore.setItemAsync(configKey, value);

      // Invalidate cache
      this.configCache = null;
    } catch (error) {
      console.error(`Error updating config value for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all configuration (use with caution)
   */
  async clearConfig(): Promise<void> {
    try {
      // Delete all secure store items
      await SecureStore.deleteItemAsync(CONFIG_KEYS.SUPABASE_URL);
      await SecureStore.deleteItemAsync(CONFIG_KEYS.SUPABASE_ANON_KEY);
      await SecureStore.deleteItemAsync(CONFIG_KEYS.GOOGLE_MAPS_API_KEY);
      await SecureStore.deleteItemAsync(CONFIG_KEYS.STRIPE_PUBLISHABLE_KEY);

      // Clear initialization flag
      await AsyncStorage.removeItem(CONFIG_KEYS.CONFIG_INITIALIZED);

      // Clear cache
      this.configCache = null;
    } catch (error) {
      console.error('Error clearing config:', error);
      throw error;
    }
  }

  /**
   * Validate Supabase connection
   */
  async validateSupabaseConfig(url: string, anonKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          apikey: anonKey,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error validating Supabase config:', error);
      return false;
    }
  }

  /**
   * Clear cache (useful after config updates)
   */
  clearCache(): void {
    this.configCache = null;
  }
}

// Export singleton instance
export const secureConfigManager = new SecureConfigManager();

// Export helper functions
export async function isAppConfigured(): Promise<boolean> {
  return secureConfigManager.isConfigured();
}

export async function getAppConfig(): Promise<AppConfig | null> {
  return secureConfigManager.loadConfig();
}

export async function saveAppConfig(config: AppConfig): Promise<void> {
  return secureConfigManager.saveConfig(config);
}

export async function clearAppConfig(): Promise<void> {
  return secureConfigManager.clearConfig();
}
