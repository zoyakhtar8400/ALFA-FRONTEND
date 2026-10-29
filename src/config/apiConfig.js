// ----------------------------------------------------------------------------
// ALFA SOFTWARE — Dynamic Server & API Configuration
// ----------------------------------------------------------------------------

export const getServerUrl = () => {
  let stored = null;
  try {
    stored = localStorage.getItem('alfa_server_url');
  } catch (e) {}
  let url = stored || import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000';
  if (!/^https?:\/\//i.test(url)) {
    url = `http://${url}`;
  }
  return url.replace(/\/+$/, '');
};

export const getBaseUrl = () => {
  return `${getServerUrl()}/api`;
};

export const getSocketUrl = () => {
  return getServerUrl();
};

export const BASE_URL = getBaseUrl();
export const SOCKET_URL = getSocketUrl();

export default {
  getServerUrl,
  getBaseUrl,
  getSocketUrl,
  BASE_URL,
  SOCKET_URL
};
