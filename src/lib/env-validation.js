import { z } from "zod";

/**
 * Environment variable validation schema
 * This ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Required Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_KEY: z.string().min(1, "SUPABASE_SERVICE_KEY is required"),

  // Optional Garmin integration
  GARMIN_CLIENT_ID: z.string().optional(),
  GARMIN_CLIENT_SECRET: z.string().optional(),
  GARMIN_REDIRECT_URI: z.string().url().optional(),

  // Optional monitoring
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Optional map services
  MAPBOX_ACCESS_TOKEN: z.string().optional(),
  NEXT_PUBLIC_MAP_TILE_URL: z.string().url().optional(),

  // Development settings
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("Trainr App"),

  // Optional database
  DATABASE_URL: z.string().url().optional(),

  // Optional integrations
  STRAVA_CLIENT_ID: z.string().optional(),
  STRAVA_CLIENT_SECRET: z.string().optional(),
  APPLE_HEALTH_CLIENT_ID: z.string().optional(),
  APPLE_HEALTH_CLIENT_SECRET: z.string().optional(),
  GOOGLE_FIT_CLIENT_ID: z.string().optional(),
  GOOGLE_FIT_CLIENT_SECRET: z.string().optional(),

  // Feature flags
  NEXT_PUBLIC_ENABLE_GARMIN_INTEGRATION: z.string().transform(val => val === "true").default("false"),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val === "true").default("false"),
  NEXT_PUBLIC_ENABLE_DEBUG_LOGS: z.string().transform(val => val === "true").default("false"),

  // Performance & caching
  REDIS_URL: z.string().url().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // Email & notifications
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(val => parseInt(val)).optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASSWORD: z.string().optional(),

  // File storage
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
});

/**
 * Validate environment variables and return parsed config
 * @returns {object} Validated environment configuration
 * @throws {Error} If validation fails
 */
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    
    // Additional validation logic
    if (env.NEXT_PUBLIC_ENABLE_GARMIN_INTEGRATION) {
      if (!env.GARMIN_CLIENT_ID || !env.GARMIN_CLIENT_SECRET) {
        console.warn("⚠️  Garmin integration is enabled but GARMIN_CLIENT_ID or GARMIN_CLIENT_SECRET is missing");
      }
    }

    if (env.NODE_ENV === "production") {
      if (!env.SENTRY_DSN) {
        console.warn("⚠️  Production environment detected but SENTRY_DSN is not configured");
      }
    }

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter(err => err.code === "invalid_type" && err.received === "undefined")
        .map(err => err.path.join("."));
      
      const invalidVars = error.errors
        .filter(err => err.code !== "invalid_type")
        .map(err => `${err.path.join(".")}: ${err.message}`);

      let errorMessage = "❌ Environment validation failed:\n";
      
      if (missingVars.length > 0) {
        errorMessage += `\nMissing required variables:\n${missingVars.map(v => `  - ${v}`).join("\n")}`;
      }
      
      if (invalidVars.length > 0) {
        errorMessage += `\nInvalid variables:\n${invalidVars.map(v => `  - ${v}`).join("\n")}`;
      }
      
      errorMessage += `\n\nPlease check your .env.local file and ensure all required variables are set.`;
      
      throw new Error(errorMessage);
    }
    
    throw error;
  }
}

/**
 * Get environment configuration with validation
 * This should be called at application startup
 */
export const env = validateEnv();

/**
 * Helper to check if a feature is enabled
 * @param {string} feature - Feature name
 * @returns {boolean} Whether the feature is enabled
 */
export function isFeatureEnabled(feature) {
  switch (feature) {
    case "garmin":
      return env.NEXT_PUBLIC_ENABLE_GARMIN_INTEGRATION;
    case "analytics":
      return env.NEXT_PUBLIC_ENABLE_ANALYTICS;
    case "debug":
      return env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS;
    default:
      return false;
  }
}

/**
 * Helper to get Supabase configuration
 * @returns {object} Supabase config
 */
export function getSupabaseConfig() {
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: env.SUPABASE_SERVICE_KEY,
  };
}

/**
 * Helper to get Garmin configuration
 * @returns {object|null} Garmin config or null if not configured
 */
export function getGarminConfig() {
  if (!isFeatureEnabled("garmin")) {
    return null;
  }

  return {
    clientId: env.GARMIN_CLIENT_ID,
    clientSecret: env.GARMIN_CLIENT_SECRET,
    redirectUri: env.GARMIN_REDIRECT_URI,
  };
}

/**
 * Helper to check if we're in development mode
 * @returns {boolean} Whether we're in development
 */
export function isDevelopment() {
  return env.NODE_ENV === "development";
}

/**
 * Helper to check if we're in production mode
 * @returns {boolean} Whether we're in production
 */
export function isProduction() {
  return env.NODE_ENV === "production";
}
