import axios from 'axios';

let tokenProvider: (() => Promise<string | null> | string | null) | null = null;

export const configureApiAuth = (provider: typeof tokenProvider) => {
  tokenProvider = provider;
};

const api = axios.create({
  baseURL: 'https://api.your-backend.com',
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  if (tokenProvider) {
    const token = await tokenProvider();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // TODO: implementar refresh token e redirecionar para login quando necessário.
      console.warn('Token expirado - redirecionar para login.');
    }
    return Promise.reject(error);
  }
);

export default api;
