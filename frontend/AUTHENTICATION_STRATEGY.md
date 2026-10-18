# Authentication Strategy Documentation

## Overview

This document explains the authentication strategy implemented in the King Search Dashboard frontend, including the trade-offs made and the reasoning behind them.

## Current Implementation

### Token Storage Strategy

**Storage Mechanism:** localStorage with Remember Me feature

**Rationale:**

- **Refresh Token Support:** Modern JWT-based authentication requires refresh tokens to work properly. Refresh tokens need to persist across page refreshes and tab refreshes to maintain the user session without requiring re-authentication.
- **Session Persistence:** Using localStorage allows the session to persist across browser restarts when "Remember Me" is enabled, providing a better user experience.
- **Token Refresh Flow:** The API client interceptor automatically refreshes tokens when they expire (401 responses). This requires the refresh token to be available in storage.

### Remember Me Feature

**Implementation:**

- **Default:** `rememberMe = false` (more secure by default)
- **When disabled:** Tokens are stored in localStorage but session is cleared on browser close via merge logic
- **When enabled:** Tokens persist in localStorage across browser sessions

**Security Trade-offs:**

| Aspect | Remember Me = false | Remember Me = true |
| -------- | ------------------- | ------------------- |
| **Security** | More secure - session cleared on browser close | Less secure - tokens persist after browser close |
| **User Experience** | Must re-login after closing browser | Stays logged in across sessions |
| **Risk** | Lower risk of token theft if device is compromised | Higher risk if device is left unattended |
| **Best For** | Shared/public devices, high-security environments | Personal devices, trusted environments |

**Merge Logic (auth.store.ts):**

```typescript
merge: (persistedState, currentState) => {
  const rememberMe = persisted.rememberMe ?? false;
  
  // If rememberMe was false and the browser was closed, clear the session
  if (!rememberMe && !currentState.isAuthenticated) {
    return {
      ...currentState,
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      rememberMe: false,
    };
  }
  
  // Otherwise restore the session
  return { ...currentState, user, token, refreshToken, isAuthenticated, rememberMe };
}
```

## Middleware Authentication Strategy

Current Implementation

**Strategy:** No server-side authentication checks in middleware.ts

**Rationale (from middleware.ts comments):**

```AUTH STRATEGY CHOICE (per .windsurfrules Section 8.8):
──────────────────────────────────────────────────────────────────────
CHOICE (b): middleware.ts performs NO auth-presence redirect at all and
relies solely on ProtectedRoute's client-side check, accepting a one-frame
flash of protected layout before redirect on an unauthenticated hard navigation.

RATIONALE:
- This project uses memory-only token storage (no cookie, no localStorage)
- Next.js Edge Middleware intercepts full-page browser navigations, which
  never carry a custom Authorization header
- Therefore, middleware.ts has NO reliable way to observe "is this user
  authenticated" on a hard navigation or page refresh using a Bearer-header
  check alone
- Implementing a header-only check would redirect every legitimately-
  authenticated user on every hard refresh of a protected route

CONSEQUENCE:
- Users may see a one-frame flash of protected layout before client-side
  ProtectedRoute redirects unauthenticated users to /login
- This is an acceptable trade-off for correct memory-only token storage
──────────────────────────────────────────────────────────────────────
```

### Why Not Cookies?

**Alternative Considered:** Cookie-based authentication (httpOnly cookies)

**Pros of Cookies:**

- Middleware can authenticate requests via cookies
- Automatic CSRF protection
- No JavaScript access to tokens (more secure)
- Works with middleware auth checks

**Cons of Cookies:**

- Requires backend to set httpOnly cookies
- More complex to implement refresh token rotation
- Harder to handle multiple sessions (same user on multiple devices)
- Requires CORS configuration for cookie sharing
- Cannot easily have "Remember Me" without additional complexity

**Decision:** Stick with Bearer token + localStorage for:

- Simpler implementation
- Better control over token lifecycle
- Easier to implement refresh token rotation
- Works well with existing backend API design
- "Remember Me" feature is straightforward

### Content Flash Mitigation

**Problem:** One-frame flash of protected content before redirect

**Solutions Implemented:**

1. **Loading State in page.tsx:**
   - Shows `LoadingSpinner` while auth state hydrates
   - Never renders dashboard content directly

2. **Loading State in ProtectedRoute.tsx:**
   - Shows `LoadingSpinner` while auth state is hydrating
   - Prevents flash of "Access Denied" state

3. **Root Page Redirect:**
   - Neutral loading state during redirect decision
   - Clear separation between authenticated and unauthenticated paths

**Acceptable Trade-off:**

- The flash is minimal (one frame)
- Only occurs on hard navigation or page refresh
- Normal navigation (SPA transitions) doesn't have this issue
- Most users won't notice it in practice

## Security Considerations

### Token Security

**Storage:**

- Tokens stored in localStorage (accessible to JavaScript)
- Mitigated by:
  - HTTPS in production (prevents MITM)
  - Short-lived access tokens (configurable expiration)
  - Refresh token rotation on each refresh
  - Tokens cleared on logout

