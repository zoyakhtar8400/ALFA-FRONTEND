/**
 * ============================================================================
 * ALFA HMS – Centralized API & Server Environment Configuration
 * ============================================================================
 * This is the SINGLE SOURCE OF TRUTH for the backend API and Socket server URLs.
 *
 * To switch between Local and Production/Live environments:
 * 1. Comment out the active environment block below.
 * 2. Uncomment the desired environment block below.
 * No other files require modification.
 */

// ----------------------------------------------------------------------------
// 1. LOCAL DEVELOPMENT BACKEND (ACTIVE)
// ----------------------------------------------------------------------------
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

// ----------------------------------------------------------------------------
// 2. PRODUCTION / LIVE BACKEND (UNCOMMENT TO DEPLOY)
// ----------------------------------------------------------------------------
// export const BASE_URL = "https://api.alfahms.com/api";
// export const SOCKET_URL = "https://api.alfahms.com";

export default {
  BASE_URL,
  SOCKET_URL,
};
