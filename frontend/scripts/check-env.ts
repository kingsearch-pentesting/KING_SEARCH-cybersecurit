/**
 * Environment Variable Validation Script
 * 
 * Per Section 8.13: Validates required NEXT_PUBLIC_* variables are present before
 * build/start — must fail loudly (non-zero exit) rather than silently defaulting
 * a missing required variable.
 * 
 * This script checks that all required environment variables are set and validates
 * their formats where applicable. It should be run as part of the build/start process.
 * 
 * Usage:
 *   npm run check-env
 *   node scripts/check-env.ts
 * 
 * Integration:
 *   Add to package.json scripts:
 *   "prebuild": "node scripts/check-env.ts",
 *   "prestart": "node scripts/check-env.ts"
 */

import fs from 'fs';
import path from 'path';

// Environment variable definitions
interface EnvVarDefinition {
  name: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
  defaultValue?: string;
  examples?: string[];
}

const ENV_DEFINITIONS: EnvVarDefinition[] = [
  // API Configuration
  {
    name: 'NEXT_PUBLIC_API_BASE_URL',
    required: true,
    description: 'Base URL for the dashboard API',
    validator: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    examples: ['http://localhost:8001', 'https://api.example.com'],
  },
  {
    name: 'NEXT_PUBLIC_WS_BASE_URL',
    required: true,
    description: 'Base URL for WebSocket connections',
    validator: (value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'ws:' || url.protocol === 'wss:';
      } catch {
        return false;
      }
    },
    examples: ['ws://localhost:8001', 'wss://api.example.com'],
  },
  {
    name: 'NEXT_PUBLIC_API_VERSION',
    required: false,
    description: 'API version',
    defaultValue: 'v1',
    examples: ['v1', 'v2'],
  },

  // Application Configuration
  {
    name: 'NEXT_PUBLIC_APP_NAME',
    required: false,
    description: 'Application name',
    defaultValue: 'King Search Dashboard',
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: false,
    description: 'Application URL',
    defaultValue: 'http://localhost:3000',
    validator: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
  },
  {
    name: 'NEXT_PUBLIC_APP_ENV',
    required: false,
    description: 'Application environment',
    defaultValue: 'development',
    examples: ['development', 'staging', 'production'],
  },

  // Feature Flags
  {
    name: 'NEXT_PUBLIC_ENABLE_ANALYTICS',
    required: false,
    description: 'Enable analytics tracking',
    defaultValue: 'false',
    validator: (value) => ['true', 'false'].includes(value.toLowerCase()),
  },
  {
    name: 'NEXT_PUBLIC_ENABLE_WEBSOCKETS',
    required: false,
    description: 'Enable WebSocket connections',
    defaultValue: 'true',
    validator: (value) => ['true', 'false'].includes(value.toLowerCase()),
  },
  {
    name: 'NEXT_PUBLIC_ENABLE_NOTIFICATIONS',
    required: false,
    description: 'Enable notifications',
    defaultValue: 'true',
    validator: (value) => ['true', 'false'].includes(value.toLowerCase()),
  },
  {
    name: 'NEXT_PUBLIC_ENABLE_MONITORING',
    required: false,
    description: 'Enable performance monitoring',
    defaultValue: 'true',
    validator: (value) => ['true', 'false'].includes(value.toLowerCase()),
  },

  // Authentication Configuration
  {
    name: 'NEXT_PUBLIC_JWT_EXPIRATION_HOURS',
    required: false,
    description: 'JWT token expiration in hours',
    defaultValue: '24',
    validator: (value) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num > 0;
    },
  },
  {
    name: 'NEXT_PUBLIC_JWT_REFRESH_GRACE_DAYS',
    required: false,
    description: 'JWT refresh grace period in days',
    defaultValue: '7',
    validator: (value) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num > 0;
    },
  },

  // WebSocket Configuration
  {
    name: 'NEXT_PUBLIC_WS_HEARTBEAT_INTERVAL_SECONDS',
    required: false,
    description: 'WebSocket heartbeat interval in seconds',
    defaultValue: '30',
    validator: (value) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num > 0;
    },
  },
  {
    name: 'NEXT_PUBLIC_WS_HEARTBEAT_TIMEOUT_SECONDS',
    required: false,
    description: 'WebSocket heartbeat timeout in seconds',
    defaultValue: '60',
    validator: (value) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num > 0;
    },
  },
  {
    name: 'NEXT_PUBLIC_WS_RECONNECT_DELAY_MS',
    required: false,
    description: 'WebSocket reconnection delay in milliseconds',
    defaultValue: '1000',
    validator: (value) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num > 0;
    },
  },
  {
    name: 'NEXT_PUBLIC_WS_MAX_RECONNECT_ATTEMPTS',
    required: false,
    description: 'Maximum WebSocket reconnection attempts',
    defaultValue: '5',
    validator: (value) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num > 0;
    },
  },

  // Pagination Configuration
  {
    name: 'NEXT_PUBLIC_DEFAULT_PAGE_SIZE',
    required: false,
    description: 'Default page size for pagination',
    defaultValue: '20',
    validator: (value) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num > 0 && num <= 100;
    },
  },
  {
    name: 'NEXT_PUBLIC_MAX_PAGE_SIZE',
    required: false,
    description: 'Maximum page size for pagination',
    defaultValue: '100',
    validator: (value) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num > 0;
    },
  },

  // File Upload Configuration
  {
    name: 'NEXT_PUBLIC_MAX_FILE_SIZE_MB',
    required: false,
    description: 'Maximum file upload size in MB',
    defaultValue: '10',
    validator: (value) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num > 0;
    },
  },
  {
    name: 'NEXT_PUBLIC_ALLOWED_FILE_TYPES',
    required: false,
    description: 'Comma-separated list of allowed file types',
    defaultValue: '.json,.xml,.txt,.csv',
  },

  // Chart Configuration
  {
    name: 'NEXT_PUBLIC_CHART_ANIMATION_DURATION_MS',
    required: false,
    description: 'Chart animation duration in milliseconds',
    defaultValue: '500',
    validator: (value) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num >= 0;
    },
  },
  {
    name: 'NEXT_PUBLIC_CHART_REFRESH_INTERVAL_MS',
    required: false,
    description: 'Chart refresh interval in milliseconds',
    defaultValue: '30000',
    validator: (value) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num > 0;
    },
  },

  // Logging Configuration
  {
    name: 'NEXT_PUBLIC_LOG_LEVEL',
    required: false,
    description: 'Logging level',
    defaultValue: 'debug',
    examples: ['debug', 'info', 'warn', 'error'],
  },
  {
    name: 'NEXT_PUBLIC_ENABLE_CONSOLE_LOGGING',
    required: false,
    description: 'Enable console logging',
    defaultValue: 'true',
    validator: (value) => ['true', 'false'].includes(value.toLowerCase()),
  },

  // Error Tracking (Optional)
  {
    name: 'NEXT_PUBLIC_SENTRY_DSN',
    required: false,
    description: 'Sentry DSN for error tracking',
  },
  {
    name: 'NEXT_PUBLIC_SENTRY_ENVIRONMENT',
    required: false,
    description: 'Sentry environment',
    examples: ['development', 'staging', 'production'],
  },

  // Analytics (Optional)
  {
    name: 'NEXT_PUBLIC_GA_TRACKING_ID',
    required: false,
    description: 'Google Analytics tracking ID',
  },
  {
    name: 'NEXT_PUBLIC_GTM_ID',
    required: false,
    description: 'Google Tag Manager ID',
  },
];

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

