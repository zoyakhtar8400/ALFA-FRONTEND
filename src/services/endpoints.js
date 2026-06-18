export const ENDPOINTS = {
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_BOOKINGS: '/dashboard/recent-bookings',
  },
  ROOMS: {
    LIST: '/rooms',
    DETAIL: (id) => `/rooms/${id}`,
    CREATE: '/rooms',
    UPDATE: (id) => `/rooms/${id}`,
    DELETE: (id) => `/rooms/${id}`,
  },
  BOOKINGS: {
    LIST: '/bookings',
    DETAIL: (id) => `/bookings/${id}`,
    CREATE: '/bookings',
    UPDATE: (id) => `/bookings/${id}`,
    DELETE: (id) => `/bookings/${id}`,
  },
  GUESTS: {
    LIST: '/guests',
    DETAIL: (id) => `/guests/${id}`,
    CREATE: '/guests',
    UPDATE: (id) => `/guests/${id}`,
  },
  STAFF: {
    LIST: '/staff',
    DETAIL: (id) => `/staff/${id}`,
    CREATE: '/staff',
    UPDATE: (id) => `/staff/${id}`,
  },
  BILLING: {
    LIST: '/billing',
    DETAIL: (id) => `/billing/${id}`,
    CREATE: '/billing',
  },
};
