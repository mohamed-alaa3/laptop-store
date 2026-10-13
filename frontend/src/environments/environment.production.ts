export const environment = {
  production: true,
  apiUrl: 'https://laptop-store-production-b250.up.railway.app/api',
  whatsappNumber: '201008150149',
} as const;

export type Environment = typeof environment;