/**
 * Validate a single environment variable
 */
function validateEnvVar(def: EnvVarDefinition): { valid: boolean; messages: string[] } {
  const messages: string[] = [];
  const value = process.env[def.name];

  // Check if required variable is missing
  if (def.required && !value) {
    messages.push(`❌ Missing required variable: ${def.name}`);
    return { valid: false, messages };
  }

  // Use default value if variable is not set but not required
  if (!value && def.defaultValue) {
    process.env[def.name] = def.defaultValue;
    messages.push(`⚠️  Using default value for ${def.name}: ${def.defaultValue}`);
    return { valid: true, messages };
  }

  // Skip validation if variable is not set and not required
  if (!value) {
    return { valid: true, messages: [] };
  }

  // Run custom validator if provided
  if (def.validator && !def.validator(value)) {
    messages.push(`❌ Invalid value for ${def.name}: ${value}`);
    if (def.examples) {
      messages.push(`   Examples: ${def.examples.join(', ')}`);
    }
    return { valid: false, messages };
  }

  return { valid: true, messages: [] };
}

/**
 * Validate all environment variables
 */
function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    info: [],
  };

  console.log('='.repeat(60));
  console.log('Environment Variable Validation');
  console.log('='.repeat(60));
  console.log('');

  for (const def of ENV_DEFINITIONS) {
    const { valid, messages } = validateEnvVar(def);

    for (const message of messages) {
      if (message.includes('❌')) {
        result.errors.push(message);
        result.isValid = false;
      } else if (message.includes('⚠️')) {
        result.warnings.push(message);
      } else {
        result.info.push(message);
      }
    }

    if (valid && messages.length === 0) {
      const value = process.env[def.name];
      result.info.push(`✓ ${def.name}: ${value || '(not set)'}`);
    }
  }

  return result;
}