**Token Lifecycle:**

```Login → Access Token (24h) + Refresh Token (7 days)
↓
Access Token expires → Automatic refresh via API client
↓
Refresh Token expires → Re-authentication required
```

### CSRF Protection

**Current Status:** No CSRF protection implemented

**Mitigation:**

- API expects Bearer token in Authorization header
- Tokens are not exposed in URLs
- SameSite cookies can be added in future if needed

**Future Enhancement:** Consider adding CSRF tokens for state-changing operations if needed.

### XSS Protection

**Mitigations:**

- Next.js provides built-in XSS protection
- React sanitizes content by default
- Tokens are stored as strings, not in DOM
- Content Security Policy headers configured in next.config.js

## Refresh Token Flow

### Automatic Token Refresh

**Implementation (api-client.ts):**

```typescript
// Shared 401 refresh queue - concurrent 401s trigger exactly ONE refresh
let refreshPromise: Promise<void> | null = null;
let isRefreshing = false;

// Response interceptor - handle 401 with shared queue
if (error.response?.status === 401) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = this.refreshToken().finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  }

  try {
    await refreshPromise;
    // Retry original request with new token
    const token = useAuthStore.getState().token;
    error.config.headers.Authorization = `Bearer ${token}`;
    return clientToUse.request(error.config!);
  } catch {
    // Refresh failed - clear auth state and redirect to login
    useAuthStore.getState().clearSession();
    pushErrorToast('Session Expired', 'Please log in again.');
    return Promise.reject(apiError);
  }
}
```

**Benefits:**

- Single refresh for concurrent 401 errors
- Automatic retry of failed request
- Seamless user experience
- No manual re-authentication required

## Configuration

### Environment Variables

**Related Authentication Settings:**

```bash
# JWT Configuration
NEXT_PUBLIC_JWT_EXPIRATION_HOURS=24
NEXT_PUBLIC_JWT_REFRESH_GRACE_DAYS=7
```

**Backend Configuration (dashboard_api/config.py):**

```python
JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production").strip()
JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS: int = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
JWT_LEEWAY_SECONDS: int = int(os.getenv("JWT_LEEWAY_SECONDS", "60"))
JWT_REFRESH_GRACE_DAYS: int = int(os.getenv("JWT_REFRESH_GRACE_DAYS", "7"))
```

## Migration Path

### From Session-Only to Remember Me

**Previous Implementation:**

- Used sessionStorage only
- Tokens lost on browser tab close
- No way to persist across sessions

**New Implementation:**

- Uses localStorage with Remember Me flag
- Tokens persist across sessions when enabled
- Backward compatible (default is more secure)

**Migration for Existing Users:**

- Existing users will have no `rememberMe` in persisted state
- Defaults to `false` (more secure)
- Users must opt-in to "Remember Me" on next login

## Best Practices

### For Users

1. **Shared/Public Devices:**
   - Do NOT enable "Remember Me"
   - Always log out when done
   - Clear browser data after use

2. **Personal Devices:**
   - Can enable "Remember Me" for convenience
   - Still good practice to log out periodically
   - Use device lock/biometric authentication

3. **Security Best Practices:**
   - Use strong, unique passwords
   - Enable MFA when available
   - Report suspicious activity
   - Keep browser and OS updated

### For Developers

1. **Never Log Tokens:**
   - Tokens should never appear in logs
   - Mask tokens in error messages
   - Use debug logging carefully

2. **Validate on Every Request:**
   - Always check token validity
   - Handle token expiration gracefully
   - Clear invalid tokens immediately

3. **Secure Storage:**
   - Only store in localStorage (not in cookies for now)
   - Clear on logout
   - Don't expose in URLs or query params

## Future Enhancements

### Potential Improvements

1. **Biometric Authentication:**
   - WebAuthn/FIDO2 support
   - Hardware security keys
   - Better security than passwords

2. **Multi-Factor Authentication:**
   - Currently optional MFA token
   - Could make MFA mandatory for certain roles
   - TOTP (Time-based One-Time Password)

3. **Session Management:**
   - Show active sessions
   - Allow remote logout
   - Session timeout inactivity timer

4. **Security Headers:**
   - Add Content-Security-Policy
   - Add X-Content-Type-Options
   - Add X-Frame-Options (already in next.config.js)

5. **Rate Limiting:**
   - Login attempt rate limiting
   - Brute force protection
   - Account lockout after failed attempts

## References

- [Next.js Authentication Documentation](https://nextjs.org/docs/authentication)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Zustand Persistence Middleware](https://docs.pmnd.rs/zustand/guides/persisting-data)

## Changes Log

### 2026-10-18

- Added Remember Me feature to auth.store.ts
- Updated LoginForm to include Remember Me checkbox
- Updated useAuth hook to handle Remember Me parameter
- Improved loading states in page.tsx and ProtectedRoute.tsx
- Documented authentication strategy trade-offs
