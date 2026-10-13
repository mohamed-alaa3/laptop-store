export const environment = {
  production: true,
  apiUrl: 'laptop-store-production-b250.up.railway.app', // ← غيّره وقت النشر
  whatsappNumber: '201008150149',
} as const;

export type Environment = typeof environment;
