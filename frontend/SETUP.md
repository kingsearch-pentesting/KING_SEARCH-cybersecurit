# Frontend Setup Guide

This guide will help you configure the frontend environment variables for the King Search Dashboard.

## Prerequisites

- Node.js >= 20.0.0
- npm >= 9.0.0
- Backend API server running (dashboard_api)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

#### For Local Development

1. Copy the example file:

```bash
cp .env.local.example .env.local
```

1. Edit `.env.local` and configure the required variables:

```bash
# REQUIRED - Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001

# REQUIRED - WebSocket URL
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8001
```

1. (Optional) Configure other variables as needed for your development setup

#### For Production

1. Edit `.env.production` with your production URLs:

```bash
# REQUIRED - Replace with your production API URL
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com

# REQUIRED - Replace with your production WebSocket URL
NEXT_PUBLIC_WS_BASE_URL=wss://api.yourdomain.com
```

1. Configure other production-specific settings (Sentry, Analytics, etc.)

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API server URL | `http://localhost:8001` |
| `NEXT_PUBLIC_WS_BASE_URL` | WebSocket server URL | `ws://localhost:8001` |

**Note:** These variables are REQUIRED. The application will fail to start without them.

### Optional Variables

#### Authentication

- `NEXT_PUBLIC_JWT_EXPIRATION_HOURS` - JWT token expiration in hours (default: 24)
- `NEXT_PUBLIC_JWT_REFRESH_GRACE_DAYS` - JWT refresh grace period in days (default: 7)

#### Application

- `NEXT_PUBLIC_APP_NAME` - Application name (default: "King Search Dashboard")
- `NEXT_PUBLIC_APP_URL` - Application URL (default: inferred from window.location)
- `NEXT_PUBLIC_APP_ENV` - Environment (default: "development")

#### Feature Flags

- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Enable analytics features (default: true)
- `NEXT_PUBLIC_ENABLE_WEBSOCKETS` - Enable WebSocket connections (default: true)
- `NEXT_PUBLIC_ENABLE_NOTIFICATIONS` - Enable notifications (default: true)

#### Rate Limiting

- `NEXT_PUBLIC_RATE_LIMIT_REQUESTS_PER_SECOND` - Client-side rate limit awareness (default: 250)
- `NEXT_PUBLIC_RATE_LIMIT_BURST_SIZE` - Burst size for rate limiting (default: 5000)

#### WebSocket

- `NEXT_PUBLIC_WS_HEARTBEAT_INTERVAL_SECONDS` - Heartbeat interval (default: 30)
- `NEXT_PUBLIC_WS_HEARTBEAT_TIMEOUT_SECONDS` - Heartbeat timeout (default: 60)
- `NEXT_PUBLIC_WS_RECONNECT_DELAY_MS` - Reconnect delay (default: 1000)
- `NEXT_PUBLIC_WS_MAX_RECONNECT_ATTEMPTS` - Max reconnect attempts (default: 5)

#### Pagination

- `NEXT_PUBLIC_DEFAULT_PAGE_SIZE` - Default page size (default: 20)
- `NEXT_PUBLIC_MAX_PAGE_SIZE` - Maximum page size (default: 100)

#### File Upload

- `NEXT_PUBLIC_MAX_FILE_SIZE_MB` - Max file size in MB (default: 10)
- `NEXT_PUBLIC_ALLOWED_FILE_TYPES` - Allowed file extensions (default: .json,.xml,.txt,.csv)

#### Charts

- `NEXT_PUBLIC_CHART_ANIMATION_DURATION_MS` - Chart animation duration (default: 500)
- `NEXT_PUBLIC_CHART_REFRESH_INTERVAL_MS` - Chart refresh interval (default: 30000)

#### Logging

- `NEXT_PUBLIC_LOG_LEVEL` - Log level: debug, info, warn, error (default: debug)
- `NEXT_PUBLIC_ENABLE_CONSOLE_LOGGING` - Enable console logging (default: true)

#### Analytics (Optional)

- `NEXT_PUBLIC_GA_TRACKING_ID` - Google Analytics tracking ID
- `NEXT_PUBLIC_GTM_ID` - Google Tag Manager ID

#### Error Tracking (Optional)

- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for error tracking
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT` - Sentry environment name

## Troubleshooting

### "Configuration Error: NEXT_PUBLIC_API_BASE_URL is not set"

**Problem:** Required environment variables are missing.

**Solution:**

1. Ensure you have created `.env.local` from `.env.local.example`
2. Check that `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_WS_BASE_URL` are set
3. Restart the development server after changing environment variables

### WebSocket Connection Fails

**Problem:** WebSocket cannot connect to the server.

**Solution:**

1. Verify `NEXT_PUBLIC_WS_BASE_URL` is correct
2. Ensure the backend server is running and accessible
3. Check that the WebSocket URL uses the correct protocol (`ws://` for HTTP, `wss://` for HTTPS)
4. Check browser console for specific error messages

### API Calls Fail with 404 or Connection Errors

**Problem:** Frontend cannot reach the backend API.

**Solution:**

1. Verify `NEXT_PUBLIC_API_BASE_URL` is correct
2. Ensure the backend API server is running on the specified port
3. Check CORS configuration on the backend
4. Verify the API proxy in `next.config.js` is configured correctly for development

### Environment Variables Not Loading

**Problem:** Changes to `.env.local` are not taking effect.

**Solution:**

1. Restart the development server
2. Ensure the file is named exactly `.env.local` (not `.env.local.txt`)
3. Check that the file is in the root of the frontend directory
4. Verify the file is not ignored by `.gitignore`

## Security Best Practices

1. **Never commit `.env.local`** - It contains your local configuration and should be in `.gitignore`
2. **Use different configs for different environments** - Development, staging, and production should have separate configurations
3. **Rotate secrets regularly** - If using API keys or secrets, rotate them periodically
4. **Limit variable scope** - Only use `NEXT_PUBLIC_` prefix for variables that need to be exposed to the browser
5. **Validate URLs** - Ensure all URLs use the correct protocol (http/https, ws/wss)

## Production Deployment

For production deployment:

1. Set environment variables in your hosting platform (Vercel, Netlify, Docker, etc.)
2. Use production-specific values for all URLs
3. Enable security features (Sentry, analytics)
4. Set log level to `error` or `warn`
5. Disable console logging: `NEXT_PUBLIC_ENABLE_CONSOLE_LOGGING=false`
6. Use HTTPS and WSS protocols for all URLs

## Additional Resources

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [Backend API Documentation](../dashboard_api/README.md)
- [Audit Report](../Audit_report.md)
