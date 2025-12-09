/**
 * Production Environment Configuration Validator
 * 
 * Validates that all required environment variables are properly configured
 * and provides helpful warnings for optional configurations.
 */

interface EnvValidationResult {
  isValid: boolean;
  required: {
    name: string;
    value: string | undefined;
    isValid: boolean;
    message: string;
  }[];
  optional: {
    name: string;
    value: string | undefined;
    isConfigured: boolean;
    feature: string;
  }[];
  warnings: string[];
  errors: string[];
}

class EnvironmentValidator {
  /**
   * Validate all environment variables
   */
  validate(): EnvValidationResult {
    const result: EnvValidationResult = {
      isValid: true,
      required: [],
      optional: [],
      warnings: [],
      errors: [],
    };

    // Required configurations
    const requiredConfigs = [
      {
        name: 'EXPO_PUBLIC_SUPABASE_URL',
        value: process.env.EXPO_PUBLIC_SUPABASE_URL,
        validator: (val?: string) => val?.startsWith('https://') && val.includes('.supabase.co'),
        message: 'Must be a valid Supabase URL (https://xxxxx.supabase.co)',
      },
      {
        name: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
        value: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        validator: (val?: string) => val && val.length > 100 && val.startsWith('eyJ'),
        message: 'Must be a valid Supabase anon key (JWT token)',
      },
    ];

    // Optional configurations
    const optionalConfigs = [
      {
        name: 'EXPO_PUBLIC_PROJECT_ID',
        value: process.env.EXPO_PUBLIC_PROJECT_ID,
        feature: 'Push Notifications',
        validator: (val?: string) => !!val && val !== 'your-project-id' && val.trim() !== '',
      },
      {
        name: 'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY',
        value: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        feature: 'Google Maps Integration',
        validator: (val?: string) => !!val && val !== 'your-google-maps-api-key',
      },
      {
        name: 'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        value: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        feature: 'Payment Processing',
        validator: (val?: string) => !!val && (val.startsWith('pk_') || val.startsWith('sb_')),
      },
    ];

    // Validate required configs
    requiredConfigs.forEach((config) => {
      const isValid = config.validator(config.value) === true;
      result.required.push({
        name: config.name,
        value: config.value,
        isValid,
        message: isValid ? '✅ Configured' : `❌ ${config.message}`,
      });

      if (!isValid) {
        result.isValid = false;
        result.errors.push(`${config.name}: ${config.message}`);
      }
    });

    // Validate optional configs
    optionalConfigs.forEach((config) => {
      const isConfigured = config.validator(config.value);
      result.optional.push({
        name: config.name,
        value: config.value,
        isConfigured,
        feature: config.feature,
      });

      if (!isConfigured) {
        result.warnings.push(
          `${config.feature} disabled - ${config.name} not configured (This is optional)`
        );
      }
    });

    return result;
  }

  /**
   * Print validation results to console
   */
  printValidation(result: EnvValidationResult): void {
    console.log('\n🔍 Environment Configuration Validation\n');
    console.log('━'.repeat(50));
    
    // Required configurations
    console.log('\n📋 Required Configuration:');
    result.required.forEach((config) => {
      const status = config.isValid ? '✅' : '❌';
      console.log(`  ${status} ${config.name}`);
      if (!config.isValid) {
        console.log(`     ${config.message}`);
      }
    });

    // Optional configurations
    console.log('\n📦 Optional Features:');
    result.optional.forEach((config) => {
      const status = config.isConfigured ? '✅' : '⚪';
      console.log(`  ${status} ${config.feature}`);
      if (!config.isConfigured) {
        console.log(`     (${config.name} not configured)`);
      }
    });

    // Summary
    console.log('\n━'.repeat(50));
    if (result.isValid) {
      console.log('✅ Environment configuration is valid!\n');
      if (result.warnings.length > 0) {
        console.log('ℹ️  Optional features disabled:');
        result.warnings.forEach((warning) => {
          console.log(`   • ${warning}`);
        });
        console.log('\n💡 The app will work perfectly without these features.\n');
      }
    } else {
      console.log('❌ Environment configuration has errors!\n');
      console.log('Errors:');
      result.errors.forEach((error) => {
        console.log(`   • ${error}`);
      });
      console.log('\n🔧 Fix these errors in your .env file or app configuration.\n');
    }
    console.log('━'.repeat(50) + '\n');
  }

  /**
   * Get user-friendly status message
   */
  getStatusMessage(result: EnvValidationResult): string {
    if (!result.isValid) {
      return 'Configuration incomplete - Please update your settings';
    }
    
    const optionalCount = result.optional.filter((c) => c.isConfigured).length;
    const totalOptional = result.optional.length;
    
    if (optionalCount === totalOptional) {
      return 'All features enabled - Ready for production!';
    } else {
      return `Core features ready - ${optionalCount}/${totalOptional} optional features enabled`;
    }
  }
}

export const envValidator = new EnvironmentValidator();

// Run validation in development
if (__DEV__) {
  const result = envValidator.validate();
  envValidator.printValidation(result);
}

export default envValidator;
