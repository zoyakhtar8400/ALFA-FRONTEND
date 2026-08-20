
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