/**
 * Print validation results
 */
function printResults(result: ValidationResult): void {
  // Print info messages
  if (result.info.length > 0) {
    console.log('Configuration:');
    result.info.forEach(msg => console.log(msg));
    console.log('');
  }

  // Print warnings
  if (result.warnings.length > 0) {
    console.log('Warnings:');
    result.warnings.forEach(msg => console.log(msg));
    console.log('');
  }

  // Print errors
  if (result.errors.length > 0) {
    console.log('Errors:');
    result.errors.forEach(msg => console.log(msg));
    console.log('');
  }

  // Print summary
  console.log('='.repeat(60));
  if (result.isValid) {
    console.log('✓ Environment validation passed');
  } else {
    console.log('✗ Environment validation failed');
  }
  console.log('='.repeat(60));
}

/**
 * Check .env file exists
 */
function checkEnvFile(): void {
  const projectRoot = process.cwd();
  const envPaths = [
    path.join(projectRoot, '.env'),
    path.join(projectRoot, '.env.local'),
    path.join(projectRoot, '.env.development'),
    path.join(projectRoot, '.env.production'),
  ];

  const foundEnv = envPaths.some(p => fs.existsSync(p));

  if (!foundEnv) {
    console.log('⚠️  No .env file found. Using system environment variables.');
    console.log('   Consider creating a .env file from .env.example');
    console.log('');
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  checkEnvFile();

  const result = validateEnvironment();
  printResults(result);

  if (!result.isValid) {
    console.log('');
    console.log('Please fix the errors above before proceeding.');
    console.log('Refer to .env.example for required environment variables.');
    process.exit(1);
  }

  if (result.warnings.length > 0) {
    console.log('');
    console.log('Please review the warnings above.');
  }

  console.log('');
  console.log('Environment is ready for build/start.');
}

/**
 * Print help information
 */
function printHelp(): void {
  console.log('');
  console.log('Environment Variable Validation Script');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/check-env.ts');
  console.log('  npm run check-env');
  console.log('');
  console.log('This script validates that all required NEXT_PUBLIC_* environment');
  console.log('variables are set and properly formatted before build/start.');
  console.log('');
  console.log('Required variables:');
  ENV_DEFINITIONS
    .filter(def => def.required)
    .forEach(def => {
      console.log(`  ${def.name}`);
      console.log(`    ${def.description}`);
      if (def.examples) {
        console.log(`    Examples: ${def.examples.join(', ')}`);
      }
    });
  console.log('');
}

// Run if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  main();
}

export { main as checkEnv };
export { validateEnvironment };
export { ENV_DEFINITIONS };
